import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc
from app.database import get_db
from app.models.activity import Activity
from app.models.user import User, UserProfile
from app.models.gamification import XPTransaction, UserReward
from app.models.social import Post
from app.schemas.activity import (
    ActivityCreate,
    ActivityUpdate,
    ActivityResponse,
    ActivitySummaryStats,
)
from app.services.xp_engine import (
    calculate_activity_rewards,
    calculate_level,
    evaluate_streak,
)
from app.services.badge_service import check_and_award_badges
from app.services.challenge_service import update_challenges_for_activity
from app.services.notification_service import create_notification
from app.dependencies import get_current_user

router = APIRouter(prefix="/activities", tags=["Fitness Activities"])

@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    req: ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.flush()

    activity_dt = req.activity_date or datetime.datetime.utcnow()
    activity_day = activity_dt.date()

    # 1. Calculate Activity XP, FitCoins & Calories
    rewards = calculate_activity_rewards(
        activity_type=req.activity_type,
        duration_minutes=req.duration_minutes,
        distance_km=req.distance_km or 0.0,
        intensity=req.intensity or "medium",
        custom_calories=req.calories_burned or 0
    )

    activity = Activity(
        user_id=current_user.id,
        activity_type=req.activity_type.lower(),
        title=req.title,
        duration_minutes=req.duration_minutes,
        distance_km=req.distance_km or 0.0,
        calories_burned=rewards["calories"],
        xp_earned=rewards["xp"],
        coins_earned=rewards["coins"],
        intensity=req.intensity or "medium",
        activity_date=activity_dt,
        notes=req.notes
    )
    db.add(activity)
    db.flush()

    # 2. Evaluate and update Streak
    new_streak, streak_xp, streak_coins, is_new_streak_day = evaluate_streak(
        last_date=profile.last_activity_date,
        current_date=activity_day,
        current_streak=profile.current_streak
    )

    streak_info = {
        "current_streak": new_streak,
        "bonus_xp": streak_xp,
        "bonus_coins": streak_coins,
        "is_extended": is_new_streak_day
    }

    profile.current_streak = new_streak
    if new_streak > profile.longest_streak:
        profile.longest_streak = new_streak
    profile.last_activity_date = activity_day

    # 3. Add Activity XP and Coins to User Profile
    total_new_xp = rewards["xp"] + streak_xp
    total_new_coins = rewards["coins"] + streak_coins

    profile.total_xp += total_new_xp
    profile.coins += total_new_coins
    
    old_level = profile.level
    new_level = calculate_level(profile.total_xp)
    profile.level = new_level

    # 4. Log XP Transactions
    act_tx = XPTransaction(
        user_id=current_user.id,
        amount=rewards["xp"],
        action="activity_completed",
        reference_id=activity.id,
        description=f"Logged {activity.activity_type.capitalize()}: {activity.title}"
    )
    db.add(act_tx)

    if streak_xp > 0:
        streak_tx = XPTransaction(
            user_id=current_user.id,
            amount=streak_xp,
            action="streak_bonus",
            reference_id=activity.id,
            description=f"{new_streak}-day streak bonus reward!"
        )
        db.add(streak_tx)

    # 5. Handle Level Up Notification
    if new_level > old_level:
        create_notification(
            db=db,
            user_id=current_user.id,
            type="level_up",
            title=f"🎉 Level Up! You reached Level {new_level}!",
            message=f"Outstanding dedication! Your fitness rank increased to Level {new_level}.",
            link="/profile"
        )

    # 6. Auto-publish to social feed if requested
    if req.publish_to_feed:
        post = Post(
            user_id=current_user.id,
            activity_id=activity.id,
            content=f"Crushed a {activity.duration_minutes}-minute {activity.activity_type} workout! Earned +{rewards['xp']} XP." + (f" Note: {activity.notes}" if activity.notes else "")
        )
        db.add(post)

    db.commit()
    db.refresh(activity)

    # 7. Update Enrolled Challenges
    update_challenges_for_activity(db=db, activity=activity)

    # 8. Check and Award Badges
    unlocked_badges = check_and_award_badges(db=db, user_id=current_user.id)

    res = ActivityResponse.model_validate(activity)
    res.unlocked_badges = unlocked_badges
    res.streak_updated = streak_info
    return res

@router.get("", response_model=List[ActivityResponse])
def get_activities(
    activity_type: Optional[str] = None,
    sort: Optional[str] = "desc",
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Activity).filter(Activity.user_id == current_user.id)

    if activity_type and activity_type != "all":
        query = query.filter(Activity.activity_type == activity_type.lower())

    if sort == "asc":
        query = query.order_by(asc(Activity.activity_date))
    else:
        query = query.order_by(desc(Activity.activity_date))

    activities = query.offset(skip).limit(limit).all()
    return activities

@router.get("/stats", response_model=ActivitySummaryStats)
def get_activity_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activities = db.query(Activity).filter(Activity.user_id == current_user.id).all()

    total_activities = len(activities)
    total_duration = sum(a.duration_minutes for a in activities)
    total_distance = sum(a.distance_km for a in activities)
    total_calories = sum(a.calories_burned for a in activities)
    total_xp = sum(a.xp_earned for a in activities)

    breakdown = {}
    for a in activities:
        atype = a.activity_type.capitalize()
        breakdown[atype] = breakdown.get(atype, 0) + 1

    return ActivitySummaryStats(
        total_activities=total_activities,
        total_duration_minutes=total_duration,
        total_distance_km=round(total_distance, 2),
        total_calories_burned=total_calories,
        total_xp_earned=total_xp,
        breakdown_by_type=breakdown
    )

@router.get("/{activity_id}", response_model=ActivityResponse)
def get_activity(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    act = db.query(Activity).filter(Activity.id == activity_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found.")
    
    # Ownership or public profile check
    if act.user_id != current_user.id:
        user = db.query(User).filter(User.id == act.user_id).first()
        if not user or not user.profile or not user.profile.is_public:
            raise HTTPException(status_code=403, detail="You do not have permission to view this activity.")

    return act

@router.put("/{activity_id}", response_model=ActivityResponse)
def update_activity(
    activity_id: int,
    req: ActivityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    act = db.query(Activity).filter(Activity.id == activity_id, Activity.user_id == current_user.id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found or you do not own it.")

    if req.title is not None:
        act.title = req.title
    if req.intensity is not None:
        act.intensity = req.intensity
    if req.notes is not None:
        act.notes = req.notes
    if req.duration_minutes is not None:
        act.duration_minutes = req.duration_minutes
    if req.distance_km is not None:
        act.distance_km = req.distance_km
    if req.calories_burned is not None:
        act.calories_burned = req.calories_burned

    # Recalculate rewards if duration or distance changed
    if req.duration_minutes is not None or req.distance_km is not None:
        rewards = calculate_activity_rewards(
            activity_type=act.activity_type,
            duration_minutes=act.duration_minutes,
            distance_km=act.distance_km,
            intensity=act.intensity,
            custom_calories=act.calories_burned
        )
        act.xp_earned = rewards["xp"]
        act.coins_earned = rewards["coins"]
        act.calories_burned = rewards["calories"]

    db.commit()
    db.refresh(act)
    return act

@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    act = db.query(Activity).filter(Activity.id == activity_id, Activity.user_id == current_user.id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found or you do not own it.")

    db.delete(act)
    db.commit()
    return None

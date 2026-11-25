import datetime
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.activity import Activity
from app.models.user import User, UserProfile, FitnessGoal
from app.models.gamification import ChallengeParticipant, Challenge, UserBadge, XPTransaction
from app.services.xp_engine import get_level_progress
from app.dependencies import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics & Progress"])

@router.get("/dashboard", response_model=Dict[str, Any])
def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    now = datetime.datetime.utcnow()
    today_date = now.date()
    start_of_today = datetime.datetime.combine(today_date, datetime.time.min)

    # 1. Today's stats
    today_activities = (
        db.query(Activity)
        .filter(Activity.user_id == current_user.id, Activity.activity_date >= start_of_today)
        .all()
    )
    today_minutes = sum(a.duration_minutes for a in today_activities)
    today_calories = sum(a.calories_burned for a in today_activities)
    today_distance = sum(a.distance_km for a in today_activities)
    today_xp = sum(a.xp_earned for a in today_activities)

    # 2. Past 7 days daily breakdown for charts
    seven_days_ago = today_date - datetime.timedelta(days=6)
    recent_activities = (
        db.query(Activity)
        .filter(
            Activity.user_id == current_user.id,
            Activity.activity_date >= datetime.datetime.combine(seven_days_ago, datetime.time.min)
        )
        .all()
    )

    daily_chart = []
    day_map = {seven_days_ago + datetime.timedelta(days=i): {"minutes": 0, "calories": 0, "xp": 0, "distance": 0.0} for i in range(7)}
    for act in recent_activities:
        act_d = act.activity_date.date()
        if act_d in day_map:
            day_map[act_d]["minutes"] += act.duration_minutes
            day_map[act_d]["calories"] += act.calories_burned
            day_map[act_d]["xp"] += act.xp_earned
            day_map[act_d]["distance"] += act.distance_km

    for d, data in sorted(day_map.items()):
        daily_chart.append({
            "date": d.strftime("%a %d"),
            "full_date": str(d),
            "minutes": data["minutes"],
            "calories": data["calories"],
            "xp": data["xp"],
            "distance": round(data["distance"], 1)
        })

    # 3. Overall activities count & totals
    all_activities = db.query(Activity).filter(Activity.user_id == current_user.id).all()
    total_minutes = sum(a.duration_minutes for a in all_activities)
    total_calories = sum(a.calories_burned for a in all_activities)
    total_distance = sum(a.distance_km for a in all_activities)

    type_counts = {}
    for a in all_activities:
        t = a.activity_type.capitalize()
        type_counts[t] = type_counts.get(t, 0) + 1

    type_breakdown = [{"name": k, "value": v} for k, v in type_counts.items()]

    # 4. Active enrolled challenges
    participations = (
        db.query(ChallengeParticipant)
        .join(Challenge, ChallengeParticipant.challenge_id == Challenge.id)
        .filter(
            ChallengeParticipant.user_id == current_user.id,
            Challenge.is_active == True,
            Challenge.end_date >= now
        )
        .limit(4)
        .all()
    )
    active_challenges = []
    for p in participations:
        c = p.challenge
        pct = min(100.0, round((p.current_progress / max(1.0, c.target_value)) * 100, 1))
        active_challenges.append({
            "id": c.id,
            "title": c.title,
            "challenge_type": c.challenge_type,
            "target_type": c.target_type,
            "target_value": c.target_value,
            "current_progress": round(p.current_progress, 1),
            "percentage": pct,
            "is_completed": p.is_completed,
            "xp_reward": c.xp_reward,
            "end_date": c.end_date.strftime("%b %d")
        })

    # 5. Recent 5 activities
    recent_five = (
        db.query(Activity)
        .filter(Activity.user_id == current_user.id)
        .order_by(Activity.activity_date.desc())
        .limit(5)
        .all()
    )
    recent_five_data = [
        {
            "id": a.id,
            "title": a.title,
            "activity_type": a.activity_type,
            "duration_minutes": a.duration_minutes,
            "distance_km": a.distance_km,
            "calories_burned": a.calories_burned,
            "xp_earned": a.xp_earned,
            "activity_date": a.activity_date.strftime("%b %d, %H:%M")
        }
        for a in recent_five
    ]

    # 6. Badges count
    badges_count = db.query(func.count(UserBadge.id)).filter(UserBadge.user_id == current_user.id).scalar() or 0

    return {
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "username": current_user.username,
            "level": profile.level if profile else 1,
            "total_xp": profile.total_xp if profile else 0,
            "coins": profile.coins if profile else 0,
            "current_streak": profile.current_streak if profile else 0,
            "longest_streak": profile.longest_streak if profile else 0,
            "level_progress": get_level_progress(profile.total_xp if profile else 0),
            "badges_count": badges_count
        },
        "today": {
            "activities_count": len(today_activities),
            "minutes": today_minutes,
            "calories": today_calories,
            "distance": round(today_distance, 1),
            "xp": today_xp,
            "step_goal": profile.daily_step_goal if profile else 8000,
            "calorie_goal": profile.daily_calorie_goal if profile else 500,
            "minutes_goal": profile.daily_active_minutes_goal if profile else 45
        },
        "totals": {
            "activities": len(all_activities),
            "minutes": total_minutes,
            "calories": total_calories,
            "distance_km": round(total_distance, 1)
        },
        "weekly_chart": daily_chart,
        "type_breakdown": type_breakdown,
        "active_challenges": active_challenges,
        "recent_activities": recent_five_data
    }

@router.get("/xp-trends")
def get_xp_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cumulative XP progression over the last 30 days.
    """
    thirty_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    txs = (
        db.query(XPTransaction)
        .filter(XPTransaction.user_id == current_user.id, XPTransaction.created_at >= thirty_days_ago)
        .order_by(XPTransaction.created_at.asc())
        .all()
    )

    timeline = []
    running_xp = 0
    date_group = {}
    for tx in txs:
        d = tx.created_at.date().strftime("%b %d")
        date_group[d] = date_group.get(d, 0) + tx.amount

    for d, amt in date_group.items():
        running_xp += amt
        timeline.append({"date": d, "xp_gain": amt, "cumulative_xp": running_xp})

    return timeline

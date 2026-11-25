from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.database import get_db
from app.models.user import User, UserProfile, FitnessGoal
from app.models.gamification import UserBadge
from app.models.activity import Activity
from app.models.social import Friendship, Follow
from app.schemas.user import (
    UserProfileResponse,
    UserProfileUpdate,
    FitnessGoalCreate,
    FitnessGoalUpdate,
    FitnessGoalResponse,
    UserSummary
)
from app.services.xp_engine import get_level_progress
from app.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users & Profiles"])

@router.get("/profile", response_model=UserProfileResponse)
def get_own_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    badges_count = db.query(func.count(UserBadge.id)).filter(UserBadge.user_id == current_user.id).scalar() or 0
    activities_count = db.query(func.count(Activity.id)).filter(Activity.user_id == current_user.id).scalar() or 0

    return UserProfileResponse(
        id=profile.id,
        user_id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        role=current_user.role,
        bio=profile.bio,
        avatar_url=profile.avatar_url,
        fitness_level=profile.fitness_level,
        preferred_activities=profile.preferred_activities,
        daily_step_goal=profile.daily_step_goal,
        daily_calorie_goal=profile.daily_calorie_goal,
        daily_active_minutes_goal=profile.daily_active_minutes_goal,
        weekly_workout_goal=profile.weekly_workout_goal,
        is_public=profile.is_public,
        total_xp=profile.total_xp,
        level=profile.level,
        coins=profile.coins,
        current_streak=profile.current_streak,
        longest_streak=profile.longest_streak,
        last_activity_date=profile.last_activity_date,
        level_progress=get_level_progress(profile.total_xp),
        badges_count=badges_count,
        activities_count=activities_count
    )

@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    req: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    for field, val in req.dict(exclude_unset=True).items():
        setattr(profile, field, val)

    db.commit()
    db.refresh(profile)

    badges_count = db.query(func.count(UserBadge.id)).filter(UserBadge.user_id == current_user.id).scalar() or 0
    activities_count = db.query(func.count(Activity.id)).filter(Activity.user_id == current_user.id).scalar() or 0

    return UserProfileResponse(
        id=profile.id,
        user_id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        role=current_user.role,
        bio=profile.bio,
        avatar_url=profile.avatar_url,
        fitness_level=profile.fitness_level,
        preferred_activities=profile.preferred_activities,
        daily_step_goal=profile.daily_step_goal,
        daily_calorie_goal=profile.daily_calorie_goal,
        daily_active_minutes_goal=profile.daily_active_minutes_goal,
        weekly_workout_goal=profile.weekly_workout_goal,
        is_public=profile.is_public,
        total_xp=profile.total_xp,
        level=profile.level,
        coins=profile.coins,
        current_streak=profile.current_streak,
        longest_streak=profile.longest_streak,
        last_activity_date=profile.last_activity_date,
        level_progress=get_level_progress(profile.total_xp),
        badges_count=badges_count,
        activities_count=activities_count
    )

@router.get("/search", response_model=List[UserSummary])
def search_users(
    q: str = Query(..., min_length=1),
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    search_term = f"%{q.lower()}%"
    users = (
        db.query(User)
        .join(UserProfile)
        .filter(
            User.id != current_user.id,
            User.is_active == True,
            or_(
                func.lower(User.username).like(search_term),
                func.lower(User.full_name).like(search_term)
            )
        )
        .limit(limit)
        .all()
    )

    # Get friendship & follow relations for current user
    friendships = db.query(Friendship).filter(
        or_(
            (Friendship.requester_id == current_user.id),
            (Friendship.addressee_id == current_user.id)
        )
    ).all()
    friendship_map = {}
    for f in friendships:
        other_id = f.addressee_id if f.requester_id == current_user.id else f.requester_id
        friendship_map[other_id] = f.status

    follows = db.query(Follow).filter(Follow.follower_id == current_user.id).all()
    following_ids = {f.followed_id for f in follows}

    results = []
    for u in users:
        p = u.profile
        results.append(UserSummary(
            id=u.id,
            username=u.username,
            full_name=u.full_name,
            avatar_url=p.avatar_url if p else None,
            level=p.level if p else 1,
            total_xp=p.total_xp if p else 0,
            current_streak=p.current_streak if p else 0,
            is_following=u.id in following_ids,
            friendship_status=friendship_map.get(u.id)
        ))

    return results

@router.get("/{user_id}", response_model=UserProfileResponse)
def get_user_public_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    profile = user.profile
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not initialized.")

    if not profile.is_public and user.id != current_user.id:
        # Check if friends
        is_friend = db.query(Friendship).filter(
            or_(
                (Friendship.requester_id == current_user.id) & (Friendship.addressee_id == user.id),
                (Friendship.requester_id == user.id) & (Friendship.addressee_id == current_user.id)
            ),
            Friendship.status == "accepted"
        ).first() is not None
        if not is_friend:
            raise HTTPException(status_code=403, detail="This user's profile is set to private.")

    badges_count = db.query(func.count(UserBadge.id)).filter(UserBadge.user_id == user.id).scalar() or 0
    activities_count = db.query(func.count(Activity.id)).filter(Activity.user_id == user.id).scalar() or 0

    return UserProfileResponse(
        id=profile.id,
        user_id=user.id,
        email=user.email if user.id == current_user.id else "hidden@fitquest.local",
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        bio=profile.bio,
        avatar_url=profile.avatar_url,
        fitness_level=profile.fitness_level,
        preferred_activities=profile.preferred_activities,
        daily_step_goal=profile.daily_step_goal,
        daily_calorie_goal=profile.daily_calorie_goal,
        daily_active_minutes_goal=profile.daily_active_minutes_goal,
        weekly_workout_goal=profile.weekly_workout_goal,
        is_public=profile.is_public,
        total_xp=profile.total_xp,
        level=profile.level,
        coins=profile.coins,
        current_streak=profile.current_streak,
        longest_streak=profile.longest_streak,
        last_activity_date=profile.last_activity_date,
        level_progress=get_level_progress(profile.total_xp),
        badges_count=badges_count,
        activities_count=activities_count
    )

# Goals
@router.get("/goals/list", response_model=List[FitnessGoalResponse])
def get_fitness_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(FitnessGoal).filter(FitnessGoal.user_id == current_user.id).order_by(FitnessGoal.created_at.desc()).all()

@router.post("/goals/create", response_model=FitnessGoalResponse, status_code=status.HTTP_201_CREATED)
def create_fitness_goal(
    req: FitnessGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = FitnessGoal(
        user_id=current_user.id,
        title=req.title,
        goal_type=req.goal_type,
        target_value=req.target_value,
        unit=req.unit or "",
        target_date=req.target_date,
        current_value=0.0,
        is_completed=False
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

@router.put("/goals/{goal_id}", response_model=FitnessGoalResponse)
def update_fitness_goal(
    goal_id: int,
    req: FitnessGoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(FitnessGoal).filter(FitnessGoal.id == goal_id, FitnessGoal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found.")

    if req.current_value is not None:
        goal.current_value = req.current_value
        if goal.current_value >= goal.target_value:
            goal.is_completed = True
    if req.is_completed is not None:
        goal.is_completed = req.is_completed

    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fitness_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(FitnessGoal).filter(FitnessGoal.id == goal_id, FitnessGoal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found.")
    db.delete(goal)
    db.commit()
    return None

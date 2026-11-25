import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from app.database import get_db
from app.models.user import User, UserProfile
from app.models.activity import Activity
from app.models.gamification import UserBadge, XPTransaction
from app.models.social import Friendship
from app.schemas.gamification import LeaderboardEntry
from app.dependencies import get_current_user

router = APIRouter(prefix="/leaderboards", tags=["Competitions & Leaderboards"])

@router.get("", response_model=List[LeaderboardEntry])
def get_leaderboard(
    scope: str = Query("global", description="global or friends"),
    timeframe: str = Query("all_time", description="all_time, monthly, weekly"),
    activity_type: Optional[str] = "all",
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.datetime.utcnow()

    # Determine allowed user IDs based on scope
    allowed_user_ids = None
    if scope == "friends":
        friendships = db.query(Friendship).filter(
            or_(
                Friendship.requester_id == current_user.id,
                Friendship.addressee_id == current_user.id
            ),
            Friendship.status == "accepted"
        ).all()
        friend_ids = {
            f.addressee_id if f.requester_id == current_user.id else f.requester_id
            for f in friendships
        }
        friend_ids.add(current_user.id)
        allowed_user_ids = friend_ids

    # Timeframe filter condition
    time_filter = None
    if timeframe == "weekly":
        time_filter = now - datetime.timedelta(days=7)
    elif timeframe == "monthly":
        time_filter = now - datetime.timedelta(days=30)

    # If specific timeframe or activity type, aggregate from XP transactions / activities
    if time_filter or (activity_type and activity_type != "all"):
        query = (
            db.query(
                User.id.label("user_id"),
                User.username,
                User.full_name,
                UserProfile.avatar_url,
                UserProfile.level,
                UserProfile.current_streak,
                func.coalesce(func.sum(Activity.xp_earned), 0).label("period_xp"),
                func.count(Activity.id).label("activities_count")
            )
            .join(UserProfile, User.id == UserProfile.user_id)
            .outerjoin(Activity, Activity.user_id == User.id)
            .filter(User.is_active == True)
        )

        if allowed_user_ids is not None:
            query = query.filter(User.id.in_(allowed_user_ids))

        if time_filter:
            query = query.filter(or_(Activity.activity_date >= time_filter, Activity.activity_date == None))

        if activity_type and activity_type != "all":
            query = query.filter(or_(Activity.activity_type == activity_type.lower(), Activity.activity_type == None))

        rows = (
            query.group_by(User.id, User.username, User.full_name, UserProfile.avatar_url, UserProfile.level, UserProfile.current_streak)
            .order_by(desc("period_xp"), desc(UserProfile.level))
            .limit(limit)
            .all()
        )

        badge_counts = dict(
            db.query(UserBadge.user_id, func.count(UserBadge.id))
            .group_by(UserBadge.user_id)
            .all()
        )

        results = []
        for rank, row in enumerate(rows, start=1):
            results.append(LeaderboardEntry(
                rank=rank,
                user_id=row.user_id,
                username=row.username,
                full_name=row.full_name,
                avatar_url=row.avatar_url,
                level=row.level,
                total_xp=int(row.period_xp),
                current_streak=row.current_streak,
                activities_count=row.activities_count,
                badges_count=badge_counts.get(row.user_id, 0)
            ))
        return results

    else:
        # All time leaderboard: direct from UserProfile
        query = (
            db.query(User, UserProfile)
            .join(UserProfile, User.id == UserProfile.user_id)
            .filter(User.is_active == True)
        )

        if allowed_user_ids is not None:
            query = query.filter(User.id.in_(allowed_user_ids))

        users = query.order_by(desc(UserProfile.total_xp), desc(UserProfile.level)).limit(limit).all()

        act_counts = dict(
            db.query(Activity.user_id, func.count(Activity.id))
            .group_by(Activity.user_id)
            .all()
        )
        badge_counts = dict(
            db.query(UserBadge.user_id, func.count(UserBadge.id))
            .group_by(UserBadge.user_id)
            .all()
        )

        results = []
        for rank, (u, p) in enumerate(users, start=1):
            results.append(LeaderboardEntry(
                rank=rank,
                user_id=u.id,
                username=u.username,
                full_name=u.full_name,
                avatar_url=p.avatar_url,
                level=p.level,
                total_xp=p.total_xp,
                current_streak=p.current_streak,
                activities_count=act_counts.get(u.id, 0),
                badges_count=badge_counts.get(u.id, 0)
            ))
        return results

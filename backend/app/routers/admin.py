from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models.user import User, UserProfile
from app.models.activity import Activity
from app.models.gamification import Challenge, Badge, XPTransaction, UserBadge
from app.models.social import Post
from app.schemas.gamification import ChallengeCreate, ChallengeUpdate, ChallengeResponse
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/admin", tags=["Admin Management"])

@router.get("/stats")
def get_admin_system_stats(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
    total_activities = db.query(func.count(Activity.id)).scalar() or 0
    total_challenges = db.query(func.count(Challenge.id)).scalar() or 0
    total_posts = db.query(func.count(Post.id)).scalar() or 0
    total_xp = db.query(func.sum(UserProfile.total_xp)).scalar() or 0
    total_coins = db.query(func.sum(UserProfile.coins)).scalar() or 0
    total_badges_awarded = db.query(func.count(UserBadge.id)).scalar() or 0

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_activities": total_activities,
        "total_challenges": total_challenges,
        "total_posts": total_posts,
        "total_xp_awarded": total_xp,
        "total_coins_circulating": total_coins,
        "total_badges_awarded": total_badges_awarded
    }

@router.get("/users")
def get_admin_users(
    q: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    query = db.query(User).join(UserProfile)
    if q:
        search = f"%{q.lower()}%"
        query = query.filter((func.lower(User.email).like(search)) | (func.lower(User.username).like(search)))

    users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()

    results = []
    for u in users:
        p = u.profile
        results.append({
            "id": u.id,
            "email": u.email,
            "username": u.username,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at,
            "level": p.level if p else 1,
            "total_xp": p.total_xp if p else 0,
            "coins": p.coins if p else 0,
            "streak": p.current_streak if p else 0
        })

    return results

@router.put("/users/{user_id}/status")
def toggle_user_active_status(
    user_id: int,
    is_active: bool,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot alter your own active status.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.is_active = is_active
    db.commit()
    return {"message": f"User status set to {'active' if is_active else 'deactivated'}."}

@router.put("/users/{user_id}/role")
def set_user_role(
    user_id: int,
    role: str,  # "user" or "admin"
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role.")

    if role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.role = role
    db.commit()
    return {"message": f"User role updated to '{role}'."}

@router.post("/challenges", response_model=ChallengeResponse, status_code=status.HTTP_201_CREATED)
def admin_create_challenge(
    req: ChallengeCreate,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    challenge = Challenge(
        title=req.title,
        description=req.description,
        challenge_type=req.challenge_type,
        target_type=req.target_type,
        target_value=req.target_value,
        activity_type=req.activity_type.lower() if req.activity_type else None,
        xp_reward=req.xp_reward,
        coins_reward=req.coins_reward,
        badge_reward_id=req.badge_reward_id,
        start_date=req.start_date,
        end_date=req.end_date,
        is_active=True,
        created_by=admin.id
    )
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return ChallengeResponse.model_validate(challenge)

@router.put("/challenges/{challenge_id}", response_model=ChallengeResponse)
def admin_update_challenge(
    challenge_id: int,
    req: ChallengeUpdate,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found.")

    for field, val in req.dict(exclude_unset=True).items():
        setattr(challenge, field, val)

    db.commit()
    db.refresh(challenge)
    return ChallengeResponse.model_validate(challenge)

@router.delete("/challenges/{challenge_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_challenge(
    challenge_id: int,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found.")

    db.delete(challenge)
    db.commit()
    return None

@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_moderate_post(
    post_id: int,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    db.delete(post)
    db.commit()
    return None

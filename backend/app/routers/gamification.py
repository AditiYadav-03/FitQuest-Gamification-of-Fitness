from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.gamification import Badge, UserBadge, XPTransaction
from app.models.user import User, UserProfile
from app.schemas.gamification import BadgeResponse, XPTransactionResponse
from app.services.xp_engine import get_level_progress
from app.dependencies import get_current_user

router = APIRouter(prefix="/gamification", tags=["Gamification Engine"])

@router.get("/badges", response_model=List[BadgeResponse])
def get_all_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    badges = db.query(Badge).all()
    user_badges = {
        ub.badge_id: ub.earned_at
        for ub in db.query(UserBadge).filter(UserBadge.user_id == current_user.id).all()
    }

    results = []
    for b in badges:
        is_earned = b.id in user_badges
        results.append(BadgeResponse(
            id=b.id,
            slug=b.slug,
            name=b.name,
            description=b.description,
            icon=b.icon,
            category=b.category,
            tier=b.tier,
            xp_bonus=b.xp_bonus,
            coins_bonus=b.coins_bonus,
            requirement_type=b.requirement_type,
            requirement_value=b.requirement_value,
            is_earned=is_earned,
            earned_at=user_badges.get(b.id)
        ))

    return results

@router.get("/transactions", response_model=List[XPTransactionResponse])
def get_xp_transactions(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    txs = (
        db.query(XPTransaction)
        .filter(XPTransaction.user_id == current_user.id)
        .order_by(XPTransaction.created_at.desc())
        .limit(limit)
        .all()
    )
    return txs

@router.get("/progress")
def get_current_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    total_xp = profile.total_xp if profile else 0
    return get_level_progress(total_xp)

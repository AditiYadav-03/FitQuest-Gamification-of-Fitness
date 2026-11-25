import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.gamification import Challenge, ChallengeParticipant, XPTransaction, UserReward
from app.models.user import User, UserProfile
from app.schemas.gamification import ChallengeResponse
from app.services.notification_service import create_notification
from app.services.xp_engine import calculate_level
from app.dependencies import get_current_user

router = APIRouter(prefix="/challenges", tags=["Challenges"])

@router.get("", response_model=List[ChallengeResponse])
def get_challenges(
    challenge_type: Optional[str] = None,
    filter_status: Optional[str] = "all",  # all, joined, available, completed
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Challenge).filter(Challenge.is_active == True)
    if challenge_type and challenge_type != "all":
        query = query.filter(Challenge.challenge_type == challenge_type.lower())

    challenges = query.order_by(Challenge.end_date.asc()).all()

    # Get user participations
    participations = {
        cp.challenge_id: cp
        for cp in db.query(ChallengeParticipant).filter(ChallengeParticipant.user_id == current_user.id).all()
    }

    # Count participants
    counts = dict(
        db.query(ChallengeParticipant.challenge_id, func.count(ChallengeParticipant.id))
        .group_by(ChallengeParticipant.challenge_id)
        .all()
    )

    results = []
    for c in challenges:
        part = participations.get(c.id)
        is_joined = part is not None
        current_progress = part.current_progress if part else 0.0
        is_completed = part.is_completed if part else False
        reward_claimed = part.reward_claimed if part else False

        if filter_status == "joined" and not is_joined:
            continue
        if filter_status == "available" and is_joined:
            continue
        if filter_status == "completed" and not is_completed:
            continue

        results.append(ChallengeResponse(
            id=c.id,
            title=c.title,
            description=c.description,
            challenge_type=c.challenge_type,
            target_type=c.target_type,
            target_value=c.target_value,
            activity_type=c.activity_type,
            xp_reward=c.xp_reward,
            coins_reward=c.coins_reward,
            badge_reward_id=c.badge_reward_id,
            start_date=c.start_date,
            end_date=c.end_date,
            is_active=c.is_active,
            created_by=c.created_by,
            created_at=c.created_at,
            participants_count=counts.get(c.id, 0),
            is_joined=is_joined,
            current_progress=round(current_progress, 1),
            is_completed=is_completed,
            reward_claimed=reward_claimed
        ))

    return results

@router.get("/{challenge_id}", response_model=ChallengeResponse)
def get_challenge_detail(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    c = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Challenge not found.")

    part = (
        db.query(ChallengeParticipant)
        .filter(ChallengeParticipant.challenge_id == challenge_id, ChallengeParticipant.user_id == current_user.id)
        .first()
    )
    participants_count = (
        db.query(func.count(ChallengeParticipant.id))
        .filter(ChallengeParticipant.challenge_id == challenge_id)
        .scalar() or 0
    )

    return ChallengeResponse(
        id=c.id,
        title=c.title,
        description=c.description,
        challenge_type=c.challenge_type,
        target_type=c.target_type,
        target_value=c.target_value,
        activity_type=c.activity_type,
        xp_reward=c.xp_reward,
        coins_reward=c.coins_reward,
        badge_reward_id=c.badge_reward_id,
        start_date=c.start_date,
        end_date=c.end_date,
        is_active=c.is_active,
        created_by=c.created_by,
        created_at=c.created_at,
        participants_count=participants_count,
        is_joined=part is not None,
        current_progress=round(part.current_progress, 1) if part else 0.0,
        is_completed=part.is_completed if part else False,
        reward_claimed=part.reward_claimed if part else False
    )

@router.post("/{challenge_id}/join", status_code=status.HTTP_200_OK)
def join_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id, Challenge.is_active == True).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found or inactive.")

    existing = (
        db.query(ChallengeParticipant)
        .filter(ChallengeParticipant.challenge_id == challenge_id, ChallengeParticipant.user_id == current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="You have already joined this challenge.")

    participant = ChallengeParticipant(
        challenge_id=challenge_id,
        user_id=current_user.id,
        current_progress=0.0,
        is_completed=False,
        reward_claimed=False
    )
    db.add(participant)

    create_notification(
        db=db,
        user_id=current_user.id,
        type="challenge_joined",
        title=f"Challenge Accepted: {challenge.title}!",
        message=f"You joined '{challenge.title}'. Log relevant workouts to reach the target and claim {challenge.xp_reward} XP!",
        link="/challenges"
    )

    db.commit()
    return {"message": f"Successfully joined '{challenge.title}'!"}

@router.post("/{challenge_id}/leave", status_code=status.HTTP_200_OK)
def leave_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    participant = (
        db.query(ChallengeParticipant)
        .filter(ChallengeParticipant.challenge_id == challenge_id, ChallengeParticipant.user_id == current_user.id)
        .first()
    )
    if not participant:
        raise HTTPException(status_code=400, detail="You are not participating in this challenge.")

    if participant.is_completed:
        raise HTTPException(status_code=400, detail="Cannot leave an already completed challenge.")

    db.delete(participant)
    db.commit()
    return {"message": "You have left the challenge."}

@router.post("/{challenge_id}/claim", status_code=status.HTTP_200_OK)
def claim_challenge_reward(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    part = (
        db.query(ChallengeParticipant)
        .filter(ChallengeParticipant.challenge_id == challenge_id, ChallengeParticipant.user_id == current_user.id)
        .first()
    )
    if not part:
        raise HTTPException(status_code=404, detail="You are not participating in this challenge.")

    if not part.is_completed:
        raise HTTPException(status_code=400, detail="Challenge is not yet completed.")

    if part.reward_claimed:
        raise HTTPException(status_code=400, detail="Rewards have already been claimed.")

    challenge = part.challenge
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    part.reward_claimed = True
    profile.total_xp += challenge.xp_reward
    profile.coins += challenge.coins_reward
    profile.level = calculate_level(profile.total_xp)

    tx = XPTransaction(
        user_id=current_user.id,
        amount=challenge.xp_reward,
        action="challenge_completed",
        reference_id=challenge.id,
        description=f"Claimed reward for challenge: {challenge.title}"
    )
    db.add(tx)

    reward = UserReward(
        user_id=current_user.id,
        reward_type="challenge_reward",
        reward_name=challenge.title,
        coins_amount=challenge.coins_reward,
        source=f"Challenge #{challenge.id}"
    )
    db.add(reward)

    db.commit()

    return {
        "message": f"Successfully claimed +{challenge.xp_reward} XP and +{challenge.coins_reward} FitCoins!",
        "xp_reward": challenge.xp_reward,
        "coins_reward": challenge.coins_reward
    }

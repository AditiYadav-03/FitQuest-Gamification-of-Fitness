import datetime
from sqlalchemy.orm import Session
from app.models.gamification import Challenge, ChallengeParticipant, XPTransaction, UserReward
from app.models.activity import Activity
from app.models.user import UserProfile
from app.services.notification_service import create_notification
from app.services.xp_engine import calculate_level

def update_challenges_for_activity(db: Session, activity: Activity):
    """
    Checks active challenges the user is enrolled in and increments progress.
    """
    now = datetime.datetime.utcnow()
    # Find all active enrolled challenges
    participations = (
        db.query(ChallengeParticipant)
        .join(Challenge, ChallengeParticipant.challenge_id == Challenge.id)
        .filter(
            ChallengeParticipant.user_id == activity.user_id,
            ChallengeParticipant.is_completed == False,
            Challenge.is_active == True,
            Challenge.start_date <= now,
            Challenge.end_date >= now
        )
        .all()
    )

    profile = db.query(UserProfile).filter(UserProfile.user_id == activity.user_id).first()
    if not profile:
        return

    for part in participations:
        challenge = part.challenge
        # Check activity_type match
        if challenge.activity_type and challenge.activity_type.lower() != activity.activity_type.lower():
            continue

        # Calculate incremental progress
        increment = 0.0
        if challenge.target_type == "distance_km":
            increment = activity.distance_km
        elif challenge.target_type == "duration_minutes":
            increment = float(activity.duration_minutes)
        elif challenge.target_type == "calories_burned":
            increment = float(activity.calories_burned)
        elif challenge.target_type == "activities_count":
            increment = 1.0

        part.current_progress += increment

        # Check if target met
        if part.current_progress >= challenge.target_value and not part.is_completed:
            part.is_completed = True
            part.completed_at = now
            part.reward_claimed = True

            # Award challenge rewards
            profile.total_xp += challenge.xp_reward
            profile.coins += challenge.coins_reward
            profile.level = calculate_level(profile.total_xp)

            # Record transaction
            tx = XPTransaction(
                user_id=activity.user_id,
                amount=challenge.xp_reward,
                action="challenge_completed",
                reference_id=challenge.id,
                description=f"Completed challenge: {challenge.title}"
            )
            db.add(tx)

            # Record reward
            reward = UserReward(
                user_id=activity.user_id,
                reward_type="challenge_reward",
                reward_name=challenge.title,
                coins_amount=challenge.coins_reward,
                source=f"Challenge #{challenge.id}"
            )
            db.add(reward)

            # Notify user
            create_notification(
                db=db,
                user_id=activity.user_id,
                type="challenge_completed",
                title=f"🎯 Challenge Completed: {challenge.title}!",
                message=f"Outstanding work! You finished '{challenge.title}' and claimed +{challenge.xp_reward} XP & +{challenge.coins_reward} FitCoins!",
                link="/challenges"
            )

    db.commit()

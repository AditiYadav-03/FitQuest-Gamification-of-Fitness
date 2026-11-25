from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.gamification import Badge, UserBadge, XPTransaction, UserReward
from app.models.user import UserProfile
from app.models.activity import Activity
from app.models.gamification import ChallengeParticipant
from app.services.notification_service import create_notification
from app.services.xp_engine import calculate_level

SYSTEM_BADGES = [
    {
        "slug": "first_step",
        "name": "First Step",
        "description": "Logged your first fitness activity in FitQuest!",
        "icon": "Footprints",
        "category": "milestone",
        "tier": "bronze",
        "xp_bonus": 50,
        "coins_bonus": 25,
        "requirement_type": "activities_count",
        "requirement_value": 1
    },
    {
        "slug": "high_five",
        "name": "High Five",
        "description": "Completed 5 fitness activities. Momentum is building!",
        "icon": "Flame",
        "category": "milestone",
        "tier": "bronze",
        "xp_bonus": 100,
        "coins_bonus": 50,
        "requirement_type": "activities_count",
        "requirement_value": 5
    },
    {
        "slug": "workout_titan",
        "name": "Workout Titan",
        "description": "Crushed 25 activities! You are unstoppable.",
        "icon": "Dumbbell",
        "category": "workout",
        "tier": "gold",
        "xp_bonus": 300,
        "coins_bonus": 150,
        "requirement_type": "activities_count",
        "requirement_value": 25
    },
    {
        "slug": "streak_3",
        "name": "On Fire",
        "description": "Maintained a 3-day active fitness streak!",
        "icon": "Zap",
        "category": "streak",
        "tier": "bronze",
        "xp_bonus": 75,
        "coins_bonus": 35,
        "requirement_type": "streak_days",
        "requirement_value": 3
    },
    {
        "slug": "streak_7",
        "name": "Week Warrior",
        "description": "Logged activities 7 days in a row! True dedication.",
        "icon": "Sparkles",
        "category": "streak",
        "tier": "silver",
        "xp_bonus": 200,
        "coins_bonus": 100,
        "requirement_type": "streak_days",
        "requirement_value": 7
    },
    {
        "slug": "streak_30",
        "name": "Legendary Discipline",
        "description": "30-day streak! Fitness has become your superpower.",
        "icon": "Crown",
        "category": "streak",
        "tier": "diamond",
        "xp_bonus": 600,
        "coins_bonus": 300,
        "requirement_type": "streak_days",
        "requirement_value": 30
    },
    {
        "slug": "level_5_pro",
        "name": "Rising Champion",
        "description": "Reached Level 5 in FitQuest!",
        "icon": "ShieldCheck",
        "category": "milestone",
        "tier": "silver",
        "xp_bonus": 150,
        "coins_bonus": 75,
        "requirement_type": "total_xp",
        "requirement_value": 1600
    },
    {
        "slug": "level_10_master",
        "name": "FitQuest Master",
        "description": "Ascended to Level 10. Elite athlete status achieved!",
        "icon": "Trophy",
        "category": "milestone",
        "tier": "diamond",
        "xp_bonus": 500,
        "coins_bonus": 250,
        "requirement_type": "total_xp",
        "requirement_value": 8100
    },
    {
        "slug": "distance_50k",
        "name": "Trailblazer 50K",
        "description": "Traversed over 50 kilometers across all workouts.",
        "icon": "Compass",
        "category": "endurance",
        "tier": "silver",
        "xp_bonus": 250,
        "coins_bonus": 120,
        "requirement_type": "distance_km",
        "requirement_value": 50
    },
    {
        "slug": "challenge_conqueror",
        "name": "Challenge Conqueror",
        "description": "Finished your first FitQuest Challenge!",
        "icon": "Medal",
        "category": "challenge",
        "tier": "gold",
        "xp_bonus": 200,
        "coins_bonus": 100,
        "requirement_type": "challenges_won",
        "requirement_value": 1
    }
]

def seed_badges(db: Session):
    for b_data in SYSTEM_BADGES:
        existing = db.query(Badge).filter(Badge.slug == b_data["slug"]).first()
        if not existing:
            badge = Badge(**b_data)
            db.add(badge)
    db.commit()

def check_and_award_badges(db: Session, user_id: int) -> List[Dict[str, Any]]:
    """
    Evaluates current user statistics against all badge requirements.
    Awards any newly unlocked badges and handles XP/coins/notifications.
    Returns list of newly unlocked badge info.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        return []

    # Get user metrics
    activities_count = db.query(func.count(Activity.id)).filter(Activity.user_id == user_id).scalar() or 0
    total_distance = db.query(func.sum(Activity.distance_km)).filter(Activity.user_id == user_id).scalar() or 0.0
    challenges_completed = db.query(func.count(ChallengeParticipant.id)).filter(
        ChallengeParticipant.user_id == user_id,
        ChallengeParticipant.is_completed == True
    ).scalar() or 0

    already_earned_ids = {
        ub.badge_id for ub in db.query(UserBadge).filter(UserBadge.user_id == user_id).all()
    }

    all_badges = db.query(Badge).all()
    newly_unlocked = []

    for badge in all_badges:
        if badge.id in already_earned_ids:
            continue

        qualified = False
        if badge.requirement_type == "activities_count" and activities_count >= badge.requirement_value:
            qualified = True
        elif badge.requirement_type == "streak_days" and profile.current_streak >= badge.requirement_value:
            qualified = True
        elif badge.requirement_type == "total_xp" and profile.total_xp >= badge.requirement_value:
            qualified = True
        elif badge.requirement_type == "distance_km" and total_distance >= badge.requirement_value:
            qualified = True
        elif badge.requirement_type == "challenges_won" and challenges_completed >= badge.requirement_value:
            qualified = True

        if qualified:
            # Award Badge
            ub = UserBadge(user_id=user_id, badge_id=badge.id, notified=False)
            db.add(ub)

            # Award XP & Coins
            profile.total_xp += badge.xp_bonus
            profile.coins += badge.coins_bonus
            profile.level = calculate_level(profile.total_xp)

            # Transaction record
            tx = XPTransaction(
                user_id=user_id,
                amount=badge.xp_bonus,
                action="badge_unlocked",
                reference_id=badge.id,
                description=f"Unlocked badge: {badge.name}"
            )
            db.add(tx)

            # Reward record
            reward = UserReward(
                user_id=user_id,
                reward_type="badge",
                reward_name=badge.name,
                coins_amount=badge.coins_bonus,
                source=f"Badge: {badge.slug}"
            )
            db.add(reward)

            # Notification
            create_notification(
                db=db,
                user_id=user_id,
                type="badge_unlocked",
                title=f"🏆 Badge Unlocked: {badge.name}!",
                message=f"You earned the {badge.name} badge and received +{badge.xp_bonus} XP and +{badge.coins_bonus} FitCoins!",
                link="/profile"
            )

            newly_unlocked.append({
                "id": badge.id,
                "name": badge.name,
                "description": badge.description,
                "icon": badge.icon,
                "category": badge.category,
                "tier": badge.tier,
                "xp_bonus": badge.xp_bonus,
                "coins_bonus": badge.coins_bonus
            })

    if newly_unlocked:
        db.commit()

    return newly_unlocked

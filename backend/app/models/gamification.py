import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(100), default="Award", nullable=False)  # Lucide icon identifier
    category = Column(String(50), default="milestone")  # milestone, streak, challenge, workout, endurance
    tier = Column(String(20), default="bronze")  # bronze, silver, gold, diamond
    xp_bonus = Column(Integer, default=50)
    coins_bonus = Column(Integer, default=25)
    requirement_type = Column(String(50), nullable=False)  # activities_count, total_xp, streak_days, distance_km, challenges_won
    requirement_value = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user_badges = relationship("UserBadge", back_populates="badge", cascade="all, delete-orphan")


class UserBadge(Base):
    __tablename__ = "user_badges"
    __table_args__ = (UniqueConstraint("user_id", "badge_id", name="uq_user_badge"),)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id", ondelete="CASCADE"), nullable=False)
    earned_at = Column(DateTime, default=datetime.datetime.utcnow)
    notified = Column(Boolean, default=False)

    user = relationship("User", back_populates="user_badges")
    badge = relationship("Badge", back_populates="user_badges")


class XPTransaction(Base):
    __tablename__ = "xp_transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    amount = Column(Integer, nullable=False)
    action = Column(String(100), nullable=False)  # activity_completed, challenge_completed, streak_bonus, badge_unlocked, daily_login
    reference_id = Column(Integer, nullable=True)  # activity_id or challenge_id
    description = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="xp_transactions")


class UserReward(Base):
    __tablename__ = "user_rewards"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reward_type = Column(String(50), nullable=False)  # coins, badge, streak_multiplier, title
    reward_name = Column(String(255), nullable=False)
    coins_amount = Column(Integer, default=0)
    source = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="rewards")


class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    challenge_type = Column(String(50), default="weekly")  # daily, weekly, monthly
    target_type = Column(String(50), nullable=False)  # distance_km, duration_minutes, activities_count, calories_burned
    target_value = Column(Float, nullable=False)
    activity_type = Column(String(50), nullable=True)  # e.g., "running", "cycling", or null for all
    xp_reward = Column(Integer, default=150)
    coins_reward = Column(Integer, default=50)
    badge_reward_id = Column(Integer, ForeignKey("badges.id", ondelete="SET NULL"), nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    participants = relationship("ChallengeParticipant", back_populates="challenge", cascade="all, delete-orphan")
    badge_reward = relationship("Badge")


class ChallengeParticipant(Base):
    __tablename__ = "challenge_participants"
    __table_args__ = (UniqueConstraint("challenge_id", "user_id", name="uq_challenge_user"),)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    current_progress = Column(Float, default=0.0)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    reward_claimed = Column(Boolean, default=False)
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)

    challenge = relationship("Challenge", back_populates="participants")
    user = relationship("User", back_populates="challenge_participants")

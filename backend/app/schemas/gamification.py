import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any

class BadgeResponse(BaseModel):
    id: int
    slug: str
    name: str
    description: str
    icon: str
    category: str
    tier: str
    xp_bonus: int
    coins_bonus: int
    requirement_type: str
    requirement_value: int
    is_earned: bool = False
    earned_at: Optional[datetime.datetime] = None

    model_config = ConfigDict(from_attributes=True)

class XPTransactionResponse(BaseModel):
    id: int
    user_id: int
    amount: int
    action: str
    reference_id: Optional[int] = None
    description: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class ChallengeCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str
    challenge_type: str = "weekly"  # daily, weekly, monthly
    target_type: str = "distance_km"  # distance_km, duration_minutes, activities_count, calories_burned
    target_value: float = Field(..., gt=0)
    activity_type: Optional[str] = None
    xp_reward: int = Field(default=150, ge=10)
    coins_reward: int = Field(default=50, ge=5)
    badge_reward_id: Optional[int] = None
    start_date: datetime.datetime
    end_date: datetime.datetime

class ChallengeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    end_date: Optional[datetime.datetime] = None
    xp_reward: Optional[int] = None
    coins_reward: Optional[int] = None

class ChallengeResponse(BaseModel):
    id: int
    title: str
    description: str
    challenge_type: str
    target_type: str
    target_value: float
    activity_type: Optional[str] = None
    xp_reward: int
    coins_reward: int
    badge_reward_id: Optional[int] = None
    start_date: datetime.datetime
    end_date: datetime.datetime
    is_active: bool
    created_by: Optional[int] = None
    created_at: datetime.datetime
    participants_count: int = 0
    is_joined: bool = False
    current_progress: float = 0.0
    is_completed: bool = False
    reward_claimed: bool = False

    model_config = ConfigDict(from_attributes=True)

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    full_name: str
    avatar_url: Optional[str] = None
    level: int
    total_xp: int
    current_streak: int
    activities_count: int
    badges_count: int

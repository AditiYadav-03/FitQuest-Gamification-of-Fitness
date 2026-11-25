import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any

class UserProfileUpdate(BaseModel):
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    fitness_level: Optional[str] = None
    preferred_activities: Optional[str] = None
    daily_step_goal: Optional[int] = None
    daily_calorie_goal: Optional[int] = None
    daily_active_minutes_goal: Optional[int] = None
    weekly_workout_goal: Optional[int] = None
    is_public: Optional[bool] = None

class FitnessGoalCreate(BaseModel):
    title: str
    goal_type: str
    target_value: float
    unit: Optional[str] = ""
    target_date: Optional[datetime.date] = None

class FitnessGoalUpdate(BaseModel):
    current_value: Optional[float] = None
    is_completed: Optional[bool] = None

class FitnessGoalResponse(BaseModel):
    id: int
    user_id: int
    title: str
    goal_type: str
    target_value: float
    current_value: float
    unit: str
    target_date: Optional[datetime.date] = None
    is_completed: bool
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class UserProfileResponse(BaseModel):
    id: int
    user_id: int
    email: str
    username: str
    full_name: str
    role: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    fitness_level: str
    preferred_activities: str
    daily_step_goal: int
    daily_calorie_goal: int
    daily_active_minutes_goal: int
    weekly_workout_goal: int
    is_public: bool
    total_xp: int
    level: int
    coins: int
    current_streak: int
    longest_streak: int
    last_activity_date: Optional[datetime.date] = None
    level_progress: Optional[dict] = None
    badges_count: int = 0
    activities_count: int = 0

    model_config = ConfigDict(from_attributes=True)

class UserSummary(BaseModel):
    id: int
    username: str
    full_name: str
    avatar_url: Optional[str] = None
    level: int
    total_xp: int
    current_streak: int
    is_following: Optional[bool] = False
    friendship_status: Optional[str] = None  # None, "pending", "accepted"

    model_config = ConfigDict(from_attributes=True)

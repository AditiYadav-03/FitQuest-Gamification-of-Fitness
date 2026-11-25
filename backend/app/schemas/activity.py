import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any

class ActivityCreate(BaseModel):
    activity_type: str = Field(..., description="running, walking, cycling, gym, swimming, yoga, hiit, sports, other")
    title: str = Field(..., min_length=2, max_length=255)
    duration_minutes: int = Field(..., gt=0, le=1440)
    distance_km: Optional[float] = Field(default=0.0, ge=0.0)
    calories_burned: Optional[int] = Field(default=0, ge=0)
    intensity: Optional[str] = Field(default="medium")
    activity_date: Optional[datetime.datetime] = None
    notes: Optional[str] = None
    publish_to_feed: Optional[bool] = False

class ActivityUpdate(BaseModel):
    title: Optional[str] = None
    duration_minutes: Optional[int] = None
    distance_km: Optional[float] = None
    calories_burned: Optional[int] = None
    intensity: Optional[str] = None
    notes: Optional[str] = None

class ActivityResponse(BaseModel):
    id: int
    user_id: int
    activity_type: str
    title: str
    duration_minutes: int
    distance_km: float
    calories_burned: int
    xp_earned: int
    coins_earned: int
    intensity: str
    activity_date: datetime.datetime
    notes: Optional[str] = None
    created_at: datetime.datetime
    unlocked_badges: Optional[List[Dict[str, Any]]] = None
    streak_updated: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)

class ActivitySummaryStats(BaseModel):
    total_activities: int
    total_duration_minutes: int
    total_distance_km: float
    total_calories_burned: int
    total_xp_earned: int
    breakdown_by_type: Dict[str, int]

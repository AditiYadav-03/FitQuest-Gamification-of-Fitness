import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any

class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)

class CommentResponse(BaseModel):
    id: int
    post_id: int
    user_id: int
    username: str
    full_name: str
    avatar_url: Optional[str] = None
    content: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class PostCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    activity_id: Optional[int] = None

class PostActivitySnippet(BaseModel):
    id: int
    activity_type: str
    title: str
    duration_minutes: int
    distance_km: float
    calories_burned: int
    xp_earned: int

class PostResponse(BaseModel):
    id: int
    user_id: int
    username: str
    full_name: str
    avatar_url: Optional[str] = None
    level: int = 1
    content: str
    activity: Optional[PostActivitySnippet] = None
    likes_count: int
    comments_count: int
    is_liked: bool = False
    created_at: datetime.datetime
    comments: List[CommentResponse] = []

    model_config = ConfigDict(from_attributes=True)

class FriendRequestCreate(BaseModel):
    target_user_id: int

class FriendshipResponse(BaseModel):
    id: int
    requester_id: int
    addressee_id: int
    status: str
    created_at: datetime.datetime
    partner_id: int
    partner_username: str
    partner_full_name: str
    partner_avatar: Optional[str] = None
    partner_level: int = 1

    model_config = ConfigDict(from_attributes=True)

from app.schemas.auth import (
    UserRegister,
    UserLogin,
    PasswordResetRequest,
    PasswordResetConfirm,
    UserAuthResponse,
    TokenResponse,
)
from app.schemas.user import (
    UserProfileUpdate,
    FitnessGoalCreate,
    FitnessGoalUpdate,
    FitnessGoalResponse,
    UserProfileResponse,
    UserSummary,
)
from app.schemas.activity import (
    ActivityCreate,
    ActivityUpdate,
    ActivityResponse,
    ActivitySummaryStats,
)
from app.schemas.gamification import (
    BadgeResponse,
    XPTransactionResponse,
    ChallengeCreate,
    ChallengeUpdate,
    ChallengeResponse,
    LeaderboardEntry,
)
from app.schemas.social import (
    CommentCreate,
    CommentResponse,
    PostCreate,
    PostResponse,
    FriendRequestCreate,
    FriendshipResponse,
)
from app.schemas.notification import NotificationResponse

__all__ = [
    "UserRegister",
    "UserLogin",
    "PasswordResetRequest",
    "PasswordResetConfirm",
    "UserAuthResponse",
    "TokenResponse",
    "UserProfileUpdate",
    "FitnessGoalCreate",
    "FitnessGoalUpdate",
    "FitnessGoalResponse",
    "UserProfileResponse",
    "UserSummary",
    "ActivityCreate",
    "ActivityUpdate",
    "ActivityResponse",
    "ActivitySummaryStats",
    "BadgeResponse",
    "XPTransactionResponse",
    "ChallengeCreate",
    "ChallengeUpdate",
    "ChallengeResponse",
    "LeaderboardEntry",
    "CommentCreate",
    "CommentResponse",
    "PostCreate",
    "PostResponse",
    "FriendRequestCreate",
    "FriendshipResponse",
    "NotificationResponse",
]

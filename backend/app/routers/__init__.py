from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.activities import router as activities_router
from app.routers.gamification import router as gamification_router
from app.routers.challenges import router as challenges_router
from app.routers.leaderboards import router as leaderboards_router
from app.routers.social import router as social_router
from app.routers.notifications import router as notifications_router
from app.routers.analytics import router as analytics_router
from app.routers.admin import router as admin_router

__all__ = [
    "auth_router",
    "users_router",
    "activities_router",
    "gamification_router",
    "challenges_router",
    "leaderboards_router",
    "social_router",
    "notifications_router",
    "analytics_router",
    "admin_router",
]

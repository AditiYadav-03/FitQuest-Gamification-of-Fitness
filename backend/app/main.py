import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.services.badge_service import seed_badges
from app.routers import (
    auth_router,
    users_router,
    activities_router,
    gamification_router,
    challenges_router,
    leaderboards_router,
    social_router,
    notifications_router,
    analytics_router,
    admin_router,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("fitquest")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist & seed system badges
    logger.info("Initializing FitQuest database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
    
    db = SessionLocal()
    try:
        seed_badges(db)
        logger.info("System badges verified/seeded.")
    except Exception as e:
        logger.error(f"Error seeding badges: {e}")
    finally:
        db.close()
    
    yield
    # Shutdown logic if any
    logger.info("FitQuest backend shutdown complete.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="FitQuest – Social fitness gamification platform backend API with XP engine, levels, streaks, badges, challenges, leaderboards, and community feed.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(activities_router, prefix=settings.API_V1_STR)
app.include_router(gamification_router, prefix=settings.API_V1_STR)
app.include_router(challenges_router, prefix=settings.API_V1_STR)
app.include_router(leaderboards_router, prefix=settings.API_V1_STR)
app.include_router(social_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": "FitQuest API",
        "tagline": "Gamification of Physical Fitness",
        "status": "online",
        "version": settings.VERSION,
        "docs_url": f"{settings.API_V1_STR}/docs"
    }

@app.get("/health")
@app.get(f"{settings.API_V1_STR}/health")
def health_check():
    return {"status": "healthy"}

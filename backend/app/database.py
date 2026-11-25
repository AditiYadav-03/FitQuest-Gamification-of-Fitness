import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

def get_engine():
    db_url = settings.DATABASE_URL
    try:
        # Try configured database (MySQL)
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            echo=False
        )
        # Test connection
        with engine.connect() as conn:
            pass
        logger.info(f"Connected to primary database: {db_url.split('@')[-1] if '@' in db_url else db_url}")
        return engine
    except Exception as e:
        if settings.AUTO_SQLITE_FALLBACK:
            logger.warning(
                f"Could not connect to MySQL at {db_url} ({e}). "
                f"Falling back to local SQLite database at {settings.SQLITE_FALLBACK_URL} for reliable execution."
            )
            fallback_engine = create_engine(
                settings.SQLITE_FALLBACK_URL,
                connect_args={"check_same_thread": False},
                echo=False
            )
            return fallback_engine
        raise e

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

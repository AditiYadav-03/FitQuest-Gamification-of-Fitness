import pytest
import os
import sys

# Ensure backend path is present
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.services.badge_service import seed_badges

TEST_DB_URL = "sqlite:///./test_fitquest.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    seed_badges(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_fitquest.db"):
        try:
            os.remove("./test_fitquest.db")
        except Exception:
            pass

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture
def auth_headers(client):
    reg_data = {
        "email": "testuser@fitquest.com",
        "username": "testuser",
        "full_name": "Test User",
        "password": "Password123!"
    }
    res = client.post("/api/v1/auth/register", json=reg_data)
    token = res.json().get("access_token")
    if not token:
        login_res = client.post("/api/v1/auth/login", json={"username_or_email": "testuser", "password": "Password123!"})
        token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

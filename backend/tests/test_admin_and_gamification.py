import pytest

@pytest.fixture
def admin_headers(client):
    reg_data = {
        "email": "superadmin@fitquest.com",
        "username": "superadmin",
        "full_name": "Super Admin",
        "password": "AdminPassword123!"
    }
    client.post("/api/v1/auth/register", json=reg_data)
    # Promote user to admin in DB directly through session override
    from tests.conftest import TestingSessionLocal
    from app.models.user import User
    db = TestingSessionLocal()
    u = db.query(User).filter(User.username == "superadmin").first()
    if u:
        u.role = "admin"
        db.commit()
    db.close()

    login_res = client.post("/api/v1/auth/login", json={"username_or_email": "superadmin", "password": "AdminPassword123!"})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_admin_dashboard_and_controls(client, admin_headers):
    # 1. Admin System Stats
    res_stats = client.get("/api/v1/admin/stats", headers=admin_headers)
    assert res_stats.status_code == 200
    stats = res_stats.json()
    assert "total_users" in stats
    assert "total_activities" in stats

    # 2. Admin User Management
    res_users = client.get("/api/v1/admin/users", headers=admin_headers)
    assert res_users.status_code == 200
    assert len(res_users.json()) >= 1

    # 3. Admin Challenge Creation
    c_res = client.post("/api/v1/admin/challenges", json={
        "title": "Weekend Century Ride",
        "description": "Cycle 100km over the weekend to earn massive XP!",
        "challenge_type": "weekend",
        "target_type": "distance_km",
        "target_value": 100.0,
        "activity_type": "cycling",
        "xp_reward": 500,
        "coins_reward": 200,
        "start_date": "2026-11-01T00:00:00Z",
        "end_date": "2026-11-03T23:59:59Z"
    }, headers=admin_headers)
    assert c_res.status_code == 201
    c_id = c_res.json()["id"]

    # 4. Delete Challenge
    del_res = client.delete(f"/api/v1/admin/challenges/{c_id}", headers=admin_headers)
    assert del_res.status_code == 204

def test_gamification_endpoints(client, auth_headers):
    # Badges list with is_earned flags
    res_b = client.get("/api/v1/gamification/badges", headers=auth_headers)
    assert res_b.status_code == 200
    badges = res_b.json()
    assert len(badges) >= 5
    assert any(b["slug"] == "first_step" for b in badges)

    # XP Transactions audit trail
    res_tx = client.get("/api/v1/gamification/transactions", headers=auth_headers)
    assert res_tx.status_code == 200
    assert isinstance(res_tx.json(), list)

    # Progress level
    res_prog = client.get("/api/v1/gamification/progress", headers=auth_headers)
    assert res_prog.status_code == 200
    prog = res_prog.json()
    assert "level" in prog
    assert "percentage" in prog

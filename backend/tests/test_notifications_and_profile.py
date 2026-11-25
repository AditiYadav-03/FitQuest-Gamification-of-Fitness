import pytest

def test_notifications_flow(client, auth_headers):
    # 1. Fetch notifications
    res = client.get("/api/v1/notifications", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "unread_count" in data
    assert "notifications" in data

    # 2. Mark all as read
    res_read = client.post("/api/v1/notifications/read-all", headers=auth_headers)
    assert res_read.status_code == 200
    assert "marked as read" in res_read.json()["message"]

def test_profile_and_goals_flow(client, auth_headers):
    # 1. Get profile
    res_prof = client.get("/api/v1/users/profile", headers=auth_headers)
    assert res_prof.status_code == 200
    prof = res_prof.json()
    assert "level" in prof
    assert "total_xp" in prof
    assert "coins" in prof

    # 2. Update profile preferences
    res_update = client.put("/api/v1/users/profile", json={
        "bio": "Dedicated marathon enthusiast preparing for next season.",
        "fitness_level": "Advanced",
        "daily_step_goal": 10000,
        "daily_calorie_goal": 600,
        "daily_active_minutes_goal": 60,
        "is_public": True
    }, headers=auth_headers)
    assert res_update.status_code == 200
    updated = res_update.json()
    assert updated["fitness_level"] == "Advanced"
    assert updated["daily_step_goal"] == 10000

    # 3. Create a fitness goal
    res_goal = client.post("/api/v1/users/goals/create", json={
        "title": "Run 50km this month",
        "goal_type": "monthly_distance",
        "target_value": 50.0,
        "unit": "km"
    }, headers=auth_headers)
    assert res_goal.status_code == 201
    goal = res_goal.json()
    goal_id = goal["id"]
    assert goal["title"] == "Run 50km this month"

    # 4. List fitness goals
    res_list = client.get("/api/v1/users/goals/list", headers=auth_headers)
    assert res_list.status_code == 200
    goals = res_list.json()
    assert any(g["id"] == goal_id for g in goals)

    # 5. Update goal progress
    res_goal_up = client.put(f"/api/v1/users/goals/{goal_id}", json={
        "current_value": 50.0
    }, headers=auth_headers)
    assert res_goal_up.status_code == 200
    assert res_goal_up.json()["is_completed"] is True

    # 6. Delete goal
    res_del_goal = client.delete(f"/api/v1/users/goals/{goal_id}", headers=auth_headers)
    assert res_del_goal.status_code == 204

def test_user_search(client, auth_headers):
    res = client.get("/api/v1/users/search?q=test", headers=auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

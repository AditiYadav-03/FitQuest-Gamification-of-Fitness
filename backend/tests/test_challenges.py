import datetime

def test_challenges_flow(client, auth_headers):
    # 1. Fetch open challenges
    res = client.get("/api/v1/challenges", headers=auth_headers)
    assert res.status_code == 200
    challenges = res.json()
    assert isinstance(challenges, list)

def test_admin_forbidden_for_regular_user(client, auth_headers):
    # Regular user attempting admin stats
    res = client.get("/api/v1/admin/stats", headers=auth_headers)
    assert res.status_code == 403
    assert "Admin privileges required" in res.json()["detail"]

def test_create_and_get_activity(client, auth_headers):
    act_data = {
        "activity_type": "running",
        "title": "Evening 5K Park Run",
        "duration_minutes": 25,
        "distance_km": 5.0,
        "intensity": "high",
        "notes": "Felt fast!"
    }
    create_res = client.post("/api/v1/activities", json=act_data, headers=auth_headers)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["title"] == "Evening 5K Park Run"
    assert created["xp_earned"] > 0
    assert created["coins_earned"] > 0
    assert "streak_updated" in created
    assert "unlocked_badges" in created

    # List activities
    list_res = client.get("/api/v1/activities", headers=auth_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # Get stats
    stats_res = client.get("/api/v1/activities/stats", headers=auth_headers)
    assert stats_res.status_code == 200
    assert stats_res.json()["total_activities"] >= 1

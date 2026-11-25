import pytest

def test_social_feed_flow(client, auth_headers):
    # 1. Create a post
    post_res = client.post("/api/v1/social/posts", json={
        "content": "Just crushed an intense morning workout! #FitQuest",
    }, headers=auth_headers)
    assert post_res.status_code == 201
    post_data = post_res.json()
    post_id = post_data["id"]
    assert post_data["content"] == "Just crushed an intense morning workout! #FitQuest"
    assert post_data["likes_count"] == 0

    # 2. Like the post
    like_res = client.post(f"/api/v1/social/posts/{post_id}/like", headers=auth_headers)
    assert like_res.status_code == 200
    assert like_res.json()["liked"] is True
    assert like_res.json()["likes_count"] == 1

    # 3. Add a comment
    comment_res = client.post(f"/api/v1/social/posts/{post_id}/comments", json={
        "content": "Keep that streak alive! Strong work."
    }, headers=auth_headers)
    assert comment_res.status_code == 200
    assert comment_res.json()["content"] == "Keep that streak alive! Strong work."

    # 4. View feed
    feed_res = client.get("/api/v1/social/feed", headers=auth_headers)
    assert feed_res.status_code == 200
    posts = feed_res.json()
    assert any(p["id"] == post_id for p in posts)

    # 5. Unlike the post
    unlike_res = client.post(f"/api/v1/social/posts/{post_id}/like", headers=auth_headers)
    assert unlike_res.status_code == 200
    assert unlike_res.json()["liked"] is False

    # 6. Delete the post
    del_res = client.delete(f"/api/v1/social/posts/{post_id}", headers=auth_headers)
    assert del_res.status_code == 204

def test_leaderboard_endpoints(client, auth_headers):
    # Global all-time leaderboard
    res_global = client.get("/api/v1/leaderboards?scope=global&timeframe=all_time", headers=auth_headers)
    assert res_global.status_code == 200
    assert isinstance(res_global.json(), list)

    # Friends leaderboard
    res_friends = client.get("/api/v1/leaderboards?scope=friends&timeframe=all_time", headers=auth_headers)
    assert res_friends.status_code == 200
    assert isinstance(res_friends.json(), list)

    # Weekly leaderboard with sport filter
    res_weekly = client.get("/api/v1/leaderboards?scope=global&timeframe=weekly&activity_type=running", headers=auth_headers)
    assert res_weekly.status_code == 200
    assert isinstance(res_weekly.json(), list)

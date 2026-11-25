import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Set working directory to backend
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app

def run_e2e_verification():
    print("=" * 60)
    print("FITQUEST COMPREHENSIVE END-TO-END VERIFICATION")
    print("=" * 60)

    with TestClient(app) as client:
        # 1. Health check
        print("\n[1/11] Checking API health...")
        res = client.get("/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("  -> Health status: OK")

        # 2. Existing Demo User Login
        print("\n[2/11] Authenticating as demo athlete (Alex Rivers)...")
        login_res = client.post("/api/v1/auth/login", json={
            "username_or_email": "alex@fitquest.com",
            "password": "AlexPass123!"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        alex_token = login_res.json()["access_token"]
        alex_headers = {"Authorization": f"Bearer {alex_token}"}
        print("  -> Authenticated successfully. Token received.")

        # 3. Fetch Dashboard Analytics
        print("\n[3/11] Fetching live dashboard & analytics data...")
        dash_res = client.get("/api/v1/analytics/dashboard", headers=alex_headers)
        assert dash_res.status_code == 200, f"Dashboard fetch failed: {dash_res.text}"
        dash_data = dash_res.json()
        print(f"  -> Athlete: {dash_data['user']['full_name']} | Level {dash_data['user']['level']} | XP: {dash_data['user']['total_xp']} | FitCoins: {dash_data['user']['coins']}")
        print(f"  -> Current Streak: {dash_data['user']['current_streak']} days | Badges unlocked: {dash_data['user']['badges_count']}")
        print(f"  -> Past 7 days data points: {len(dash_data['weekly_chart'])}")

        # 4. Log a New Fitness Activity (Running 5.5 km)
        print("\n[4/11] Logging a new workout: 35-min Trail Run...")
        act_res = client.post("/api/v1/activities", json={
            "activity_type": "running",
            "title": "Sunset Trail 5.5K",
            "duration_minutes": 35,
            "distance_km": 5.5,
            "intensity": "high",
            "notes": "Beautiful sunset run in the park",
            "publish_to_feed": True
        }, headers=alex_headers)
        assert act_res.status_code == 201, f"Activity creation failed: {act_res.text}"
        act = act_res.json()
        print(f"  -> Activity saved! ID: {act['id']}")
        print(f"  -> Rewards: +{act['xp_earned']} XP | +{act['coins_earned']} FitCoins | {act['calories_burned']} kcal burned")
        print(f"  -> Streak status: {act['streak_updated']}")

        # 5. Badges & XP Transactions
        print("\n[5/11] Verifying gamification rewards & badges...")
        badges_res = client.get("/api/v1/gamification/badges", headers=alex_headers)
        assert badges_res.status_code == 200
        badges = badges_res.json()
        earned_badges = [b for b in badges if b['is_earned']]
        print(f"  -> Total Badges: {len(badges)} | Unlocked: {len(earned_badges)}")
        for b in earned_badges[:3]:
            print(f"     * [{b['tier'].upper()}] {b['name']} ({b['icon']}): {b['description']}")

        tx_res = client.get("/api/v1/gamification/transactions", headers=alex_headers)
        assert tx_res.status_code == 200
        print(f"  -> Recorded XP audit ledger transactions: {len(tx_res.json())}")

        # 6. Challenges & Quests
        print("\n[6/11] Fetching active challenges and participation...")
        ch_res = client.get("/api/v1/challenges", headers=alex_headers)
        assert ch_res.status_code == 200
        challenges = ch_res.json()
        print(f"  -> Active challenges found: {len(challenges)}")
        for ch in challenges:
            print(f"     * '{ch['title']}' ({ch['challenge_type']}): Target={ch['target_value']} {ch['target_type']} | Progress={ch['current_progress']} | Joined={ch['is_joined']}")

        # 7. Competitive Leaderboards
        print("\n[7/11] Querying real-time global & friends leaderboards...")
        lb_res = client.get("/api/v1/leaderboards?scope=global&timeframe=all_time", headers=alex_headers)
        assert lb_res.status_code == 200
        leaderboard = lb_res.json()
        print("  -> Top 3 Athletes on Global Podium:")
        for entry in leaderboard[:3]:
            print(f"     Rank #{entry['rank']}: {entry['full_name']} (@{entry['username']}) - Level {entry['level']} | {entry['total_xp']} XP | {entry['current_streak']}d streak")

        # 8. Social Community Feed & Interactions
        print("\n[8/11] Testing community feed, likes & comments...")
        feed_res = client.get("/api/v1/social/feed", headers=alex_headers)
        assert feed_res.status_code == 200
        feed = feed_res.json()
        print(f"  -> Feed items loaded: {len(feed)}")
        if feed:
            first_post = feed[0]
            print(f"  -> Latest post by @{first_post['username']}: \"{first_post['content'][:50]}...\"")
            
            # Like the post
            like_res = client.post(f"/api/v1/social/posts/{first_post['id']}/like", headers=alex_headers)
            print(f"  -> Toggled like: {like_res.json()}")

            # Add comment
            comm_res = client.post(f"/api/v1/social/posts/{first_post['id']}/comments", json={
                "content": "Incredible effort! Inspiring run!"
            }, headers=alex_headers)
            assert comm_res.status_code == 200
            print("  -> Comment posted successfully.")

        # 9. User Search & Social Networking
        print("\n[9/11] Testing user directory search...")
        search_res = client.get("/api/v1/users/search?q=sarah", headers=alex_headers)
        assert search_res.status_code == 200
        users_found = search_res.json()
        print(f"  -> Search results for 'sarah': {len(users_found)}")
        for u in users_found:
            print(f"     * {u['full_name']} (@{u['username']}) | Level {u['level']} | Streak: {u['current_streak']}d | Friendship: {u['friendship_status']}")

        # 10. Notification Center
        print("\n[10/11] Checking real-time athlete notification center...")
        notif_res = client.get("/api/v1/notifications", headers=alex_headers)
        assert notif_res.status_code == 200
        notifs_data = notif_res.json()
        print(f"  -> Unread notifications: {notifs_data['unread_count']} | Total notifications: {len(notifs_data['notifications'])}")
        for n in notifs_data['notifications'][:3]:
            print(f"     * [{n['type'].upper()}] {n['title']} - {n['message']}")

        # 11. Admin Panel & Controls
        print("\n[11/11] Authenticating as Administrator and checking system oversight...")
        admin_login = client.post("/api/v1/auth/login", json={
            "username_or_email": "admin@fitquest.com",
            "password": "AdminPass123!"
        })
        assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        admin_stats = client.get("/api/v1/admin/stats", headers=admin_headers)
        assert admin_stats.status_code == 200
        stats = admin_stats.json()
        print("  -> Admin System Metrics:")
        print(f"     * Total Athletes: {stats['total_users']} (Active: {stats['active_users']})")
        print(f"     * Total Workouts Logged: {stats['total_activities']}")
        print(f"     * Total XP Distributed: {stats['total_xp_awarded']:,} XP")
        print(f"     * Circulating FitCoins: {stats['total_coins_circulating']:,} coins")
        print(f"     * Badges Awarded: {stats['total_badges_awarded']}")
        print(f"     * Active Quests: {stats['total_challenges']}")

    print("\n" + "=" * 60)
    print("ALL 11 END-TO-END VERIFICATION CHECKS PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_e2e_verification()

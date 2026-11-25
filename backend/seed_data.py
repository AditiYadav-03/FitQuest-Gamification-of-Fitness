import datetime
import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, Base, engine
from app.models.user import User, UserProfile, FitnessGoal
from app.models.activity import Activity
from app.models.gamification import Badge, UserBadge, XPTransaction, UserReward, Challenge, ChallengeParticipant
from app.models.social import Friendship, Follow, Post, Like, Comment
from app.models.notification import Notification
from app.services.auth_service import hash_password
from app.services.badge_service import seed_badges, check_and_award_badges
from app.services.xp_engine import calculate_activity_rewards, calculate_level

def run_seed():
    print("[*] Initializing Database Schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed System Badges
        print("[*] Seeding System Badges...")
        seed_badges(db)

        # 2. Check if already seeded
        existing_admin = db.query(User).filter(User.email == "admin@fitquest.com").first()
        if existing_admin:
            print("[*] Database already contains seed users. Skipping duplicate seeding.")
            return

        print("[*] Creating Demo Users...")
        now = datetime.datetime.utcnow()
        today = now.date()

        demo_users_data = [
            {
                "email": "admin@fitquest.com",
                "username": "fitadmin",
                "full_name": "FitQuest Administrator",
                "password": "AdminPass123!",
                "role": "admin",
                "bio": "Official FitQuest platform administrator and community supervisor.",
                "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                "fitness_level": "Elite",
                "total_xp": 14500,
                "coins": 650,
                "streak": 18,
                "longest_streak": 25,
            },
            {
                "email": "sarah@fitquest.com",
                "username": "sarah_run",
                "full_name": "Sarah Chen",
                "password": "SarahPass123!",
                "role": "user",
                "bio": "Marathon enthusiast and trail explorer. Chasing that sub-3hr marathon goal! 🏃‍♀️💨",
                "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                "fitness_level": "Advanced",
                "total_xp": 6800,
                "coins": 420,
                "streak": 14,
                "longest_streak": 21,
            },
            {
                "email": "alex@fitquest.com",
                "username": "alex_fit",
                "full_name": "Alex Rivers",
                "password": "AlexPass123!",
                "role": "user",
                "bio": "Hybrid athlete balancing cycling tours and strength training. Daily consistency wins! 🚴‍♂️💪",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                "fitness_level": "Intermediate",
                "total_xp": 3900,
                "coins": 260,
                "streak": 7,
                "longest_streak": 12,
            },
            {
                "email": "marcus@fitquest.com",
                "username": "marcus_iron",
                "full_name": "Marcus Vance",
                "password": "MarcusPass123!",
                "role": "user",
                "bio": "Powerlifter and HIIT addict. Let's make every rep count and push boundaries! 🏋️‍♂️🔥",
                "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                "fitness_level": "Intermediate",
                "total_xp": 2250,
                "coins": 180,
                "streak": 5,
                "longest_streak": 9,
            },
            {
                "email": "elena@fitquest.com",
                "username": "elena_zen",
                "full_name": "Elena Rostova",
                "password": "ElenaPass123!",
                "role": "user",
                "bio": "Mindful movement advocate: vinyasa yoga, open-water swimming, and evening trail walks. 🧘‍♀️✨",
                "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
                "fitness_level": "Beginner",
                "total_xp": 1350,
                "coins": 120,
                "streak": 3,
                "longest_streak": 5,
            }
        ]

        users = {}
        for ud in demo_users_data:
            user = User(
                email=ud["email"],
                username=ud["username"],
                full_name=ud["full_name"],
                hashed_password=hash_password(ud["password"]),
                role=ud["role"],
                is_active=True,
                created_at=now - datetime.timedelta(days=20)
            )
            db.add(user)
            db.flush()

            profile = UserProfile(
                user_id=user.id,
                bio=ud["bio"],
                avatar_url=ud["avatar_url"],
                fitness_level=ud["fitness_level"],
                preferred_activities="running,cycling,gym",
                total_xp=ud["total_xp"],
                level=calculate_level(ud["total_xp"]),
                coins=ud["coins"],
                current_streak=ud["streak"],
                longest_streak=ud["longest_streak"],
                last_activity_date=today,
                is_public=True
            )
            db.add(profile)
            users[ud["username"]] = user

        db.commit()

        # 3. Create Sample Fitness Activities
        print("[*] Logging Sample Activities...")
        sample_activities = [
            # Sarah Chen (Runner)
            {
                "user": users["sarah_run"],
                "type": "running",
                "title": "Morning Lake Loop 10K",
                "duration": 52,
                "distance": 10.2,
                "intensity": "high",
                "days_ago": 0,
                "notes": "Paced 5:06 min/km. Felt smooth and energized all the way!"
            },
            {
                "user": users["sarah_run"],
                "type": "running",
                "title": "Tempo Hill Repeats",
                "duration": 45,
                "distance": 8.0,
                "intensity": "high",
                "days_ago": 1,
                "notes": "Elevations were tough but legs responded well."
            },
            {
                "user": users["sarah_run"],
                "type": "walking",
                "title": "Evening Recovery Stroll",
                "duration": 35,
                "distance": 3.2,
                "intensity": "low",
                "days_ago": 2,
                "notes": "Gentle cooldown stroll around the park."
            },
            # Alex Rivers (Hybrid)
            {
                "user": users["alex_fit"],
                "type": "cycling",
                "title": "River Trail Endurance Ride",
                "duration": 75,
                "distance": 28.5,
                "intensity": "medium",
                "days_ago": 0,
                "notes": "Great headwinds workout along the riverbanks."
            },
            {
                "user": users["alex_fit"],
                "type": "gym",
                "title": "Upper Body Hypertrophy",
                "duration": 50,
                "distance": 0.0,
                "intensity": "high",
                "days_ago": 1,
                "notes": "Chest & back supersets, finished with core work."
            },
            {
                "user": users["alex_fit"],
                "type": "running",
                "title": "5K Lunchtime Shakeout",
                "duration": 26,
                "distance": 5.1,
                "intensity": "medium",
                "days_ago": 2,
                "notes": "Quick run before team meetings."
            },
            # Marcus Vance (Strength)
            {
                "user": users["marcus_iron"],
                "type": "gym",
                "title": "Heavy Squats & Deadlifts",
                "duration": 65,
                "distance": 0.0,
                "intensity": "high",
                "days_ago": 0,
                "notes": "Hit new personal record on deadlift: 180kg x 3!"
            },
            {
                "user": users["marcus_iron"],
                "type": "hiit",
                "title": "Tabata Kettlebell Circuit",
                "duration": 30,
                "distance": 0.0,
                "intensity": "high",
                "days_ago": 1,
                "notes": "Heart rate through the roof! Super intense."
            },
            # Elena Rostova (Yoga/Swim)
            {
                "user": users["elena_zen"],
                "type": "yoga",
                "title": "Sunrise Vinyasa Flow",
                "duration": 45,
                "distance": 0.0,
                "intensity": "medium",
                "days_ago": 0,
                "notes": "Focused on hip openers and breathing meditation."
            },
            {
                "user": users["elena_zen"],
                "type": "swimming",
                "title": "Freestyle Lap Session",
                "duration": 40,
                "distance": 1.5,
                "intensity": "medium",
                "days_ago": 1,
                "notes": "Clean 60 laps in the 25m pool."
            }
        ]

        created_activities = []
        for sa in sample_activities:
            act_time = now - datetime.timedelta(days=sa["days_ago"], hours=3)
            rew = calculate_activity_rewards(
                activity_type=sa["type"],
                duration_minutes=sa["duration"],
                distance_km=sa["distance"],
                intensity=sa["intensity"]
            )
            act = Activity(
                user_id=sa["user"].id,
                activity_type=sa["type"],
                title=sa["title"],
                duration_minutes=sa["duration"],
                distance_km=sa["distance"],
                calories_burned=rew["calories"],
                xp_earned=rew["xp"],
                coins_earned=rew["coins"],
                intensity=sa["intensity"],
                activity_date=act_time,
                notes=sa["notes"]
            )
            db.add(act)
            created_activities.append(act)

        db.commit()

        # 4. Create Active Challenges
        print("[*] Creating Challenges...")
        challenges_data = [
            {
                "title": "Weekly 25K Stride Quest",
                "description": "Log at least 25 kilometers of running or walking this week. Keep your feet moving and climb the leaderboard!",
                "challenge_type": "weekly",
                "target_type": "distance_km",
                "target_value": 25.0,
                "activity_type": "running",
                "xp_reward": 250,
                "coins_reward": 100,
                "days_left": 6
            },
            {
                "title": "Century Cyclist Challenge",
                "description": "Pedal a total of 50 km this week across all your bike rides. Feel the speed and earn elite cyclist status!",
                "challenge_type": "weekly",
                "target_type": "distance_km",
                "target_value": 50.0,
                "activity_type": "cycling",
                "xp_reward": 350,
                "coins_reward": 150,
                "days_left": 5
            },
            {
                "title": "Iron Beast 300-Min Gym Grind",
                "description": "Accumulate 300 minutes of weightlifting, gym workouts, or HIIT sessions. Build discipline, power, and muscle!",
                "challenge_type": "weekly",
                "target_type": "duration_minutes",
                "target_value": 300.0,
                "activity_type": "gym",
                "xp_reward": 300,
                "coins_reward": 120,
                "days_left": 7
            },
            {
                "title": "Weekend 5K Sprint Blitz",
                "description": "Crush a fast 5 kilometer run this weekend. Perfect quick challenge for speedsters!",
                "challenge_type": "daily",
                "target_type": "distance_km",
                "target_value": 5.0,
                "activity_type": "running",
                "xp_reward": 120,
                "coins_reward": 50,
                "days_left": 2
            }
        ]

        created_challenges = []
        for cd in challenges_data:
            c = Challenge(
                title=cd["title"],
                description=cd["description"],
                challenge_type=cd["challenge_type"],
                target_type=cd["target_type"],
                target_value=cd["target_value"],
                activity_type=cd["activity_type"],
                xp_reward=cd["xp_reward"],
                coins_reward=cd["coins_reward"],
                start_date=now - datetime.timedelta(days=2),
                end_date=now + datetime.timedelta(days=cd["days_left"]),
                is_active=True,
                created_by=users["fitadmin"].id
            )
            db.add(c)
            created_challenges.append(c)

        db.commit()

        # Enroll demo users into challenges
        for c in created_challenges:
            # Sarah Chen participates in running challenges
            if c.activity_type == "running" or c.activity_type is None:
                p = ChallengeParticipant(
                    challenge_id=c.id,
                    user_id=users["sarah_run"].id,
                    current_progress=18.2,
                    is_completed=False,
                    reward_claimed=False
                )
                db.add(p)
            # Alex Rivers participates in cycling
            if c.activity_type == "cycling" or c.activity_type is None:
                p = ChallengeParticipant(
                    challenge_id=c.id,
                    user_id=users["alex_fit"].id,
                    current_progress=28.5,
                    is_completed=False,
                    reward_claimed=False
                )
                db.add(p)
            # Marcus Vance participates in gym grind
            if c.activity_type == "gym" or c.activity_type is None:
                p = ChallengeParticipant(
                    challenge_id=c.id,
                    user_id=users["marcus_iron"].id,
                    current_progress=115.0,
                    is_completed=False,
                    reward_claimed=False
                )
                db.add(p)

        db.commit()

        # 5. Friendships
        print("[*] Establishing Friendships...")
        friendships_list = [
            (users["alex_fit"].id, users["sarah_run"].id, "accepted"),
            (users["alex_fit"].id, users["marcus_iron"].id, "accepted"),
            (users["sarah_run"].id, users["marcus_iron"].id, "accepted"),
            (users["elena_zen"].id, users["sarah_run"].id, "accepted"),
            (users["elena_zen"].id, users["alex_fit"].id, "pending"),
        ]
        for req_id, add_id, st in friendships_list:
            fs = Friendship(requester_id=req_id, addressee_id=add_id, status=st)
            db.add(fs)

        db.commit()

        # 6. Social Feed Posts, Likes & Comments
        print("[*] Seeding Community Feed...")
        post1 = Post(
            user_id=users["sarah_run"].id,
            activity_id=created_activities[0].id,
            content="Early morning 10K around the lake! Crisp morning air and hit my target pace for 5 straight kilometers. Hope everyone gets their workouts in today!",
            likes_count=3,
            comments_count=2,
            created_at=now - datetime.timedelta(hours=4)
        )
        db.add(post1)
        db.flush()

        # Likes for post 1
        db.add(Like(post_id=post1.id, user_id=users["alex_fit"].id))
        db.add(Like(post_id=post1.id, user_id=users["marcus_iron"].id))
        db.add(Like(post_id=post1.id, user_id=users["elena_zen"].id))

        # Comments for post 1
        db.add(Comment(post_id=post1.id, user_id=users["alex_fit"].id, content="Awesome pace Sarah! That lake loop is no joke with the gravel stretches."))
        db.add(Comment(post_id=post1.id, user_id=users["marcus_iron"].id, content="Solid conditioning! Getting ready for that marathon."))

        post2 = Post(
            user_id=users["alex_fit"].id,
            activity_id=created_activities[3].id,
            content="28.5km along the river trail on two wheels! Headwinds on the return leg gave me quite a burn, but the view was 100% worth it.",
            likes_count=2,
            comments_count=1,
            created_at=now - datetime.timedelta(hours=2)
        )
        db.add(post2)
        db.flush()

        db.add(Like(post_id=post2.id, user_id=users["sarah_run"].id))
        db.add(Like(post_id=post2.id, user_id=users["elena_zen"].id))
        db.add(Comment(post_id=post2.id, user_id=users["elena_zen"].id, content="Beautiful day for a ride Alex! Safe travels."))

        post3 = Post(
            user_id=users["marcus_iron"].id,
            activity_id=created_activities[6].id,
            content="New deadlift milestone today: 180kg x 3 reps! Discipline in nutrition and sleep is finally paying off. Keep grinding team FitQuest!",
            likes_count=4,
            comments_count=1,
            created_at=now - datetime.timedelta(hours=1)
        )
        db.add(post3)
        db.flush()

        db.add(Like(post_id=post3.id, user_id=users["alex_fit"].id))
        db.add(Like(post_id=post3.id, user_id=users["sarah_run"].id))
        db.add(Like(post_id=post3.id, user_id=users["fitadmin"].id))
        db.add(Comment(post_id=post3.id, user_id=users["sarah_run"].id, content="Insane weight Marcus! Huge congrats on the PR!"))

        db.commit()

        # 7. Seed Badges for users
        print("[*] Awarding Initial User Badges...")
        for u in [users["sarah_run"], users["alex_fit"], users["marcus_iron"], users["elena_zen"], users["fitadmin"]]:
            check_and_award_badges(db, u.id)

        print("[+] Database seeding completed successfully!")
        print("Demo Accounts:")
        print("  Admin: admin@fitquest.com / AdminPass123!")
        print("  Users: alex@fitquest.com / AlexPass123!, sarah@fitquest.com / SarahPass123!, etc.")

    except Exception as e:
        print(f"[-] Error seeding database: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()

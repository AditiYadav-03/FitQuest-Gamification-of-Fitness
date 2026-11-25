from app.services.xp_engine import (
    calculate_calories,
    calculate_activity_rewards,
    calculate_level,
    get_level_progress,
    evaluate_streak,
)
import datetime

def test_calories_formula():
    # Running 30 mins, 70kg -> MET 9.8 * 3.5 * 70 / 200 * 30 ~ 360 calories
    cals = calculate_calories("running", 30, 70.0)
    assert 350 <= cals <= 370

def test_activity_rewards_calculation():
    # 45 mins cycling, 15 km, medium intensity
    rewards = calculate_activity_rewards("cycling", 45, 15.0, "medium")
    assert rewards["calories"] > 0
    assert rewards["xp"] > 0
    assert rewards["coins"] > 0
    # Coins should roughly be xp / 10
    assert rewards["coins"] == max(5, int(round(rewards["xp"] / 10)))

def test_level_progression():
    assert calculate_level(0) == 1
    assert calculate_level(99) == 1
    assert calculate_level(100) == 2
    assert calculate_level(400) == 3
    assert calculate_level(900) == 4
    assert calculate_level(8100) == 10

def test_level_progress_percentage():
    prog = get_level_progress(250)
    # Level 2 is from 100 to 400 XP (required 300 XP, 150 progress) -> 50%
    assert prog["level"] == 2
    assert prog["percentage"] == 50.0

def test_streak_evaluation():
    today = datetime.date(2026, 10, 31)
    yesterday = datetime.date(2026, 10, 30)
    old_date = datetime.date(2026, 10, 25)

    # First activity ever
    streak, xp, coins, is_new = evaluate_streak(None, today, 0)
    assert streak == 1
    assert is_new is True

    # Same day workout
    streak, xp, coins, is_new = evaluate_streak(today, today, 3)
    assert streak == 3
    assert is_new is False

    # Consecutive day workout (streak extends)
    streak, xp, coins, is_new = evaluate_streak(yesterday, today, 3)
    assert streak == 4
    assert xp > 0
    assert is_new is True

    # Broken streak
    streak, xp, coins, is_new = evaluate_streak(old_date, today, 5)
    assert streak == 1

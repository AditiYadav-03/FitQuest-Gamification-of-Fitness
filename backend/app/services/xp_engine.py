import datetime
from typing import Tuple, Dict, Any

MET_VALUES: Dict[str, float] = {
    "running": 9.8,
    "walking": 3.8,
    "cycling": 7.5,
    "gym": 6.0,
    "swimming": 8.0,
    "yoga": 3.0,
    "hiit": 10.0,
    "sports": 7.0,
    "other": 5.0
}

INTENSITY_MULTIPLIERS: Dict[str, float] = {
    "low": 0.85,
    "medium": 1.0,
    "high": 1.25
}

def calculate_calories(activity_type: str, duration_minutes: int, weight_kg: float = 70.0) -> int:
    """
    Standard METs formula: Calories = MET * 3.5 * weight (kg) / 200 * duration (minutes)
    """
    met = MET_VALUES.get(activity_type.lower(), 5.0)
    calories = (met * 3.5 * weight_kg / 200.0) * duration_minutes
    return max(1, int(round(calories)))

def calculate_activity_rewards(
    activity_type: str,
    duration_minutes: int,
    distance_km: float = 0.0,
    intensity: str = "medium",
    custom_calories: int = 0
) -> Dict[str, int]:
    """
    Calculates XP and FitCoins earned for completing an activity.
    XP = (duration * 3 + distance * 20 + calories / 10) * intensity_multiplier
    Coins = max(5, int(xp / 10))
    """
    calories = custom_calories if custom_calories > 0 else calculate_calories(activity_type, duration_minutes)
    multiplier = INTENSITY_MULTIPLIERS.get(intensity.lower(), 1.0)
    
    base_xp = (duration_minutes * 3) + int(distance_km * 20) + int(calories / 10)
    earned_xp = max(15, int(round(base_xp * multiplier)))
    earned_coins = max(5, int(round(earned_xp / 10)))

    return {
        "calories": calories,
        "xp": earned_xp,
        "coins": earned_coins
    }

def calculate_level(total_xp: int) -> int:
    """
    Level curve: level = floor(sqrt(XP / 100)) + 1
    Level 1: 0 - 99 XP
    Level 2: 100 - 399 XP
    Level 3: 400 - 899 XP
    Level 4: 900 - 1599 XP
    Level 5: 1600 - 2499 XP
    Level 10: 8100 XP
    """
    if total_xp < 0:
        return 1
    return int((total_xp / 100) ** 0.5) + 1

def get_level_progress(total_xp: int) -> Dict[str, Any]:
    level = calculate_level(total_xp)
    current_tier_xp = ((level - 1) ** 2) * 100
    next_tier_xp = (level ** 2) * 100
    progress_xp = total_xp - current_tier_xp
    required_xp = next_tier_xp - current_tier_xp
    percentage = min(100.0, round((progress_xp / max(1, required_xp)) * 100, 1))

    return {
        "level": level,
        "total_xp": total_xp,
        "current_tier_xp": current_tier_xp,
        "next_tier_xp": next_tier_xp,
        "progress_xp": progress_xp,
        "required_xp": required_xp,
        "percentage": percentage
    }

def evaluate_streak(last_date: datetime.date, current_date: datetime.date, current_streak: int) -> Tuple[int, int, int, bool]:
    """
    Evaluates streak continuation.
    Returns: (new_streak, bonus_xp, bonus_coins, is_new_streak_day)
    """
    if last_date is None:
        # First activity ever
        return 1, 20, 10, True

    diff = (current_date - last_date).days

    if diff == 0:
        # Already logged today, streak continues as is
        return current_streak, 0, 0, False
    elif diff == 1:
        # Consecutive day! Streak increases
        new_streak = current_streak + 1
        bonus_xp = min(200, new_streak * 10)
        bonus_coins = min(50, new_streak * 5)
        return new_streak, bonus_xp, bonus_coins, True
    else:
        # Streak broken
        return 1, 10, 5, True

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: 'user' | 'admin';
  is_active: boolean;
}

export interface LevelProgress {
  level: number;
  total_xp: number;
  current_tier_xp: number;
  next_tier_xp: number;
  progress_xp: number;
  required_xp: number;
  percentage: number;
}

export interface UserProfile {
  id: number;
  user_id: number;
  email: string;
  username: string;
  full_name: string;
  role: string;
  bio?: string;
  avatar_url?: string;
  fitness_level: string;
  preferred_activities: string;
  daily_step_goal: number;
  daily_calorie_goal: number;
  daily_active_minutes_goal: number;
  weekly_workout_goal: number;
  is_public: boolean;
  total_xp: number;
  level: number;
  coins: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  level_progress?: LevelProgress;
  badges_count: number;
  activities_count: number;
}

export interface FitnessGoal {
  id: number;
  user_id: number;
  title: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  unit: string;
  target_date?: string;
  is_completed: boolean;
  created_at: string;
}

export interface Activity {
  id: number;
  user_id: number;
  activity_type: string;
  title: string;
  duration_minutes: number;
  distance_km: number;
  calories_burned: number;
  xp_earned: number;
  coins_earned: number;
  intensity: 'low' | 'medium' | 'high';
  activity_date: string;
  notes?: string;
  created_at: string;
  unlocked_badges?: Badge[];
  streak_updated?: {
    current_streak: number;
    bonus_xp: number;
    bonus_coins: number;
    is_extended: boolean;
  };
}

export interface ActivitySummaryStats {
  total_activities: number;
  total_duration_minutes: number;
  total_distance_km: number;
  total_calories_burned: number;
  total_xp_earned: number;
  breakdown_by_type: Record<string, number>;
}

export interface Badge {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  xp_bonus: number;
  coins_bonus: number;
  requirement_type: string;
  requirement_value: number;
  is_earned?: boolean;
  earned_at?: string;
}

export interface XPTransaction {
  id: number;
  user_id: number;
  amount: number;
  action: string;
  reference_id?: number;
  description: string;
  created_at: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  challenge_type: 'daily' | 'weekly' | 'monthly';
  target_type: 'distance_km' | 'duration_minutes' | 'activities_count' | 'calories_burned';
  target_value: number;
  activity_type?: string;
  xp_reward: number;
  coins_reward: number;
  badge_reward_id?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by?: number;
  created_at: string;
  participants_count: number;
  is_joined: boolean;
  current_progress: number;
  is_completed: boolean;
  reward_claimed: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  full_name: string;
  avatar_url?: string;
  level: number;
  total_xp: number;
  current_streak: number;
  activities_count: number;
  badges_count: number;
}

export interface PostActivitySnippet {
  id: number;
  activity_type: string;
  title: string;
  duration_minutes: number;
  distance_km: number;
  calories_burned: number;
  xp_earned: number;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  username: string;
  full_name: string;
  avatar_url?: string;
  content: string;
  created_at: string;
}

export interface Post {
  id: number;
  user_id: number;
  username: string;
  full_name: string;
  avatar_url?: string;
  level: number;
  content: string;
  activity?: PostActivitySnippet;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
  comments: Comment[];
}

export interface Friendship {
  id: number;
  requester_id: number;
  addressee_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  partner_id: number;
  partner_username: string;
  partner_full_name: string;
  partner_avatar?: string;
  partner_level: number;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardData {
  user: {
    id: number;
    full_name: string;
    username: string;
    level: number;
    total_xp: number;
    coins: number;
    current_streak: number;
    longest_streak: number;
    level_progress: LevelProgress;
    badges_count: number;
  };
  today: {
    activities_count: number;
    minutes: number;
    calories: number;
    distance: number;
    xp: number;
    step_goal: number;
    calorie_goal: number;
    minutes_goal: number;
  };
  totals: {
    activities: number;
    minutes: number;
    calories: number;
    distance_km: number;
  };
  weekly_chart: Array<{
    date: string;
    full_date: string;
    minutes: number;
    calories: number;
    xp: number;
    distance: number;
  }>;
  type_breakdown: Array<{
    name: string;
    value: number;
  }>;
  active_challenges: Array<{
    id: number;
    title: string;
    challenge_type: string;
    target_type: string;
    target_value: number;
    current_progress: number;
    percentage: number;
    is_completed: boolean;
    xp_reward: number;
    end_date: string;
  }>;
  recent_activities: Array<{
    id: number;
    title: string;
    activity_type: string;
    duration_minutes: number;
    distance_km: number;
    calories_burned: number;
    xp_earned: number;
    activity_date: string;
  }>;
}

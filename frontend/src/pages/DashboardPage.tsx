import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Flame,
  Zap,
  Timer,
  Navigation,
  Trophy,
  Target,
  PlusCircle,
  TrendingUp,
  Activity as ActivityIcon,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import { DashboardData } from '../types';

const PIE_COLORS = ['#10E57A', '#38BDF8', '#A855F7', '#F59E0B', '#F43F5E', '#14B8A6'];

export const DashboardPage: React.FC = () => {
  const { profile, user } = useAuth();
  const { openActivityModal } = useOutletContext<{ openActivityModal: () => void }>();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await apiClient.get<DashboardData>('/analytics/dashboard');
      setDashboard(res.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading || !dashboard) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-brand-surface/40 rounded-3xl border border-brand-border" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-brand-surface/30 rounded-2xl border border-brand-border" />
          ))}
        </div>
        <div className="h-80 bg-brand-surface/30 rounded-2xl border border-brand-border" />
      </div>
    );
  }

  const { today, user: dashUser, weekly_chart, type_breakdown, active_challenges, recent_activities } = dashboard;
  const levelProgress = dashUser.level_progress;

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-brand-surface/90 via-brand-card/90 to-brand-surface/90 border border-brand-border/80 shadow-xl">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/15 border border-brand-primary/30 text-xs font-bold text-brand-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Level {dashUser.level} Athlete</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Welcome back, <span className="text-gradient-lime">{dashUser.full_name}</span>!
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted max-w-xl">
              You are currently on an active <strong className="text-brand-flame">{dashUser.current_streak}-Day Streak</strong>! Log a workout today to keep the multiplier burning.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              className="shadow-glow-lime"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={openActivityModal}
            >
              Record Activity
            </Button>
            <Link to="/challenges">
              <Button variant="secondary" size="md" leftIcon={<Target className="w-4 h-4 text-brand-blue" />}>
                View Quests
              </Button>
            </Link>
          </div>
        </div>

        {/* Level XP Bar inside Banner */}
        <div className="mt-6 pt-5 border-t border-brand-border/60">
          <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
            <span className="text-white">Level Progression</span>
            <span className="text-brand-primary">{levelProgress?.percentage || 0}% ({levelProgress?.progress_xp || 0} / {levelProgress?.required_xp || 100} XP to Level {dashUser.level + 1})</span>
          </div>
          <div className="w-full bg-brand-bg rounded-full h-3 overflow-hidden border border-brand-border/40">
            <div
              className="bg-gradient-to-r from-brand-primary to-brand-blue h-full rounded-full transition-all duration-500 shadow-glow-lime"
              style={{ width: `${levelProgress?.percentage || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Today's 4-Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Workouts Today */}
        <div className="glass-panel p-5 rounded-2xl border border-brand-border/70 hover:border-brand-primary/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">Today's Workouts</span>
            <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center">
              <ActivityIcon className="w-4 h-4 text-brand-primary" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{today.activities_count}</div>
          <div className="text-[11px] text-brand-muted mt-1">
            {today.activities_count > 0 ? 'Goal active today' : 'No workout recorded yet today'}
          </div>
        </div>

        {/* Active Minutes */}
        <div className="glass-panel p-5 rounded-2xl border border-brand-border/70 hover:border-brand-blue/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">Active Minutes</span>
            <div className="w-8 h-8 rounded-xl bg-brand-blue/10 flex items-center justify-center">
              <Timer className="w-4 h-4 text-brand-blue" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{today.minutes} <span className="text-xs font-normal text-brand-muted">/ {today.minutes_goal}m</span></div>
          <div className="w-full bg-brand-bg rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-brand-blue h-full rounded-full"
              style={{ width: `${Math.min(100, Math.round((today.minutes / today.minutes_goal) * 100))}%` }}
            />
          </div>
        </div>

        {/* Calories Burned */}
        <div className="glass-panel p-5 rounded-2xl border border-brand-border/70 hover:border-orange-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">Calories Burned</span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{today.calories} <span className="text-xs font-normal text-brand-muted">/ {today.calorie_goal} kcal</span></div>
          <div className="w-full bg-brand-bg rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-orange-500 h-full rounded-full"
              style={{ width: `${Math.min(100, Math.round((today.calories / today.calorie_goal) * 100))}%` }}
            />
          </div>
        </div>

        {/* XP Gained Today */}
        <div className="glass-panel p-5 rounded-2xl border border-brand-border/70 hover:border-brand-gold/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">XP Gained Today</span>
            <div className="w-8 h-8 rounded-xl bg-brand-gold/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-brand-gold" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">+{today.xp} <span className="text-xs font-normal text-brand-muted">XP</span></div>
          <div className="text-[11px] text-brand-gold font-semibold mt-1">
            Vault: 🪙 {dashUser.coins} FitCoins
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-brand-border/70">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-primary" />
                7-Day Activity & XP Velocity
              </h3>
              <p className="text-xs text-brand-muted mt-0.5">Experience and workout duration recorded this week</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10E57A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10E57A" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="minGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#131B2E',
                    borderColor: '#2A374F',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                />
                <Area type="monotone" dataKey="xp" name="XP Earned" stroke="#10E57A" strokeWidth={2} fillOpacity={1} fill="url(#xpGradient)" />
                <Area type="monotone" dataKey="minutes" name="Minutes" stroke="#38BDF8" strokeWidth={2} fillOpacity={1} fill="url(#minGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Distribution Donut */}
        <div className="glass-panel p-6 rounded-2xl border border-brand-border/70 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Workout Distribution</h3>
            <p className="text-xs text-brand-muted mb-4">Breakdown by sport & workout category</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {type_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={type_breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {type_breakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#131B2E',
                      borderColor: '#2A374F',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-brand-muted">
                No activity data yet. Log your first workout!
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {type_breakdown.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[11px] text-brand-muted">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Quests & Recent Workouts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Enrolled Challenges */}
        <div className="glass-panel p-6 rounded-2xl border border-brand-border/70">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-blue" />
              Active Fitness Quests
            </h3>
            <Link to="/challenges" className="text-xs text-brand-primary hover:underline font-semibold flex items-center gap-0.5">
              Browse All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {active_challenges.length === 0 ? (
              <div className="py-8 text-center bg-brand-surface/20 rounded-xl border border-dashed border-brand-border/60">
                <Target className="w-8 h-8 text-brand-muted mx-auto mb-2 opacity-50" />
                <p className="text-xs text-brand-muted">You have not joined any active quests yet.</p>
                <Link to="/challenges">
                  <Button variant="outline" size="sm" className="mt-3">
                    Explore Available Quests
                  </Button>
                </Link>
              </div>
            ) : (
              active_challenges.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-brand-surface/40 border border-brand-border/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white truncate max-w-[200px]">{c.title}</span>
                    <span className="text-xs font-extrabold text-brand-primary">+{c.xp_reward} XP</span>
                  </div>
                  <div className="w-full bg-brand-bg rounded-full h-2 overflow-hidden mb-1.5">
                    <div
                      className="bg-gradient-to-r from-brand-blue to-brand-primary h-full rounded-full"
                      style={{ width: `${c.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-brand-muted">
                    <span>{c.current_progress} / {c.target_value} {c.target_type.replace('_', ' ')}</span>
                    <span className="font-semibold text-brand-text">{c.percentage}% Complete • Ends {c.end_date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activities Log */}
        <div className="glass-panel p-6 rounded-2xl border border-brand-border/70">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ActivityIcon className="w-4 h-4 text-brand-primary" />
              Recent Activities
            </h3>
            <Link to="/activities" className="text-xs text-brand-primary hover:underline font-semibold flex items-center gap-0.5">
              View History <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recent_activities.length === 0 ? (
              <div className="py-8 text-center bg-brand-surface/20 rounded-xl border border-dashed border-brand-border/60">
                <p className="text-xs text-brand-muted">No activities logged yet.</p>
                <Button variant="primary" size="sm" className="mt-3" onClick={openActivityModal}>
                  Log Your First Workout
                </Button>
              </div>
            ) : (
              recent_activities.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-brand-surface/40 border border-brand-border/50 hover:border-brand-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-surface border border-brand-border/80 flex items-center justify-center font-bold text-sm">
                      {a.activity_type === 'running' && '🏃‍♂️'}
                      {a.activity_type === 'cycling' && '🚴‍♂️'}
                      {a.activity_type === 'gym' && '🏋️‍♂️'}
                      {a.activity_type === 'walking' && '🚶‍♂️'}
                      {a.activity_type === 'swimming' && '🏊‍♂️'}
                      {a.activity_type === 'yoga' && '🧘‍♀️'}
                      {a.activity_type === 'hiit' && '⚡'}
                      {a.activity_type === 'sports' && '⚽'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{a.title}</h4>
                      <p className="text-[10px] text-brand-muted">
                        {a.duration_minutes} mins {a.distance_km > 0 && `• ${a.distance_km} km`} • {a.calories_burned} kcal • {a.activity_date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-brand-primary">+{a.xp_earned} XP</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

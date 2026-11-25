import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  Flame,
  Zap,
  Timer,
  PlusCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { FitnessGoal, DashboardData } from '../types';

export const AnalyticsPage: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useNotification();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [xpTrends, setXpTrends] = useState<any[]>([]);
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Goal Modal state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalType, setGoalType] = useState('weekly_workouts');
  const [goalTarget, setGoalTarget] = useState(4);
  const [goalUnit, setGoalUnit] = useState('workouts');
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, trendsRes, goalsRes] = await Promise.all([
        apiClient.get<DashboardData>('/analytics/dashboard'),
        apiClient.get<any[]>('/analytics/xp-trends'),
        apiClient.get<FitnessGoal[]>('/users/goals/list'),
      ]);
      setDashboard(dashRes.data);
      setXpTrends(trendsRes.data);
      setGoals(goalsRes.data);
    } catch (err) {
      console.error('Analytics load error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGoal(true);
    try {
      const res = await apiClient.post<FitnessGoal>('/users/goals/create', {
        title: goalTitle,
        goal_type: goalType,
        target_value: goalTarget,
        unit: goalUnit,
      });
      setGoals([res.data, ...goals]);
      showToast('success', 'Goal Created!', 'Track your progress and stay dedicated.');
      setIsGoalModalOpen(false);
      setGoalTitle('');
    } catch (err) {
      showToast('error', 'Error', 'Could not create goal.');
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleToggleGoalCompleted = async (goal: FitnessGoal) => {
    try {
      const res = await apiClient.put<FitnessGoal>(`/users/goals/${goal.id}`, {
        is_completed: !goal.is_completed,
      });
      setGoals((prev) => prev.map((g) => (g.id === goal.id ? res.data : g)));
      showToast('success', 'Goal Updated', res.data.is_completed ? 'Goal completed! 🎯' : 'Goal reopened.');
    } catch (err) {
      showToast('error', 'Error', 'Could not update goal.');
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      await apiClient.delete(`/users/goals/${id}`);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      showToast('info', 'Goal Removed', 'Fitness goal deleted.');
    } catch (err) {
      showToast('error', 'Error', 'Failed to delete goal.');
    }
  };

  if (isLoading || !dashboard) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-brand-surface/40 rounded-3xl border border-brand-border" />
        <div className="h-80 bg-brand-surface/30 rounded-2xl border border-brand-border" />
      </div>
    );
  }

  const { weekly_chart, totals, user: dashUser } = dashboard;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-brand-blue" />
            Performance Analytics & Progression
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Data-backed metrics on your fitness volume, XP velocity, and personal target goals.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => setIsGoalModalOpen(true)}
        >
          Set Fitness Goal
        </Button>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-brand-border/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Total Volume</span>
          <div className="text-2xl font-black text-white mt-1">{totals.activities} Workouts</div>
          <p className="text-[11px] text-brand-muted mt-1">{Math.round(totals.minutes / 60)} lifetime hours trained</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-brand-border/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Total Distance</span>
          <div className="text-2xl font-black text-brand-blue mt-1">{totals.distance_km} km</div>
          <p className="text-[11px] text-brand-muted mt-1">Traversed across all outdoor sessions</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-brand-border/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Discipline Streak</span>
          <div className="text-2xl font-black text-brand-flame mt-1 flex items-center gap-1.5">
            <Flame className="w-6 h-6 fill-current" />
            {dashUser.current_streak} Days
          </div>
          <p className="text-[11px] text-brand-muted mt-1">Personal record: {dashUser.longest_streak} days</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-brand-border/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Total XP Acquired</span>
          <div className="text-2xl font-black text-brand-primary mt-1">
            {dashUser.total_xp.toLocaleString()} XP
          </div>
          <p className="text-[11px] text-brand-primary/80 font-semibold mt-1">Level {dashUser.level} Elite Rank</p>
        </div>
      </div>

      {/* Chart 1: Cumulative XP Growth */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-border/70 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-primary" />
            Cumulative Experience (XP) Progression Curve
          </h3>
          <p className="text-xs text-brand-muted">30-day continuous athlete development trajectory</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={xpTrends.length > 0 ? xpTrends : weekly_chart}>
              <defs>
                <linearGradient id="cumXpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10E57A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10E57A" stopOpacity={0.0} />
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
              <Area
                type="monotone"
                dataKey={xpTrends.length > 0 ? 'cumulative_xp' : 'xp'}
                name="Cumulative XP"
                stroke="#10E57A"
                strokeWidth={2.5}
                fill="url(#cumXpGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Daily Minutes & Calories Breakdown */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-border/70 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Timer className="w-5 h-5 text-brand-blue" />
            Past 7 Days Daily Workout Duration & Caloric Burn
          </h3>
          <p className="text-xs text-brand-muted">Comparison of training minutes vs calories burned</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly_chart}>
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#131B2E',
                  borderColor: '#2A374F',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
              <Bar dataKey="minutes" name="Duration (min)" fill="#38BDF8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="calories" name="Calories (kcal)" fill="#F97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fitness Goals Tracker */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-border/70 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-primary" />
              Active Fitness Goals
            </h3>
            <p className="text-xs text-brand-muted">Set targets and monitor your consistency</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsGoalModalOpen(true)}>
            + Add Goal
          </Button>
        </div>

        {goals.length === 0 ? (
          <div className="py-8 text-center bg-brand-surface/20 rounded-xl border border-dashed border-brand-border/60 p-6">
            <Target className="w-8 h-8 text-brand-muted mx-auto mb-2 opacity-50" />
            <p className="text-xs text-brand-muted">No custom goals set yet. Define your first target!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((g) => (
              <div key={g.id} className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border/60 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className={`text-sm font-bold ${g.is_completed ? 'line-through text-brand-muted' : 'text-white'}`}>
                      {g.title}
                    </h4>
                    <span className="text-[10px] text-brand-muted uppercase tracking-wider font-semibold">
                      Target: {g.target_value} {g.unit}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleGoalCompleted(g)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      g.is_completed
                        ? 'bg-brand-primary/20 text-brand-primary border-brand-primary/40'
                        : 'border-brand-border text-brand-muted hover:text-white'
                    }`}
                    title={g.is_completed ? 'Mark incomplete' : 'Mark completed'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-brand-border/40 text-xs">
                  <span className={`text-[11px] font-bold ${g.is_completed ? 'text-brand-primary' : 'text-brand-blue'}`}>
                    {g.is_completed ? 'Completed 🎉' : 'In Progress'}
                  </span>
                  <button
                    onClick={() => handleDeleteGoal(g.id)}
                    className="text-[10px] text-brand-muted hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {isGoalModalOpen && (
        <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Create Personal Fitness Goal">
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <Input
              label="Goal Title"
              placeholder="e.g. 5 Workouts This Week, Run 30km in November"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted block mb-1.5">
                  Goal Type
                </label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border text-brand-text text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-primary"
                >
                  <option value="weekly_workouts">Weekly Workouts</option>
                  <option value="monthly_distance">Monthly Distance</option>
                  <option value="calories_target">Calorie Burn Target</option>
                  <option value="active_minutes">Active Minutes</option>
                </select>
              </div>

              <Input
                type="number"
                label="Target Amount"
                min={1}
                value={goalTarget}
                onChange={(e) => setGoalTarget(Number(e.target.value))}
                required
              />
            </div>

            <Input
              label="Unit of Measurement"
              placeholder="e.g. workouts, km, kcal, mins"
              value={goalUnit}
              onChange={(e) => setGoalUnit(e.target.value)}
              required
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
              <Button type="button" variant="ghost" onClick={() => setIsGoalModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSavingGoal}>
                Set Target Goal
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

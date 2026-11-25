import React, { useState, useEffect } from 'react';
import {
  User,
  Edit3,
  Award,
  Zap,
  Flame,
  Shield,
  Lock,
  CheckCircle,
  Coins,
  History,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Badge, XPTransaction } from '../types';

export const ProfilePage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const { showToast } = useNotification();

  const [badges, setBadges] = useState<Badge[]>([]);
  const [transactions, setTransactions] = useState<XPTransaction[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Profile Edit form states
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('Beginner');
  const [stepGoal, setStepGoal] = useState(8000);
  const [calorieGoal, setCalorieGoal] = useState(500);
  const [minutesGoal, setMinutesGoal] = useState(45);
  const [isPublic, setIsPublic] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfileDetails = async () => {
    setIsLoading(true);
    try {
      const [badgesRes, txRes] = await Promise.all([
        apiClient.get<Badge[]>('/gamification/badges'),
        apiClient.get<XPTransaction[]>('/gamification/transactions'),
      ]);
      setBadges(badgesRes.data);
      setTransactions(txRes.data);
    } catch (err) {
      console.error('Failed to load profile details', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
    if (profile) {
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
      setFitnessLevel(profile.fitness_level || 'Beginner');
      setStepGoal(profile.daily_step_goal || 8000);
      setCalorieGoal(profile.daily_calorie_goal || 500);
      setMinutesGoal(profile.daily_active_minutes_goal || 45);
      setIsPublic(profile.is_public ?? true);
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.put('/users/profile', {
        bio,
        avatar_url: avatarUrl,
        fitness_level: fitnessLevel,
        daily_step_goal: stepGoal,
        daily_calorie_goal: calorieGoal,
        daily_active_minutes_goal: minutesGoal,
        is_public: isPublic,
      });
      await refreshProfile();
      showToast('success', 'Profile Updated', 'Your athlete preferences have been saved.');
      setIsEditModalOpen(false);
    } catch (err) {
      showToast('error', 'Update Failed', 'Could not save profile updates.');
    } finally {
      setIsSaving(false);
    }
  };

  const unlockedCount = badges.filter((b) => b.is_earned).length;
  const levelProgress = profile?.level_progress;

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative">
              <img
                src={
                  profile?.avatar_url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                }
                alt="Avatar"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-brand-primary shadow-glow-lime"
              />
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-black border border-brand-primary text-brand-primary font-black text-[10px] uppercase">
                Lvl {profile?.level}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white">{profile?.full_name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-brand-surface border border-brand-border text-xs font-semibold text-brand-muted">
                  @{profile?.username}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-brand-primary/15 border border-brand-primary/30 text-xs font-bold text-brand-primary">
                  {profile?.fitness_level} Tier
                </span>
              </div>
              <p className="text-xs text-brand-muted max-w-xl leading-relaxed">{profile?.bio}</p>
              <div className="flex items-center gap-4 text-xs text-brand-muted pt-1">
                <span className="flex items-center gap-1">
                  {profile?.is_public ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-brand-primary" /> Public Profile
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-brand-muted" /> Private Profile
                    </>
                  )}
                </span>
                <span>• {profile?.activities_count} Workouts Recorded</span>
                <span>• {unlockedCount} / {badges.length} Badges Unlocked</span>
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            size="md"
            leftIcon={<Edit3 className="w-4 h-4" />}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </Button>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-6 pt-6 border-t border-brand-border/60">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-brand-primary" />
              Level {profile?.level} Mastery
            </span>
            <span className="text-brand-primary">
              {levelProgress?.percentage || 0}% ({levelProgress?.progress_xp || 0} / {levelProgress?.required_xp || 100} XP)
            </span>
          </div>
          <div className="w-full bg-brand-bg rounded-full h-2.5 overflow-hidden border border-brand-border/40">
            <div
              className="bg-gradient-to-r from-brand-primary to-brand-blue h-full rounded-full transition-all duration-500 shadow-glow-lime"
              style={{ width: `${levelProgress?.percentage || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Gamification Stats Vault */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-brand-border/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Experience XP</span>
            <Zap className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="text-2xl font-black text-white">{profile?.total_xp.toLocaleString()}</div>
          <p className="text-[10px] text-brand-muted mt-0.5">Lifetime earned experience</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-brand-border/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">FitCoins Vault</span>
            <span className="text-base">🪙</span>
          </div>
          <div className="text-2xl font-black text-brand-gold">{profile?.coins.toLocaleString()}</div>
          <p className="text-[10px] text-brand-muted mt-0.5">Reward balance</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-brand-border/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Active Streak</span>
            <Flame className="w-4 h-4 text-brand-flame fill-current" />
          </div>
          <div className="text-2xl font-black text-brand-flame">{profile?.current_streak} Days</div>
          <p className="text-[10px] text-brand-muted mt-0.5">Best record: {profile?.longest_streak} days</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-brand-border/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Badges Unlocked</span>
            <Award className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="text-2xl font-black text-brand-blue">{unlockedCount} / {badges.length}</div>
          <p className="text-[10px] text-brand-muted mt-0.5">Trophy collection</p>
        </div>
      </div>

      {/* Badges Showcase Grid */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border/70 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-gold" />
            Achievement Badges Showcase
          </h2>
          <p className="text-xs text-brand-muted">
            Tiered badges unlocked through verified workout milestones, streaks, and endurance.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {badges.map((badge) => {
            const isEarned = badge.is_earned;

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${
                  isEarned
                    ? 'glass-card border-brand-primary/40 bg-brand-surface/70 shadow-glow-lime'
                    : 'bg-brand-surface/20 border-brand-border/40 opacity-50 grayscale'
                }`}
              >
                <div className="relative mb-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${
                      isEarned
                        ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary'
                        : 'bg-brand-surface border-brand-border text-brand-muted'
                    }`}
                  >
                    {isEarned ? '🏆' : <Lock className="w-5 h-5 text-brand-muted" />}
                  </div>
                  {isEarned && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-primary text-black font-black text-[9px] flex items-center justify-center">
                      ✓
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{badge.name}</h4>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-brand-primary">
                    {badge.tier}
                  </span>
                  <p className="text-[10px] text-brand-muted mt-1 leading-tight line-clamp-2">
                    {badge.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-brand-border/40 w-full text-[10px] font-semibold text-brand-gold">
                  +{badge.xp_bonus} XP • +{badge.coins_bonus} 🪙
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* XP Transaction History */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-border/70 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-brand-primary" />
            XP & FitCoin Transaction History
          </h3>
          <p className="text-xs text-brand-muted">Audit log of all rewarded actions</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-surface/60 border-b border-brand-border/60 text-brand-muted uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">XP Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-brand-muted text-xs">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-brand-surface/30">
                    <td className="py-2.5 px-3 text-brand-muted text-[11px]">
                      {new Date(tx.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white uppercase text-[10px]">
                      {tx.action.replace('_', ' ')}
                    </td>
                    <td className="py-2.5 px-3 text-brand-muted text-xs">{tx.description}</td>
                    <td className="py-2.5 px-3 text-right font-black text-brand-primary text-xs">
                      +{tx.amount} XP
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Athlete Profile">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Bio & Philosophy"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other athletes about your goals..."
            />

            <Input
              label="Avatar Photo URL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
            />

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted block mb-1.5">
                Fitness Tier
              </label>
              <select
                value={fitnessLevel}
                onChange={(e) => setFitnessLevel(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border text-brand-text text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-primary"
              >
                <option value="Beginner">Beginner (Starting Quest)</option>
                <option value="Intermediate">Intermediate (Consistent)</option>
                <option value="Advanced">Advanced (Endurance Focused)</option>
                <option value="Elite">Elite (Competitor)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                label="Daily Calorie Goal"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(Number(e.target.value))}
              />
              <Input
                type="number"
                label="Daily Active Minutes"
                value={minutesGoal}
                onChange={(e) => setMinutesGoal(Number(e.target.value))}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 rounded border-brand-border bg-brand-surface text-brand-primary focus:ring-brand-primary accent-[#10E57A]"
              />
              <label htmlFor="is_public" className="text-xs text-brand-muted cursor-pointer">
                Public profile (visible on global leaderboards and community search)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
              <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSaving}>
                Save Profile
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

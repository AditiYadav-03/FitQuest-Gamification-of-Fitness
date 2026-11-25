import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Target,
  Activity as ActivityIcon,
  Zap,
  Trash2,
  UserCheck,
  UserX,
  PlusCircle,
  MessageSquare,
  Search,
  Lock,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Challenge, Post } from '../types';

interface AdminStats {
  total_users: number;
  active_users: number;
  total_activities: number;
  total_challenges: number;
  total_posts: number;
  total_xp_awarded: number;
  total_coins_circulating: number;
  total_badges_awarded: number;
}

interface AdminUserItem {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
  level: number;
  total_xp: number;
  coins: number;
  streak: number;
  created_at: string;
}

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Challenge modal state
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cType, setCType] = useState('weekly');
  const [cTargetType, setCTargetType] = useState('distance_km');
  const [cTargetVal, setCTargetVal] = useState(25);
  const [cActivityType, setCActivityType] = useState('');
  const [cXpReward, setCXpReward] = useState(250);
  const [cCoinsReward, setCCoinsReward] = useState(100);
  const [cDays, setCDays] = useState(7);
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, challengesRes, postsRes] = await Promise.all([
        apiClient.get<AdminStats>('/admin/stats'),
        apiClient.get<AdminUserItem[]>('/admin/users'),
        apiClient.get<Challenge[]>('/challenges'),
        apiClient.get<Post[]>('/social/feed?limit=20'),
      ]);
      setStats(statsRes.data);
      setUsersList(usersRes.data);
      setChallenges(challengesRes.data);
      setPosts(postsRes.data);
    } catch (err: any) {
      console.error('Admin fetch error', err);
      showToast('error', 'Admin Access Denied', err.response?.data?.detail || 'Unauthorized');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="py-20 text-center glass-panel rounded-3xl border border-red-500/40 p-8 max-w-lg mx-auto">
        <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Restricted Access</h2>
        <p className="text-xs text-brand-muted leading-relaxed">
          You do not have administrative permissions to view this control panel. Please sign in with an admin account (e.g. admin@fitquest.com).
        </p>
      </div>
    );
  }

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await apiClient.put(`/admin/users/${userId}/status?is_active=${!currentStatus}`);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u))
      );
      showToast('info', 'Status Updated', `User ${!currentStatus ? 'activated' : 'deactivated'}.`);
    } catch (err: any) {
      showToast('error', 'Action Failed', err.response?.data?.detail || 'Could not change status');
    }
  };

  const handleToggleRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await apiClient.put(`/admin/users/${userId}/role?role=${newRole}`);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      showToast('success', 'Role Updated', `User role set to ${newRole}.`);
    } catch (err: any) {
      showToast('error', 'Action Failed', err.response?.data?.detail || 'Could not change role');
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingChallenge(true);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + cDays);

    try {
      const res = await apiClient.post<Challenge>('/admin/challenges', {
        title: cTitle,
        description: cDesc,
        challenge_type: cType,
        target_type: cTargetType,
        target_value: cTargetVal,
        activity_type: cActivityType || null,
        xp_reward: cXpReward,
        coins_reward: cCoinsReward,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });
      setChallenges([res.data, ...challenges]);
      showToast('success', 'Quest Created', `"${cTitle}" is now active for all athletes!`);
      setIsChallengeModalOpen(false);
      setCTitle('');
      setCDesc('');
    } catch (err) {
      showToast('error', 'Error', 'Failed to create challenge.');
    } finally {
      setIsCreatingChallenge(false);
    }
  };

  const handleDeleteChallenge = async (id: number) => {
    if (!window.confirm('Delete this challenge?')) return;
    try {
      await apiClient.delete(`/admin/challenges/${id}`);
      setChallenges((prev) => prev.filter((c) => c.id !== id));
      showToast('info', 'Challenge Deleted', 'Quest removed from platform.');
    } catch (err) {
      showToast('error', 'Error', 'Could not delete challenge.');
    }
  };

  const handleModeratePost = async (id: number) => {
    if (!window.confirm('Remove this post for inappropriate content?')) return;
    try {
      await apiClient.delete(`/admin/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      showToast('info', 'Post Moderated', 'Post removed.');
    } catch (err) {
      showToast('error', 'Error', 'Could not moderate post.');
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.username.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      u.full_name.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-brand-primary" />
            FitQuest Master Administration
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Platform KPI telemetry, athlete management, challenge orchestration and moderation.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => setIsChallengeModalOpen(true)}
        >
          Create New Quest
        </Button>
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-brand-border/70">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Registered Athletes</span>
            <div className="text-2xl font-black text-white mt-1">{stats.total_users}</div>
            <p className="text-[10px] text-brand-primary mt-0.5">{stats.active_users} active accounts</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-brand-border/70">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Total Workouts</span>
            <div className="text-2xl font-black text-brand-blue mt-1">{stats.total_activities}</div>
            <p className="text-[10px] text-brand-muted mt-0.5">Recorded across all sports</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-brand-border/70">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Total XP Awarded</span>
            <div className="text-2xl font-black text-brand-primary mt-1">{stats.total_xp_awarded.toLocaleString()}</div>
            <p className="text-[10px] text-brand-muted mt-0.5">🪙 {stats.total_coins_circulating.toLocaleString()} FitCoins</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-brand-border/70">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Badges Claimed</span>
            <div className="text-2xl font-black text-brand-gold mt-1">{stats.total_badges_awarded}</div>
            <p className="text-[10px] text-brand-muted mt-0.5">{stats.total_challenges} active quests</p>
          </div>
        </div>
      )}

      {/* User Management Section */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-border/70 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-primary" />
              User & Athlete Directory
            </h3>
            <p className="text-xs text-brand-muted">Manage user roles and active status</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by name or email..."
              value={searchUserQuery}
              onChange={(e) => setSearchUserQuery(e.target.value)}
              className="w-full bg-brand-surface/60 border border-brand-border text-xs rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-surface/60 border-b border-brand-border text-brand-muted uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Athlete</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Level / XP</th>
                <th className="py-2.5 px-3">Streak</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-brand-surface/30">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{u.full_name}</div>
                    <div className="text-[11px] text-brand-muted">{u.email} • @{u.username}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.role === 'admin'
                          ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/40'
                          : 'bg-brand-surface text-brand-muted'
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-white">Lvl {u.level}</span>
                    <span className="text-brand-muted text-[11px]"> ({u.total_xp} XP)</span>
                  </td>
                  <td className="py-3 px-3 text-brand-flame font-bold">
                    {u.streak}d
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.is_active
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    {u.id !== user?.id && (
                      <>
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                          className="text-[11px] font-semibold text-brand-muted hover:text-white underline"
                        >
                          {u.is_active ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleToggleRole(u.id, u.role)}
                          className="text-[11px] font-semibold text-brand-primary hover:underline"
                        >
                          {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Challenge Management */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-border/70 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-blue" />
              Active Platform Quests
            </h3>
            <p className="text-xs text-brand-muted">Live challenges available to the userbase</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsChallengeModalOpen(true)}>
            + New Quest
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((c) => (
            <div key={c.id} className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-brand-primary">
                    {c.challenge_type}
                  </span>
                  <button
                    onClick={() => handleDeleteChallenge(c.id)}
                    className="text-brand-muted hover:text-red-400"
                    title="Delete Challenge"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="text-sm font-bold text-white mt-1">{c.title}</h4>
                <p className="text-xs text-brand-muted mt-0.5 line-clamp-2">{c.description}</p>
              </div>

              <div className="pt-2 border-t border-brand-border/40 flex justify-between text-xs">
                <span className="text-brand-muted">
                  Target: {c.target_value} {c.target_type.replace('_', ' ')}
                </span>
                <span className="font-bold text-brand-primary">+{c.xp_reward} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post Moderation */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-border/70 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-orange-400" />
            Community Moderation Feed
          </h3>
          <p className="text-xs text-brand-muted">Review recently published community updates</p>
        </div>

        <div className="space-y-3">
          {posts.slice(0, 8).map((p) => (
            <div key={p.id} className="p-3.5 rounded-xl bg-brand-surface/40 border border-brand-border flex items-center justify-between gap-4">
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">
                  {p.full_name} <span className="text-brand-muted font-normal">(@{p.username})</span>
                </div>
                <p className="text-xs text-brand-muted truncate mt-0.5">{p.content}</p>
              </div>
              <button
                onClick={() => handleModeratePost(p.id)}
                className="px-2.5 py-1 text-[11px] font-bold text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Challenge Modal */}
      {isChallengeModalOpen && (
        <Modal isOpen={isChallengeModalOpen} onClose={() => setIsChallengeModalOpen(false)} title="Create Fitness Quest">
          <form onSubmit={handleCreateChallenge} className="space-y-4">
            <Input
              label="Quest Title"
              placeholder="e.g. November 50K Marathon Challenge"
              value={cTitle}
              onChange={(e) => setCTitle(e.target.value)}
              required
            />
            <Input
              label="Description"
              placeholder="Instructions and motivation for athletes..."
              value={cDesc}
              onChange={(e) => setCDesc(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted block mb-1">
                  Quest Frequency
                </label>
                <select
                  value={cType}
                  onChange={(e) => setCType(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border text-brand-text text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-primary"
                >
                  <option value="daily">Daily Blitz</option>
                  <option value="weekly">Weekly Quest</option>
                  <option value="monthly">Monthly Endurance</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted block mb-1">
                  Target Metric
                </label>
                <select
                  value={cTargetType}
                  onChange={(e) => setCTargetType(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-border text-brand-text text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-primary"
                >
                  <option value="distance_km">Distance (Kilometers)</option>
                  <option value="duration_minutes">Duration (Minutes)</option>
                  <option value="activities_count">Activity Count</option>
                  <option value="calories_burned">Calories Burned</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                type="number"
                label="Target Goal"
                value={cTargetVal}
                onChange={(e) => setCTargetVal(Number(e.target.value))}
                required
              />
              <Input
                type="number"
                label="XP Reward"
                value={cXpReward}
                onChange={(e) => setCXpReward(Number(e.target.value))}
                required
              />
              <Input
                type="number"
                label="FitCoins Reward"
                value={cCoinsReward}
                onChange={(e) => setCCoinsReward(Number(e.target.value))}
                required
              />
            </div>

            <Input
              type="number"
              label="Quest Duration (Days)"
              value={cDays}
              onChange={(e) => setCDays(Number(e.target.value))}
              required
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
              <Button type="button" variant="ghost" onClick={() => setIsChallengeModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isCreatingChallenge}>
                Launch Quest
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

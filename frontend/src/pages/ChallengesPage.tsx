import React, { useState, useEffect } from 'react';
import {
  Target,
  Trophy,
  Users,
  Timer,
  CheckCircle,
  Zap,
  Sparkles,
  ArrowRight,
  Shield,
  Calendar,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Challenge } from '../types';

export const ChallengesPage: React.FC = () => {
  const { refreshProfile } = useAuth();
  const { showToast } = useNotification();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'joined' | 'available' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchChallenges = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<Challenge[]>(`/challenges?filter_status=${filterStatus}`);
      setChallenges(res.data);
    } catch (err) {
      console.error('Failed to load challenges', err);
      showToast('error', 'Error', 'Failed to retrieve challenges.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [filterStatus]);

  const handleJoin = async (id: number) => {
    setProcessingId(id);
    try {
      await apiClient.post(`/challenges/${id}/join`);
      showToast('success', 'Quest Accepted! 🎯', 'Relevant workouts you log will automatically contribute to this goal.');
      fetchChallenges();
    } catch (err: any) {
      showToast('error', 'Failed to Join', err.response?.data?.detail || 'Could not join challenge.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleLeave = async (id: number) => {
    if (!window.confirm('Leave this challenge? Your current progress on it will be reset.')) return;
    setProcessingId(id);
    try {
      await apiClient.post(`/challenges/${id}/leave`);
      showToast('info', 'Quest Left', 'You have left the challenge.');
      fetchChallenges();
    } catch (err: any) {
      showToast('error', 'Failed to Leave', err.response?.data?.detail || 'Could not leave challenge.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleClaim = async (id: number) => {
    setProcessingId(id);
    try {
      const res = await apiClient.post(`/challenges/${id}/claim`);
      showToast('reward', 'Reward Claimed! 🏆', res.data.message || 'XP and Coins credited to your vault.');
      await refreshProfile();
      fetchChallenges();
    } catch (err: any) {
      showToast('error', 'Claim Failed', err.response?.data?.detail || 'Could not claim rewards.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Target className="w-7 h-7 text-brand-blue" />
            Fitness Quests & Challenges
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Conquer daily and weekly milestones. Eligible workouts automatically track towards completion.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border/60 pb-3 overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: 'All Quests' },
          { id: 'joined', label: 'Accepted Quests' },
          { id: 'available', label: 'Available To Join' },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterStatus === tab.id
                ? 'bg-brand-surface text-brand-primary border border-brand-primary/40 shadow-sm'
                : 'text-brand-muted hover:text-white hover:bg-brand-surface/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Challenge Cards Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-brand-muted animate-pulse">
          Loading active quests...
        </div>
      ) : challenges.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-2xl border border-dashed border-brand-border/60 p-8">
          <Target className="w-10 h-10 text-brand-muted mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-white mb-1">No quests in this category</h3>
          <p className="text-xs text-brand-muted max-w-sm mx-auto">
            Switch back to "All Quests" to explore available fitness challenges.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {challenges.map((c) => {
            const pct = Math.min(100, Math.round((c.current_progress / Math.max(1, c.target_value)) * 100));
            const isProcessing = processingId === c.id;

            return (
              <div
                key={c.id}
                className="glass-panel p-6 rounded-2xl border border-brand-border/70 flex flex-col justify-between hover:border-brand-primary/30 transition-all gap-5"
              >
                {/* Top Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-surface border border-brand-border text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                      {c.challenge_type} Quest
                    </span>
                    <span className="text-xs text-brand-muted flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Ends {new Date(c.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{c.title}</h3>
                    <p className="text-xs text-brand-muted mt-1 leading-relaxed">{c.description}</p>
                  </div>

                  {/* Target Requirement Pill */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-brand-surface/40 border border-brand-border/60 text-xs">
                    <span className="text-brand-muted">Target Objective:</span>
                    <span className="font-bold text-white">
                      {c.target_value} {c.target_type.replace('_', ' ')}
                      {c.activity_type ? ` in ${c.activity_type}` : ' (any sport)'}
                    </span>
                  </div>

                  {/* Progress Bar (if joined) */}
                  {c.is_joined && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-brand-muted">Your Quest Progress</span>
                        <span className="text-brand-primary">
                          {c.current_progress} / {c.target_value} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-brand-bg rounded-full h-2.5 overflow-hidden border border-brand-border/40">
                        <div
                          className="bg-gradient-to-r from-brand-blue to-brand-primary h-full rounded-full transition-all duration-500 shadow-glow-lime"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Rewards & Actions */}
                <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs font-bold text-brand-primary">
                      <Zap className="w-4 h-4" />
                      +{c.xp_reward} XP
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-brand-gold">
                      <span>🪙</span>
                      +{c.coins_reward} Coins
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div>
                    {!c.is_joined ? (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={isProcessing}
                        onClick={() => handleJoin(c.id)}
                      >
                        Accept Quest
                      </Button>
                    ) : c.is_completed && !c.reward_claimed ? (
                      <Button
                        variant="glow"
                        size="sm"
                        isLoading={isProcessing}
                        onClick={() => handleClaim(c.id)}
                      >
                        Claim Reward! 🏆
                      </Button>
                    ) : c.is_completed && c.reward_claimed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary">
                        <CheckCircle className="w-4 h-4" /> Completed
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-brand-blue font-semibold">Active Quest</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-brand-muted hover:text-red-400 p-1"
                          onClick={() => handleLeave(c.id)}
                        >
                          Leave
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

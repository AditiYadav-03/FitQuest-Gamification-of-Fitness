import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Users,
  Globe,
  Zap,
  Award,
} from 'lucide-react';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LeaderboardEntry } from '../types';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [scope, setScope] = useState<'global' | 'friends'>('global');
  const [timeframe, setTimeframe] = useState<'all_time' | 'monthly' | 'weekly'>('all_time');
  const [activityType, setActivityType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<LeaderboardEntry[]>(
        `/leaderboards?scope=${scope}&timeframe=${timeframe}&activity_type=${activityType}`
      );
      setEntries(res.data);
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [scope, timeframe, activityType]);

  const topThree = entries.slice(0, 3);
  const remaining = entries.slice(3);

  // Position ordering for podium: [2nd, 1st, 3rd]
  const podiumOrder = topThree.length === 3 ? [topThree[1], topThree[0], topThree[2]] : topThree;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-brand-gold" />
            Competitive Leaderboards
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Verified rankings based on workouts, distance, consistency streaks and earned XP.
          </p>
        </div>
      </div>

      {/* Scope & Timeframe Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-brand-surface/40 p-3 rounded-2xl border border-brand-border/60">
        {/* Scope Toggle */}
        <div className="flex items-center gap-1 bg-brand-bg/60 p-1 rounded-xl border border-brand-border/60">
          <button
            onClick={() => setScope('global')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              scope === 'global'
                ? 'bg-brand-primary text-black shadow-glow-lime'
                : 'text-brand-muted hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Global Arena
          </button>
          <button
            onClick={() => setScope('friends')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              scope === 'friends'
                ? 'bg-brand-primary text-black shadow-glow-lime'
                : 'text-brand-muted hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Friends League
          </button>
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center gap-1 bg-brand-bg/60 p-1 rounded-xl border border-brand-border/60">
          {[
            { id: 'all_time', label: 'All-Time' },
            { id: 'monthly', label: 'Past 30 Days' },
            { id: 'weekly', label: 'Past 7 Days' },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === tf.id
                  ? 'bg-brand-surface text-brand-primary border border-brand-primary/40'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-xs text-brand-muted animate-pulse">
          Computing rankings from database...
        </div>
      ) : entries.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-2xl border border-dashed border-brand-border/60 p-8">
          <Trophy className="w-10 h-10 text-brand-muted mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-white mb-1">No athletes found in this scope</h3>
          <p className="text-xs text-brand-muted max-w-sm mx-auto">
            {scope === 'friends'
              ? 'Connect with friends in the Community tab to compare workout scores!'
              : 'Log activities to start your ranking on the board.'}
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Presentation */}
          {topThree.length >= 3 && (
            <div className="py-6 flex items-end justify-center gap-4 sm:gap-8 max-w-3xl mx-auto">
              {/* 2nd Place */}
              <div className="flex flex-col items-center flex-1 max-w-[180px]">
                <div className="relative mb-2 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-slate-300 overflow-hidden shadow-lg mx-auto">
                    <img
                      src={podiumOrder[0].avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
                      alt={podiumOrder[0].full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-300 text-black font-black text-xs flex items-center justify-center">
                    2
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-full text-center">
                  {podiumOrder[0].full_name}
                </h4>
                <span className="text-[10px] text-brand-primary font-bold">{podiumOrder[0].total_xp.toLocaleString()} XP</span>
                <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-brand-card to-slate-400/20 border-t-2 border-slate-300 rounded-t-xl mt-3 flex items-center justify-center text-slate-300 font-black text-lg">
                  SILVER
                </div>
              </div>

              {/* 1st Place (Center, Taller) */}
              <div className="flex flex-col items-center flex-1 max-w-[200px]">
                <Crown className="w-8 h-8 text-brand-gold animate-bounce-soft mb-1" />
                <div className="relative mb-2 text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-brand-gold overflow-hidden shadow-glow-gold mx-auto">
                    <img
                      src={podiumOrder[1].avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'}
                      alt={podiumOrder[1].full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-gold text-black font-black text-xs flex items-center justify-center shadow-md">
                    1
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-white truncate max-w-full text-center">
                  {podiumOrder[1].full_name}
                </h4>
                <span className="text-xs text-brand-gold font-extrabold">{podiumOrder[1].total_xp.toLocaleString()} XP</span>
                <div className="w-full h-32 sm:h-36 bg-gradient-to-t from-brand-card to-brand-gold/20 border-t-2 border-brand-gold rounded-t-xl mt-3 flex items-center justify-center text-brand-gold font-black text-xl shadow-glow-gold">
                  CHAMPION
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center flex-1 max-w-[180px]">
                <div className="relative mb-2 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-600 overflow-hidden shadow-lg mx-auto">
                    <img
                      src={podiumOrder[2].avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'}
                      alt={podiumOrder[2].full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center">
                    3
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-full text-center">
                  {podiumOrder[2].full_name}
                </h4>
                <span className="text-[10px] text-brand-primary font-bold">{podiumOrder[2].total_xp.toLocaleString()} XP</span>
                <div className="w-full h-20 sm:h-24 bg-gradient-to-t from-brand-card to-amber-600/20 border-t-2 border-amber-600 rounded-t-xl mt-3 flex items-center justify-center text-amber-500 font-black text-lg">
                  BRONZE
                </div>
              </div>
            </div>
          )}

          {/* Full Rankings Table */}
          <div className="glass-panel rounded-2xl border border-brand-border/70 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-surface/60 border-b border-brand-border/60 text-brand-muted uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 text-center">Rank</th>
                    <th className="py-3 px-4">Athlete</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Streak</th>
                    <th className="py-3 px-4 text-center">Workouts</th>
                    <th className="py-3 px-4 text-center">Badges</th>
                    <th className="py-3 px-4 text-right">Total XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40">
                  {entries.map((entry) => {
                    const isCurrentUser = entry.user_id === user?.id;

                    return (
                      <tr
                        key={entry.user_id}
                        className={`transition-colors ${
                          isCurrentUser
                            ? 'bg-brand-primary/10 border-l-4 border-l-brand-primary font-semibold'
                            : 'hover:bg-brand-surface/30'
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center font-extrabold text-sm text-white">
                          {entry.rank === 1 && '🥇'}
                          {entry.rank === 2 && '🥈'}
                          {entry.rank === 3 && '🥉'}
                          {entry.rank > 3 && `#${entry.rank}`}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                entry.avatar_url ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                              }
                              alt={entry.full_name}
                              className="w-8 h-8 rounded-full object-cover border border-brand-border"
                            />
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                {entry.full_name}
                                {isCurrentUser && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-brand-primary text-black">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-brand-muted">@{entry.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-brand-surface border border-brand-primary/30 text-[11px] font-bold text-brand-primary">
                            Lvl {entry.level}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="flex items-center gap-1 text-brand-flame font-bold text-xs">
                            <Flame className="w-3.5 h-3.5 fill-current" />
                            {entry.current_streak}d
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-brand-text">
                          {entry.activities_count}
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-brand-gold">
                          {entry.badges_count} 🎖️
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-sm text-brand-primary">
                          {entry.total_xp.toLocaleString()} XP
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

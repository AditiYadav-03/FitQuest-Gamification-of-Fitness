import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Activity as ActivityIcon,
  PlusCircle,
  Filter,
  Calendar,
  Flame,
  Zap,
  Timer,
  Navigation,
  Trash2,
  Edit2,
  ChevronDown,
  Search,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Activity, ActivitySummaryStats } from '../types';

const SPORT_FILTERS = [
  { id: 'all', name: 'All Sports' },
  { id: 'running', name: '🏃‍♂️ Running' },
  { id: 'walking', name: '🚶‍♂️ Walking' },
  { id: 'cycling', name: '🚴‍♂️ Cycling' },
  { id: 'gym', name: '🏋️‍♂️ Gym / Weights' },
  { id: 'swimming', name: '🏊‍♂️ Swimming' },
  { id: 'yoga', name: '🧘‍♀️ Yoga' },
  { id: 'hiit', name: '⚡ HIIT' },
  { id: 'sports', name: '⚽ Sports' },
];

export const ActivitiesPage: React.FC = () => {
  const { openActivityModal } = useOutletContext<{ openActivityModal: () => void }>();
  const { refreshProfile } = useAuth();
  const { showToast } = useNotification();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivitySummaryStats | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Edit Activity State
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDuration, setEditDuration] = useState(0);
  const [editDistance, setEditDistance] = useState(0);
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const [actRes, statsRes] = await Promise.all([
        apiClient.get<Activity[]>(`/activities?activity_type=${selectedFilter}&sort=${sortOrder}`),
        apiClient.get<ActivitySummaryStats>('/activities/stats'),
      ]);
      setActivities(actRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load activities', err);
      showToast('error', 'Error', 'Failed to load activity logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedFilter, sortOrder]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this activity log?')) return;
    try {
      await apiClient.delete(`/activities/${id}`);
      showToast('info', 'Activity Removed', 'The workout record has been deleted.');
      setActivities((prev) => prev.filter((a) => a.id !== id));
      await refreshProfile();
      fetchActivities();
    } catch (err) {
      showToast('error', 'Delete Failed', 'Could not delete activity.');
    }
  };

  const openEditModal = (act: Activity) => {
    setEditingActivity(act);
    setEditTitle(act.title);
    setEditDuration(act.duration_minutes);
    setEditDistance(act.distance_km);
    setEditNotes(act.notes || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;
    setIsUpdating(true);
    try {
      const res = await apiClient.put<Activity>(`/activities/${editingActivity.id}`, {
        title: editTitle,
        duration_minutes: editDuration,
        distance_km: editDistance,
        notes: editNotes,
      });
      showToast('success', 'Activity Updated', 'Workout details recomputed.');
      setActivities((prev) => prev.map((a) => (a.id === editingActivity.id ? res.data : a)));
      setEditingActivity(null);
      await refreshProfile();
    } catch (err) {
      showToast('error', 'Update Failed', 'Could not update activity.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredActivities = activities.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.activity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.notes && a.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <ActivityIcon className="w-7 h-7 text-brand-primary" />
            Fitness Activity Ledger
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Transparently recorded workouts, verified calorie calculations & XP progression.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          className="shadow-glow-lime self-start sm:self-auto"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={openActivityModal}
        >
          Record Workout
        </Button>
      </div>

      {/* Stats Summary Strip */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass-panel p-4 rounded-xl border border-brand-border/60">
            <span className="text-[10px] font-bold uppercase text-brand-muted">Total Workouts</span>
            <div className="text-xl font-black text-white mt-0.5">{stats.total_activities}</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-brand-border/60">
            <span className="text-[10px] font-bold uppercase text-brand-muted">Distance Covered</span>
            <div className="text-xl font-black text-brand-blue mt-0.5">{stats.total_distance_km} km</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-brand-border/60">
            <span className="text-[10px] font-bold uppercase text-brand-muted">Active Duration</span>
            <div className="text-xl font-black text-brand-primary mt-0.5">{Math.round(stats.total_duration_minutes / 60)} hrs {stats.total_duration_minutes % 60}m</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-brand-border/60">
            <span className="text-[10px] font-bold uppercase text-brand-muted">Total Calories Burned</span>
            <div className="text-xl font-black text-orange-400 mt-0.5">{stats.total_calories_burned.toLocaleString()} kcal</div>
          </div>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="space-y-3">
        {/* Sport Type Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {SPORT_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedFilter === f.id
                  ? 'bg-brand-primary text-black font-bold shadow-glow-lime'
                  : 'bg-brand-surface/60 text-brand-muted hover:text-white border border-brand-border/60'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:flex-1 relative">
            <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by workout title, sport or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-surface/60 border border-brand-border/80 text-brand-text placeholder-brand-muted/60 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-brand-surface/60 border border-brand-border/80 text-brand-text text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-brand-muted animate-pulse">
            Loading activity log...
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="py-16 text-center glass-panel rounded-2xl border border-dashed border-brand-border/60 p-8">
            <ActivityIcon className="w-10 h-10 text-brand-muted mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-bold text-white mb-1">No activities found</h3>
            <p className="text-xs text-brand-muted max-w-sm mx-auto mb-4">
              {searchQuery
                ? 'Try broadening your search term or selecting "All Sports".'
                : 'You have not logged any workouts under this filter yet.'}
            </p>
            <Button variant="primary" size="sm" onClick={openActivityModal}>
              Log Workout Now
            </Button>
          </div>
        ) : (
          filteredActivities.map((act) => (
            <div
              key={act.id}
              className="glass-card p-4 sm:p-5 rounded-2xl border border-brand-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Left Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-surface border border-brand-border/80 flex items-center justify-center text-2xl shrink-0">
                  {act.activity_type === 'running' && '🏃‍♂️'}
                  {act.activity_type === 'cycling' && '🚴‍♂️'}
                  {act.activity_type === 'gym' && '🏋️‍♂️'}
                  {act.activity_type === 'walking' && '🚶‍♂️'}
                  {act.activity_type === 'swimming' && '🏊‍♂️'}
                  {act.activity_type === 'yoga' && '🧘‍♀️'}
                  {act.activity_type === 'hiit' && '⚡'}
                  {act.activity_type === 'sports' && '⚽'}
                  {!['running', 'cycling', 'gym', 'walking', 'swimming', 'yoga', 'hiit', 'sports'].includes(act.activity_type) && '🎯'}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-white">{act.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-surface border border-brand-border/60 text-brand-muted">
                      {act.activity_type}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        act.intensity === 'high'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : act.intensity === 'low'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {act.intensity} intensity
                    </span>
                  </div>

                  {act.notes && (
                    <p className="text-xs text-brand-muted/90 italic line-clamp-1">"{act.notes}"</p>
                  )}

                  {/* Metrics Row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-brand-muted pt-1">
                    <span className="flex items-center gap-1 text-white font-semibold">
                      <Timer className="w-3.5 h-3.5 text-brand-blue" />
                      {act.duration_minutes} mins
                    </span>
                    {act.distance_km > 0 && (
                      <span className="flex items-center gap-1 text-white font-semibold">
                        <Navigation className="w-3.5 h-3.5 text-brand-primary" />
                        {act.distance_km} km
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-white font-semibold">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      {act.calories_burned} kcal
                    </span>
                    <span className="text-[11px] text-brand-muted/70">
                      {new Date(act.activity_date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Reward Pills & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-brand-border/50">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-brand-primary/10 border border-brand-primary/30 text-center">
                    <span className="text-xs font-black text-brand-primary">+{act.xp_earned} XP</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-brand-gold/10 border border-brand-gold/30 text-center">
                    <span className="text-xs font-black text-brand-gold">+{act.coins_earned} 🪙</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(act)}
                    className="p-2 text-brand-muted hover:text-white rounded-lg hover:bg-brand-surface transition-colors"
                    title="Edit Activity"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(act.id)}
                    className="p-2 text-brand-muted hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Delete Activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Activity Modal */}
      {editingActivity && (
        <Modal isOpen={!!editingActivity} onClose={() => setEditingActivity(null)} title="Edit Workout Details">
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="Activity Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                label="Duration (Minutes)"
                min={1}
                value={editDuration}
                onChange={(e) => setEditDuration(Number(e.target.value))}
                required
              />
              <Input
                type="number"
                step="0.1"
                label="Distance (Kilometers)"
                min={0}
                value={editDistance}
                onChange={(e) => setEditDistance(Number(e.target.value))}
              />
            </div>
            <Input
              label="Notes"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
              <Button type="button" variant="ghost" onClick={() => setEditingActivity(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isUpdating}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

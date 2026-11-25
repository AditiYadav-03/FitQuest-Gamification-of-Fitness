import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Flame,
  Zap,
  Timer,
  Navigation,
  Share2,
  Calendar,
  FileText,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { apiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Activity } from '../../types';

const activitySchema = z.object({
  activity_type: z.string().min(1, 'Please select an activity type'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute').max(1440, 'Duration is too large'),
  distance_km: z.number().min(0, 'Distance cannot be negative'),
  intensity: z.enum(['low', 'medium', 'high']),
  activity_date: z.string().optional(),
  notes: z.string().optional(),
  publish_to_feed: z.boolean(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityCreated?: (activity: Activity) => void;
}

const ACTIVITY_TYPES = [
  { id: 'running', name: 'Running', emoji: '🏃‍♂️', met: 9.8, hasDistance: true },
  { id: 'walking', name: 'Walking', emoji: '🚶‍♂️', met: 3.8, hasDistance: true },
  { id: 'cycling', name: 'Cycling', emoji: '🚴‍♂️', met: 7.5, hasDistance: true },
  { id: 'gym', name: 'Gym / Strength', emoji: '🏋️‍♂️', met: 6.0, hasDistance: false },
  { id: 'swimming', name: 'Swimming', emoji: '🏊‍♂️', met: 8.0, hasDistance: true },
  { id: 'yoga', name: 'Yoga / Flexibility', emoji: '🧘‍♀️', met: 3.0, hasDistance: false },
  { id: 'hiit', name: 'HIIT / Circuit', emoji: '⚡', met: 10.0, hasDistance: false },
  { id: 'sports', name: 'Sports', emoji: '⚽', met: 7.0, hasDistance: false },
];

export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  isOpen,
  onClose,
  onActivityCreated,
}) => {
  const { refreshProfile } = useAuth();
  const { showToast, celebrateAchievement } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      activity_type: 'running',
      title: '',
      duration_minutes: 30,
      distance_km: 0,
      intensity: 'medium',
      publish_to_feed: true,
      activity_date: new Date().toISOString().slice(0, 16),
    },
  });

  const selectedType = watch('activity_type');
  const duration = watch('duration_minutes') || 0;
  const distance = watch('distance_km') || 0;
  const intensity = watch('intensity') || 'medium';

  // Live estimated reward calculation
  const selectedConfig = ACTIVITY_TYPES.find((t) => t.id === selectedType) || ACTIVITY_TYPES[0];
  const met = selectedConfig.met;
  const estimatedCalories = Math.max(1, Math.round((met * 3.5 * 70) / 200 * duration));
  const mult = intensity === 'high' ? 1.25 : intensity === 'low' ? 0.85 : 1.0;
  const estimatedXP = Math.max(15, Math.round(((duration * 3) + (distance * 20) + (estimatedCalories / 10)) * mult));
  const estimatedCoins = Math.max(5, Math.round(estimatedXP / 10));

  const onSubmit = async (data: ActivityFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        distance_km: data.distance_km && !isNaN(data.distance_km) ? data.distance_km : 0,
        activity_date: data.activity_date ? new Date(data.activity_date).toISOString() : new Date().toISOString(),
      };
      const res = await apiClient.post<Activity>('/activities', payload);
      const created = res.data;

      showToast(
        'success',
        'Workout Logged! 🔥',
        `Earned +${created.xp_earned} XP and +${created.coins_earned} FitCoins!`
      );

      // Refresh global profile & stats
      await refreshProfile();

      // Check if badges were unlocked
      if (created.unlocked_badges && created.unlocked_badges.length > 0) {
        celebrateAchievement(created.unlocked_badges[0]);
      }

      if (onActivityCreated) {
        onActivityCreated(created);
      }

      reset();
      onClose();
    } catch (err: any) {
      console.error('Failed to log activity', err);
      showToast(
        'error',
        'Submission Failed',
        err.response?.data?.detail || 'Could not save activity. Please check inputs.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Fitness Activity" maxWidth="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Activity Type Selector Grid */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted block mb-2">
            Activity Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ACTIVITY_TYPES.map((type) => {
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setValue('activity_type', type.id);
                    if (!watch('title')) {
                      setValue('title', `${type.name} Workout`);
                    }
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-brand-primary bg-brand-primary/10 text-white shadow-glow-lime'
                      : 'border-brand-border bg-brand-surface/40 text-brand-muted hover:border-brand-border hover:text-white'
                  }`}
                >
                  <span className="text-xl">{type.emoji}</span>
                  <span className="text-xs font-bold leading-tight">{type.name}</span>
                </button>
              );
            })}
          </div>
          {errors.activity_type && (
            <p className="text-xs text-red-400 mt-1">{errors.activity_type.message}</p>
          )}
        </div>

        {/* Workout Title */}
        <Input
          label="Activity Title"
          placeholder="e.g., Morning 5K Pace Run, Legs & Core Blitz"
          error={errors.title?.message}
          {...register('title')}
        />

        {/* Duration & Distance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="number"
            label="Duration (Minutes)"
            leftIcon={<Timer className="w-4 h-4" />}
            min={1}
            max={1440}
            error={errors.duration_minutes?.message}
            {...register('duration_minutes', { valueAsNumber: true })}
          />

          {selectedConfig.hasDistance ? (
            <Input
              type="number"
              step="0.1"
              label="Distance (Kilometers)"
              leftIcon={<Navigation className="w-4 h-4" />}
              min={0}
              error={errors.distance_km?.message}
              {...register('distance_km', { valueAsNumber: true })}
            />
          ) : (
            <div className="flex flex-col gap-1.5 opacity-60">
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                Distance (Kilometers)
              </label>
              <div className="bg-brand-surface/30 border border-brand-border/40 text-brand-muted text-xs rounded-xl px-4 py-3">
                Not applicable for this activity
              </div>
            </div>
          )}
        </div>

        {/* Intensity Selector */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted block mb-2">
            Workout Intensity
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'low', label: 'Light', desc: 'Easy Recovery', mult: '0.85x XP' },
              { id: 'medium', label: 'Moderate', desc: 'Standard Pace', mult: '1.0x XP' },
              { id: 'high', label: 'Vigorous', desc: 'Peak Effort', mult: '1.25x XP' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setValue('intensity', lvl.id as any)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  intensity === lvl.id
                    ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-sm'
                    : 'border-brand-border bg-brand-surface/40 text-brand-muted hover:border-brand-border'
                }`}
              >
                <div className="text-xs font-bold text-white">{lvl.label}</div>
                <div className="text-[10px] text-brand-muted">{lvl.desc}</div>
                <div className="text-[10px] font-semibold text-brand-primary mt-1">{lvl.mult}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Reward Forecast */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-brand-surface/90 to-brand-card border border-brand-primary/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-primary" />
            <span className="text-xs font-semibold text-white">Reward Forecast:</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-orange-400">🔥 ~{estimatedCalories} kcal</span>
            <span className="text-brand-primary">+{estimatedXP} XP</span>
            <span className="text-brand-gold">+{estimatedCoins} Coins</span>
          </div>
        </div>

        {/* Date & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="datetime-local"
            label="Activity Timestamp"
            leftIcon={<Calendar className="w-4 h-4" />}
            {...register('activity_date')}
          />
          <Input
            label="Workout Notes (Optional)"
            placeholder="How did you feel? Weather, PRs..."
            leftIcon={<FileText className="w-4 h-4" />}
            {...register('notes')}
          />
        </div>

        {/* Feed Share Toggle */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="publish_to_feed"
            className="w-4 h-4 rounded border-brand-border bg-brand-surface text-brand-primary focus:ring-brand-primary accent-[#10E57A]"
            {...register('publish_to_feed')}
          />
          <label htmlFor="publish_to_feed" className="text-xs text-brand-muted cursor-pointer flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-brand-primary" />
            Share workout to the FitQuest Community Feed
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border/60">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Confirm & Claim XP
          </Button>
        </div>
      </form>
    </Modal>
  );
};

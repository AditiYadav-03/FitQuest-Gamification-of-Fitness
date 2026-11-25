import React from 'react';
import { Trophy, Award, Zap, Flame, ShieldCheck, Crown, Footprints, Dumbbell, Sparkles, Compass, Medal } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../../types';

const ICON_MAP: Record<string, React.ReactNode> = {
  Footprints: <Footprints className="w-12 h-12 text-brand-primary" />,
  Flame: <Flame className="w-12 h-12 text-orange-400" />,
  Dumbbell: <Dumbbell className="w-12 h-12 text-yellow-400" />,
  Zap: <Zap className="w-12 h-12 text-brand-blue" />,
  Sparkles: <Sparkles className="w-12 h-12 text-purple-400" />,
  Crown: <Crown className="w-12 h-12 text-amber-300" />,
  ShieldCheck: <ShieldCheck className="w-12 h-12 text-emerald-400" />,
  Trophy: <Trophy className="w-12 h-12 text-yellow-300" />,
  Compass: <Compass className="w-12 h-12 text-cyan-400" />,
  Medal: <Medal className="w-12 h-12 text-amber-400" />,
  Award: <Award className="w-12 h-12 text-brand-primary" />,
};

export const AchievementModal: React.FC = () => {
  const { activeAchievement, closeAchievementModal } = useNotification();

  if (!activeAchievement) return null;

  const iconElement = ICON_MAP[activeAchievement.icon] || <Award className="w-12 h-12 text-brand-primary" />;

  return (
    <Modal isOpen={!!activeAchievement} onClose={closeAchievementModal} maxWidth="sm">
      <div className="flex flex-col items-center text-center py-4">
        {/* Glowing Badge Avatar */}
        <div className="relative mb-5">
          <div className="w-24 h-24 rounded-full bg-brand-surface border-2 border-brand-primary/50 flex items-center justify-center shadow-glow-lime animate-bounce-soft">
            {iconElement}
          </div>
          <span className="absolute -bottom-2 bg-gradient-to-r from-brand-primary to-brand-blue text-black font-extrabold text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-md">
            {activeAchievement.tier} Badge
          </span>
        </div>

        <span className="text-xs font-semibold tracking-widest text-brand-primary uppercase mb-1">
          Achievement Unlocked!
        </span>
        <h3 className="text-2xl font-black text-white mb-2">{activeAchievement.name}</h3>
        <p className="text-sm text-brand-muted mb-6 leading-relaxed px-4">
          {activeAchievement.description}
        </p>

        {/* Reward Pill */}
        <div className="flex items-center gap-4 bg-brand-surface/80 border border-brand-border px-5 py-3 rounded-2xl mb-6">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-brand-primary" />
            <span className="text-sm font-bold text-brand-primary">+{activeAchievement.xp_bonus} XP</span>
          </div>
          <div className="w-px h-4 bg-brand-border" />
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🪙</span>
            <span className="text-sm font-bold text-brand-gold">+{activeAchievement.coins_bonus} FitCoins</span>
          </div>
        </div>

        <Button variant="primary" size="md" className="w-full" onClick={closeAchievementModal}>
          Awesome, Continue Quest!
        </Button>
      </div>
    </Modal>
  );
};

import React from 'react';
import { Zap, Heart, Shield, Code, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-brand-border/60 bg-brand-bg/80 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-primary flex items-center justify-center shadow-glow-lime">
                <Zap className="w-4 h-4 text-black fill-current" />
              </div>
              <span className="text-base font-black tracking-wider text-white">
                FIT<span className="text-brand-primary">QUEST</span>
              </span>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">
              Gamifying physical fitness with verified activity logging, dynamic XP algorithms, community leaderboards, and real-time milestones.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Platform</h5>
            <ul className="space-y-1.5 text-xs text-brand-muted">
              <li><Link to="/dashboard" className="hover:text-brand-primary transition-colors">Dashboard</Link></li>
              <li><Link to="/activities" className="hover:text-brand-primary transition-colors">Activity Tracker</Link></li>
              <li><Link to="/challenges" className="hover:text-brand-primary transition-colors">Fitness Quests</Link></li>
              <li><Link to="/leaderboard" className="hover:text-brand-primary transition-colors">Rankings</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Gamification</h5>
            <ul className="space-y-1.5 text-xs text-brand-muted">
              <li><span className="hover:text-brand-primary">Level Up Engine</span></li>
              <li><span className="hover:text-brand-primary">FitCoins Rewards</span></li>
              <li><span className="hover:text-brand-primary">Streak Multipliers</span></li>
              <li><span className="hover:text-brand-primary">Achievement Badges</span></li>
            </ul>
          </div>

          {/* Academic Showcase Card */}
          <div className="space-y-2 bg-brand-surface/40 p-3.5 rounded-xl border border-brand-border/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
              <Sparkles className="w-4 h-4" />
              <span>Full-Stack Capstone Edition</span>
            </div>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              Built with React, TypeScript, Tailwind CSS, FastAPI, and MySQL/SQLAlchemy. Designed for university evaluation and portfolio presentation.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-brand-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-muted">
          <p>© {new Date().getFullYear()} FitQuest – All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3.5 h-3.5 text-red-400 fill-current" /> for healthy habits
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

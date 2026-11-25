import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity as ActivityIcon,
  Target,
  Trophy,
  Users,
  BarChart3,
  UserCheck,
  ShieldAlert,
  PlusCircle,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenActivityModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile = false,
  onCloseMobile,
  onOpenActivityModal,
}) => {
  const { user, profile } = useAuth();

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/activities', label: 'Activities', icon: ActivityIcon },
    { to: '/challenges', label: 'Challenges', icon: Target },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/community', label: 'Community Feed', icon: Users },
    { to: '/analytics', label: 'Analytics & Trends', icon: BarChart3 },
    { to: '/profile', label: 'Profile & Badges', icon: UserCheck },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ to: '/admin', label: 'Admin Panel', icon: ShieldAlert });
  }

  const levelProgress = profile?.level_progress;

  const content = (
    <div className="flex flex-col h-full justify-between p-4 bg-brand-card/95 border-r border-brand-border/80">
      <div className="space-y-6">
        {/* Mobile Header with close */}
        <div className="flex items-center justify-between lg:hidden pb-3 border-b border-brand-border">
          <span className="text-base font-black text-white">
            FIT<span className="text-brand-primary">QUEST</span>
          </span>
          <button onClick={onCloseMobile} className="p-1.5 text-brand-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level XP Card Widget */}
        {profile && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-surface to-brand-card border border-brand-border/70 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-brand-primary fill-current" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Level {profile.level}</h4>
                  <p className="text-[10px] text-brand-muted">{profile.total_xp.toLocaleString()} Total XP</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-brand-primary">
                {levelProgress?.percentage || 0}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-brand-bg rounded-full h-2 overflow-hidden border border-brand-border/40">
              <div
                className="bg-gradient-to-r from-brand-primary to-brand-blue h-full rounded-full transition-all duration-500 shadow-glow-lime"
                style={{ width: `${levelProgress?.percentage || 0}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-brand-muted mt-1.5">
              <span>{levelProgress?.progress_xp || 0} XP</span>
              <span>Next: {levelProgress?.required_xp || 100} XP</span>
            </div>
          </div>
        )}

        {/* Main Nav Links */}
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/30 shadow-sm'
                      : 'text-brand-muted hover:text-white hover:bg-brand-surface/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Action: Log Workout */}
      <div className="pt-4 border-t border-brand-border/60">
        {onOpenActivityModal && (
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onOpenActivityModal();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-blue text-black font-extrabold text-xs uppercase tracking-wider shadow-glow-lime hover:opacity-95 transition-all active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            Log Activity
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16 z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="fixed inset-y-0 left-0 w-72 max-w-full z-50 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

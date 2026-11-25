import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Bell, Flame, Menu, X, Shield, LogOut, User, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
  onOpenActivityModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu, onOpenActivityModal }) => {
  const { user, profile, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border/80 glass-panel bg-brand-bg/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Toggle & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-brand-muted hover:text-white rounded-lg hover:bg-brand-surface"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-blue flex items-center justify-center shadow-glow-lime group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-black font-extrabold fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-wider text-white">
                FIT<span className="text-brand-primary">QUEST</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-muted -mt-1 hidden sm:block">
                Level Up Fitness
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Right Gamification Stats Pills */}
        {profile && (
          <div className="hidden md:flex items-center gap-3">
            {/* Level Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-surface/80 border border-brand-primary/30 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <span className="text-xs font-semibold text-brand-muted">Lvl</span>
              <span className="text-xs font-extrabold text-brand-primary">{profile.level}</span>
            </div>

            {/* FitCoins Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-surface/80 border border-brand-gold/30 shadow-sm">
              <span className="text-xs">🪙</span>
              <span className="text-xs font-extrabold text-brand-gold">{profile.coins}</span>
            </div>

            {/* Streak Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-surface/80 border border-brand-flame/30 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-brand-flame fill-current" />
              <span className="text-xs font-extrabold text-brand-flame">
                {profile.current_streak} {profile.current_streak === 1 ? 'Day' : 'Days'}
              </span>
            </div>
          </div>
        )}

        {/* Right: Quick Action, Notifications & User Avatar */}
        <div className="flex items-center gap-3">
          {onOpenActivityModal && (
            <button
              onClick={onOpenActivityModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-brand-primary text-black hover:bg-brand-primaryHover shadow-glow-lime transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              Log Workout
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 text-brand-muted hover:text-white rounded-xl hover:bg-brand-surface transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-primary text-black text-[10px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel bg-brand-card/95 border border-brand-border shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-brand-primary hover:underline flex items-center gap-1 font-medium"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto mt-2 space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-brand-muted">
                      No notifications yet. Keep active to earn badges & challenge alerts!
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (!n.is_read) markAsRead(n.id);
                          if (n.link) navigate(n.link);
                          setShowNotifications(false);
                        }}
                        className={`p-3 rounded-xl border transition-colors cursor-pointer text-left ${
                          n.is_read
                            ? 'border-brand-border/40 bg-brand-surface/30 text-brand-muted'
                            : 'border-brand-primary/40 bg-brand-surface/80 text-white shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{n.title}</span>
                          {!n.is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                          )}
                        </div>
                        <p className="text-xs text-brand-muted mt-1 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-brand-surface transition-colors"
            >
              <img
                src={
                  profile?.avatar_url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                }
                alt={user?.full_name || 'User'}
                className="w-8 h-8 rounded-full object-cover border border-brand-primary/50"
              />
              <ChevronDown className="w-3.5 h-3.5 text-brand-muted hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel bg-brand-card/95 border border-brand-border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-brand-border/60">
                  <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
                  <p className="text-[11px] text-brand-muted truncate">@{user?.username}</p>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-brand-text hover:text-white hover:bg-brand-surface rounded-xl transition-colors"
                  >
                    <User className="w-4 h-4 text-brand-muted" />
                    My Profile & Badges
                  </Link>

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-colors"
                    >
                      <Shield className="w-4 h-4 text-brand-primary" />
                      Admin Control Panel
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

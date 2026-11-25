import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Flame,
  Trophy,
  Target,
  Users,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Award,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Footer } from '../components/common/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col selection:bg-brand-primary selection:text-black">
      {/* Landing Header */}
      <header className="sticky top-0 z-40 w-full border-b border-brand-border/60 glass-panel bg-brand-bg/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-blue flex items-center justify-center shadow-glow-lime">
              <Zap className="w-5 h-5 text-black fill-current" />
            </div>
            <span className="text-xl font-black tracking-wider text-white">
              FIT<span className="text-brand-primary">QUEST</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-brand-muted">
            <a href="#features" className="hover:text-brand-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-brand-primary transition-colors">How It Works</a>
            <a href="#gamification" className="hover:text-brand-primary transition-colors">Gamification</a>
            <a href="#community" className="hover:text-brand-primary transition-colors">Community</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">Join FitQuest</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Glow backdrop circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-brand-purple/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-surface/90 border border-brand-primary/30 text-xs font-bold text-brand-primary mb-6 shadow-sm animate-pulse-subtle">
            <Sparkles className="w-4 h-4" />
            <span>Transforming Daily Physical Fitness Into An Epic RPG</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
            Fitness Isn't A Chore. <br />
            It's A <span className="text-gradient-lime">Game You Win.</span>
          </h1>

          <p className="text-base sm:text-lg text-brand-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Record walking, running, cycling, gym and sports. Level up your athlete profile, maintain daily streaks, unlock badges, conquer fitness quests, and climb the leaderboard with friends.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 shadow-glow-lime">
                Start Questing Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5">
                Explore Demo Accounts
              </Button>
            </Link>
          </div>

          {/* Floating UI Showcase Mockups */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Card 1: Level Progress */}
            <div className="glass-panel p-6 rounded-2xl border border-brand-border/80 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Athlete Level</span>
                <span className="px-2.5 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary text-xs font-extrabold">
                  LEVEL 9
                </span>
              </div>
              <div className="text-2xl font-black text-white mb-2">6,800 XP Earned</div>
              <div className="w-full bg-brand-surface rounded-full h-2.5 mb-2 overflow-hidden border border-brand-border/40">
                <div className="bg-gradient-to-r from-brand-primary to-brand-blue h-full w-[75%] rounded-full shadow-glow-lime" />
              </div>
              <div className="flex justify-between text-[11px] text-brand-muted">
                <span>Tier Progress</span>
                <span className="text-brand-primary font-bold">75% to Level 10</span>
              </div>
            </div>

            {/* Card 2: Streak Multiplier */}
            <div className="glass-panel p-6 rounded-2xl border border-brand-border/80 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Active Streak</span>
                <Flame className="w-5 h-5 text-brand-flame fill-current" />
              </div>
              <div className="text-2xl font-black text-white mb-2">14 Days On Fire!</div>
              <p className="text-xs text-brand-muted leading-relaxed">
                +140 XP streak bonus earned on today's morning 10K run. Daily discipline multiplier active.
              </p>
            </div>

            {/* Card 3: Active Quest */}
            <div className="glass-panel p-6 rounded-2xl border border-brand-border/80 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Weekly Quest</span>
                <span className="text-xs font-bold text-brand-gold">🪙 100 Coins</span>
              </div>
              <div className="text-lg font-bold text-white mb-1">Weekly 25K Stride Quest</div>
              <div className="text-xs text-brand-primary font-semibold mb-2">18.2 / 25.0 km completed</div>
              <div className="w-full bg-brand-surface rounded-full h-2.5 overflow-hidden border border-brand-border/40">
                <div className="bg-gradient-to-r from-brand-gold to-orange-500 h-full w-[72%] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-brand-card/40 border-y border-brand-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-primary mb-3">
              Engineered For Intrinsic Motivation
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white">
              Every Mechanic Designed To Keep You Consistent
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6 text-brand-primary" />,
                title: 'Transparent XP Engine',
                desc: 'Earn experience based on real MET metabolic expenditure, duration, distance, and intensity. No arbitrary metrics.',
              },
              {
                icon: <Target className="w-6 h-6 text-brand-blue" />,
                title: 'Solo & Community Quests',
                desc: 'Join weekly and monthly fitness challenges. Automatically update progress as you log your workouts.',
              },
              {
                icon: <Award className="w-6 h-6 text-brand-gold" />,
                title: 'Achievement Badges & Coins',
                desc: 'Unlock tiered badges from Bronze to Diamond. Accumulate FitCoins to celebrate fitness milestones.',
              },
              {
                icon: <Trophy className="w-6 h-6 text-brand-purple" />,
                title: 'Dynamic Leaderboards',
                desc: 'Real database-backed rankings with Global Arena and Friends League filtered by week, month, or activity.',
              },
              {
                icon: <Users className="w-6 h-6 text-emerald-400" />,
                title: 'Social Fitness Community',
                desc: 'Share workout milestones, leave kudos comments, connect with fitness partners, and celebrate each other.',
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-cyan-400" />,
                title: 'Analytics & Trends',
                desc: 'Visual charts analyzing workout volume, calorie burn, cumulative XP progression, and personal goal progress.',
              },
            ].map((f, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl border border-brand-border/60 flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-surface flex items-center justify-center border border-brand-border/80">
                  {f.icon}
                </div>
                <h4 className="text-lg font-bold text-white">{f.title}</h4>
                <p className="text-xs text-brand-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-primary mb-3">
              Simple 4-Step Loop
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white">How FitQuest Works</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            {[
              {
                step: '01',
                title: 'Log Workout',
                desc: 'Record walking, running, cycling, gym, or swimming with duration, intensity, and distance.',
              },
              {
                step: '02',
                title: 'Earn XP & Coins',
                desc: 'Our validated engine computes calories, XP, and FitCoins based on scientific metabolic data.',
              },
              {
                step: '03',
                title: 'Conquer Quests',
                desc: 'Participate in active weekly challenges and watch your progress bars fill up automatically.',
              },
              {
                step: '04',
                title: 'Climb Podium',
                desc: 'Ascend player levels, unlock diamond badges, maintain your streak, and top the leaderboards!',
              },
            ].map((s, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-brand-border/60 relative">
                <span className="text-4xl font-black text-brand-primary/20 absolute top-4 right-4">
                  {s.step}
                </span>
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary font-black text-sm flex items-center justify-center mx-auto mb-4 border border-brand-primary/30">
                  {idx + 1}
                </div>
                <h4 className="text-base font-bold text-white mb-2">{s.title}</h4>
                <p className="text-xs text-brand-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Callout CTA */}
      <section className="py-16 bg-gradient-to-b from-brand-surface/40 to-brand-bg border-t border-brand-border/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center glass-panel p-10 rounded-3xl border border-brand-primary/30 shadow-glow-lime">
          <h3 className="text-3xl font-black text-white mb-3">
            Ready to Experience FitQuest?
          </h3>
          <p className="text-sm text-brand-muted max-w-xl mx-auto mb-8">
            Create your account in seconds, or jump into a pre-configured demo account to evaluate all features immediately.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-glow-lime">
                Create Free Athlete Account
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Sign In With Demo Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

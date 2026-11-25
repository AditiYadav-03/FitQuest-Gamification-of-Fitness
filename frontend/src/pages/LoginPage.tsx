import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Zap, Mail, Lock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const loginSchema = z.object({
  username_or_email: z.string().min(1, 'Please enter your username or email'),
  password: z.string().min(1, 'Please enter your password'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username_or_email: 'alex@fitquest.com',
      password: 'AlexPass123!',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(data.username_or_email, data.password);
      showToast('success', 'Welcome Back!', 'Ready to log your workouts and earn XP?');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error', err);
      const msg = err.response?.data?.detail || 'Invalid email/username or password.';
      setErrorMessage(msg);
      showToast('error', 'Login Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (email: string, pass: string) => {
    setValue('username_or_email', email);
    setValue('password', pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-blue flex items-center justify-center shadow-glow-lime group-hover:scale-105 transition-transform">
            <Zap className="w-6 h-6 text-black font-extrabold fill-current" />
          </div>
          <span className="text-2xl font-black tracking-wider text-white">
            FIT<span className="text-brand-primary">QUEST</span>
          </span>
        </Link>
        <h2 className="text-2xl font-black text-white">Sign In to Your Quest</h2>
        <p className="text-xs text-brand-muted mt-1.5">
          Resume your streak, join challenges, and track your fitness XP.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="glass-panel p-8 rounded-3xl border border-brand-border/80 shadow-2xl space-y-6">
          {/* Quick Demo Account Selector */}
          <div className="bg-brand-surface/60 border border-brand-border/60 p-3.5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> One-Click Demo Accounts:
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('alex@fitquest.com', 'AlexPass123!')}
                className="px-2.5 py-1.5 text-left rounded-lg bg-brand-card hover:bg-brand-surface border border-brand-border/50 text-[11px] text-brand-text transition-colors"
              >
                <div className="font-bold text-white">Alex Rivers</div>
                <div className="text-[10px] text-brand-muted">Lvl 7 • Hybrid</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('sarah@fitquest.com', 'SarahPass123!')}
                className="px-2.5 py-1.5 text-left rounded-lg bg-brand-card hover:bg-brand-surface border border-brand-border/50 text-[11px] text-brand-text transition-colors"
              >
                <div className="font-bold text-white">Sarah Chen</div>
                <div className="text-[10px] text-brand-muted">Lvl 9 • Marathon</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('marcus@fitquest.com', 'MarcusPass123!')}
                className="px-2.5 py-1.5 text-left rounded-lg bg-brand-card hover:bg-brand-surface border border-brand-border/50 text-[11px] text-brand-text transition-colors"
              >
                <div className="font-bold text-white">Marcus Vance</div>
                <div className="text-[10px] text-brand-muted">Lvl 5 • Strength</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@fitquest.com', 'AdminPass123!')}
                className="px-2.5 py-1.5 text-left rounded-lg bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 text-[11px] text-brand-primary transition-colors"
              >
                <div className="font-bold text-brand-primary flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Admin Demo
                </div>
                <div className="text-[10px] text-brand-primary/70">Full System Control</div>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Username or Email"
              type="text"
              leftIcon={<Mail className="w-4 h-4" />}
              placeholder="athlete@fitquest.com"
              error={errors.username_or_email?.message}
              {...register('username_or_email')}
            />

            <Input
              label="Password"
              type="password"
              leftIcon={<Lock className="w-4 h-4" />}
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-brand-muted">Remembered locally</span>
              <Link to="/forgot-password" className="text-brand-primary hover:underline font-semibold">
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 shadow-glow-lime"
              isLoading={isLoading}
            >
              Enter FitQuest <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="pt-4 border-t border-brand-border/60 text-center text-xs text-brand-muted">
            Don't have an athlete account yet?{' '}
            <Link to="/register" className="text-brand-primary font-bold hover:underline">
              Create One Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

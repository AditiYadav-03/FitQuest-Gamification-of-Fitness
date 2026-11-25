import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Zap, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await registerAuth(data);
      showToast('reward', 'Account Created! 🚀', 'Starter pack received: 100 FitCoins added to your vault!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error', err);
      const msg = err.response?.data?.detail || 'Could not complete registration. Please check credentials.';
      setErrorMessage(msg);
      showToast('error', 'Registration Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
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
        <h2 className="text-2xl font-black text-white">Begin Your Fitness Odyssey</h2>
        <p className="text-xs text-brand-muted mt-1.5">
          Join thousands transforming daily fitness into an engaging adventure.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="glass-panel p-8 rounded-3xl border border-brand-border/80 shadow-2xl space-y-6">
          {/* Welcome Bonus Notice */}
          <div className="bg-brand-surface/60 border border-brand-primary/40 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Welcome Gift Pack</div>
              <div className="text-[11px] text-brand-muted">
                Receive <span className="text-brand-gold font-bold">🪙 100 Starter FitCoins</span> and Level 1 access instantly upon signup!
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              leftIcon={<User className="w-4 h-4" />}
              placeholder="e.g. Jordan Smith"
              error={errors.full_name?.message}
              {...register('full_name')}
            />

            <Input
              label="Athlete Username"
              type="text"
              leftIcon={<User className="w-4 h-4" />}
              placeholder="e.g. jordan_fit"
              error={errors.username?.message}
              {...register('username')}
            />

            <Input
              label="Email Address"
              type="email"
              leftIcon={<Mail className="w-4 h-4" />}
              placeholder="jordan@fitquest.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              leftIcon={<Lock className="w-4 h-4" />}
              placeholder="Min. 6 characters"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 shadow-glow-lime"
              isLoading={isLoading}
            >
              Create Athlete Profile <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="pt-4 border-t border-brand-border/60 text-center text-xs text-brand-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-primary font-bold hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

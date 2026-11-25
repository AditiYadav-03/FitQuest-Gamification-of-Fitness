import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import apiClient from '../services/api';
import { useNotification } from '../context/NotificationContext';

export const ForgotPasswordPage: React.FC = () => {
  const { showToast } = useNotification();
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset' | 'completed'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenHint, setTokenHint] = useState<string | null>(null);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/forgot-password', { email });
      if (res.data.reset_token) {
        setResetToken(res.data.reset_token);
        setTokenHint(res.data.reset_token);
      }
      setStep('reset');
      showToast('info', 'Reset Token Generated', 'Use the generated local verification token to update your password.');
    } catch (err: any) {
      showToast('error', 'Request Failed', err.response?.data?.detail || 'Could not process request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !resetToken) return;
    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email,
        token: resetToken,
        new_password: newPassword,
      });
      setStep('completed');
      showToast('success', 'Password Updated!', 'You can now log in with your new credentials.');
    } catch (err: any) {
      showToast('error', 'Reset Failed', err.response?.data?.detail || 'Invalid reset token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel p-8 rounded-3xl border border-brand-border/80 shadow-2xl space-y-6">
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-5 h-5 text-brand-primary" />
            </div>
            <h2 className="text-xl font-bold text-white">Reset Account Password</h2>
            <p className="text-xs text-brand-muted mt-1">
              Secure workflow with local developer simulation token.
            </p>
          </div>

          {step === 'request' && (
            <form onSubmit={handleRequest} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                leftIcon={<Mail className="w-4 h-4" />}
                placeholder="athlete@fitquest.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                Generate Reset Token
              </Button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              {tokenHint && (
                <div className="p-3 bg-brand-surface/80 border border-brand-primary/30 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-brand-primary">Demo Reset Token Active:</span>
                  <div className="font-mono text-white text-[11px] bg-brand-bg p-1.5 rounded border border-brand-border select-all">
                    {tokenHint}
                  </div>
                </div>
              )}

              <Input
                label="Reset Verification Token"
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
              />

              <Input
                label="New Password"
                type="password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                Update Password
              </Button>
            </form>
          )}

          {step === 'completed' && (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-12 h-12 text-brand-primary mx-auto" />
              <h3 className="text-lg font-bold text-white">Password Successfully Reset!</h3>
              <p className="text-xs text-brand-muted">
                Your credentials have been updated securely in the database.
              </p>
              <Link to="/login" className="block">
                <Button variant="primary" size="md" className="w-full">
                  Proceed to Login
                </Button>
              </Link>
            </div>
          )}

          <div className="pt-4 border-t border-brand-border/60 text-center">
            <Link to="/login" className="text-xs text-brand-muted hover:text-white inline-flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

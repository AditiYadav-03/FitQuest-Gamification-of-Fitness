import React from 'react';
import { CheckCircle2, AlertCircle, Info, Trophy, X } from 'lucide-react';
import { useNotification, ToastMessage } from '../../context/NotificationContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  const getToastIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-brand-primary" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'reward':
        return <Trophy className="w-5 h-5 text-brand-gold" />;
      default:
        return <Info className="w-5 h-5 text-brand-blue" />;
    }
  };

  const getToastBorder = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return 'border-brand-primary/40 bg-brand-card/95';
      case 'error':
        return 'border-red-500/40 bg-brand-card/95';
      case 'reward':
        return 'border-brand-gold/40 bg-brand-card/95 shadow-glow-gold';
      default:
        return 'border-brand-blue/40 bg-brand-card/95';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-xl transition-all duration-300 animate-in slide-in-from-right ${getToastBorder(
            toast.type
          )}`}
        >
          <div className="mt-0.5 shrink-0">{getToastIcon(toast.type)}</div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white leading-tight">{toast.title}</h4>
            <p className="text-xs text-brand-muted mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-brand-muted hover:text-white transition-colors p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

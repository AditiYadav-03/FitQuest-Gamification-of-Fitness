import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-brand-primary text-black font-semibold hover:bg-brand-primaryHover shadow-glow-lime focus:ring-brand-primary active:scale-[0.98]',
    secondary: 'bg-brand-surface text-brand-text hover:bg-brand-border border border-brand-border focus:ring-brand-blue active:scale-[0.98]',
    outline: 'bg-transparent text-brand-primary border border-brand-primary/40 hover:border-brand-primary hover:bg-brand-primary/10 focus:ring-brand-primary active:scale-[0.98]',
    ghost: 'bg-transparent text-brand-muted hover:text-white hover:bg-brand-surface/50 active:scale-[0.98]',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 focus:ring-red-500 active:scale-[0.98]',
    glow: 'bg-gradient-to-r from-brand-primary to-brand-blue text-black font-bold shadow-glow-lime hover:opacity-95 active:scale-[0.98]',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};

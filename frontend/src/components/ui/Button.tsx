import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import Spinner from './Spinner';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: ReactNode;
  children: ReactNode;
}

const variants = {
  primary:   'bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/20',
  secondary: 'bg-[#1E293B] hover:bg-[#273549] text-slate-200 border border-[#2D3F55]',
  ghost:     'bg-transparent hover:bg-[#1E293B] text-slate-400 hover:text-slate-200',
  danger:    'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
};
const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

export default function Button({ variant = 'primary', size = 'md', loading, leftIcon, children, disabled, className = '', ...props }: Props) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? <Spinner size="sm" /> : leftIcon}
      {children}
    </button>
  );
}

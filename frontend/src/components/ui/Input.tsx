import { type InputHTMLAttributes, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(({ label, error, hint, className = '', ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
    <input
      ref={ref}
      {...props}
      className={`w-full px-3 py-2.5 rounded-lg text-sm bg-[#0D1426] border text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all duration-200 ${error ? 'border-red-500/60' : 'border-[#1E293B] hover:border-[#2D3F55] focus:border-orange-500/50'} ${className}`}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
    {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
  </div>
));
Input.displayName = 'Input';
export default Input;

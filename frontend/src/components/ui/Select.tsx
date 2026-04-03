import { type SelectHTMLAttributes, forwardRef } from 'react';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, Props>(({ label, error, options, className = '', ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
    <select
      ref={ref}
      {...props}
      className={`w-full px-3 py-2.5 rounded-lg text-sm bg-[#0D1426] border text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all duration-200 ${error ? 'border-red-500/60' : 'border-[#1E293B] hover:border-[#2D3F55] focus:border-orange-500/50'} ${className}`}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
));
Select.displayName = 'Select';
export default Select;

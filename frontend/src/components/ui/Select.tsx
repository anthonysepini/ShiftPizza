import { type SelectHTMLAttributes, forwardRef, useId } from 'react';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, options, className = '', id, 'aria-describedby': describedBy, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? `select-${generatedId}`;
    const errorId = `${selectId}-error`;
    const description = [describedBy, error ? errorId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          {...props}
          id={selectId}
          aria-describedby={description}
          aria-invalid={error ? true : undefined}
          className={`w-full px-3 py-2.5 rounded-lg text-sm bg-[#0D1426] border text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/60 transition-all duration-200 ${error ? 'border-red-400' : 'border-[#334155] hover:border-[#475569] focus:border-orange-400'} ${className}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="text-xs text-red-300">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = 'Select';
export default Select;

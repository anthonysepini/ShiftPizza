import { type InputHTMLAttributes, forwardRef, useId } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, hint, className = '', id, 'aria-describedby': describedBy, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? `input-${generatedId}`;
    const messageId = `${inputId}-${error ? 'error' : 'hint'}`;
    const description = [describedBy, error || hint ? messageId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          {...props}
          id={inputId}
          aria-describedby={description}
          aria-invalid={error ? true : undefined}
          className={`w-full px-3 py-2.5 rounded-lg text-sm bg-[#0D1426] border text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/60 transition-all duration-200 ${error ? 'border-red-400' : 'border-[#334155] hover:border-[#475569] focus:border-orange-400'} ${className}`}
        />
        {error && (
          <p id={messageId} className="text-xs text-red-300">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={messageId} className="text-xs text-slate-400">
            {hint}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
export default Input;

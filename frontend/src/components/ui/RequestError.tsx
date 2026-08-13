import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

type RequestErrorProps = {
  title: string;
  description?: string;
  onRetry: () => void;
};

export default function RequestError({
  title,
  description = 'Verifique sua conexão e tente novamente.',
  onRetry,
}: RequestErrorProps) {
  return (
    <div
      role="alert"
      className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/8 px-6 py-10 text-center"
    >
      <AlertTriangle aria-hidden="true" className="mb-4 text-red-300" size={28} />
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
        {description}
      </p>
      <Button
        className="mt-5"
        leftIcon={<RefreshCw aria-hidden="true" size={14} />}
        onClick={onRetry}
        size="sm"
        type="button"
      >
        Tentar novamente
      </Button>
    </div>
  );
}

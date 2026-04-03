import { X } from 'lucide-react';

export interface ToastItem { id: string; type: 'success' | 'error' | 'info'; message: string; }

const cfg = {
  success: 'bg-green-500/10 border-green-500/30 text-green-300',
  error:   'bg-red-500/10 border-red-500/30 text-red-300',
  info:    'bg-blue-500/10 border-blue-500/30 text-blue-300',
};

export default function ToastContainer({ toasts, remove }: { toasts: ToastItem[]; remove: (id: string) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-72">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl animate-in ${cfg[t.type]}`}>
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

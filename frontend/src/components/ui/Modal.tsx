import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ open, onClose, title, children, size = 'md' }: Props) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) {
      document.addEventListener('keydown', fn);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', fn);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const w = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex min-h-full items-center justify-center p-4">
        <div className={`relative bg-[#111827] border border-[#1E293B] rounded-2xl shadow-2xl w-full ${w} animate-in`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] rounded-t-2xl">
            <h3 className="font-semibold text-white text-sm">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1.5 rounded-lg hover:bg-[#1E293B]"
            >
              <X size={15} />
            </button>
          </div>
          <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}

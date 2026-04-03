import type { ReactNode } from 'react';

interface Props { children: ReactNode; className?: string; onClick?: () => void; }

export default function Card({ children, className = '', onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#111827] border border-[#1E293B] rounded-xl p-5 ${onClick ? 'cursor-pointer hover:border-orange-500/30 hover:bg-[#0F1E34] transition-all duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

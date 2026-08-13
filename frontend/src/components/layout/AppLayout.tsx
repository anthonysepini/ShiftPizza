import { useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { getWrongRoleRedirect } from '../../features/auth/route-access';
import type { Role } from '../../types';
import Sidebar from './Sidebar';

type AppLayoutProps = {
  requiredRole: Role;
};

export default function AppLayout({ requiredRole }: AppLayoutProps) {
  const { isAuthenticated, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const wrongRoleRedirect = getWrongRoleRedirect(user.role, requiredRole);
  if (wrongRoleRedirect) {
    return <Navigate to={wrongRoleRedirect} replace />;
  }

  return (
    <div className="min-h-dvh w-full bg-[#070C18] lg:flex lg:h-screen lg:overflow-hidden">
      <a
        href="#main-content"
        className="sr-only z-60 rounded-lg bg-orange-700 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Ir para o conteúdo
      </a>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#1E293B] bg-[#0A1120] px-4 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-sm shadow-lg shadow-orange-500/30">
              🍕
            </div>
            <div>
              <p className="text-sm font-bold leading-none text-white">ShiftPizza</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-400">
                {requiredRole === 'ADMIN' ? 'Admin' : 'Funcionário'}
              </p>
            </div>
          </div>
          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label="Abrir menu"
            onClick={() => setMenuOpen(true)}
            className="rounded-lg border border-[#334155] p-2.5 text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
          >
            <Menu aria-hidden="true" size={20} />
          </button>
        </header>
        <main id="main-content" className="w-full overflow-y-auto lg:h-screen" tabIndex={0}>
          <div className="min-h-full w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
            <Outlet />
          </div>
        </main>
      </div>
      {menuOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => {
            setMenuOpen(false);
            window.requestAnimationFrame(() => menuButtonRef.current?.focus());
          }}
        />
      )}
    </div>
  );
}

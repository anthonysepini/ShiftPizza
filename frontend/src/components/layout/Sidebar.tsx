import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { LayoutDashboard, Users, CalendarDays, ClipboardList, Calendar, User, LogOut, X } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';
const adminLinks = [
  { to: '/admin',           label: 'Dashboard',     icon: LayoutDashboard, end: true },
  { to: '/admin/employees', label: 'Funcionários',  icon: Users,           end: false },
  { to: '/admin/schedule',  label: 'Escala',        icon: CalendarDays,    end: false },
  { to: '/admin/audit',     label: 'Histórico',     icon: ClipboardList,   end: false },
];

const employeeLinks = [
  { to: '/employee',          label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/employee/calendar', label: 'Minha Escala',icon: Calendar,        end: false },
  { to: '/employee/profile',  label: 'Meu Perfil',  icon: User,            end: false },
];

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const links = isAdmin ? adminLinks : employeeLinks;
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) window.requestAnimationFrame(() => closeButtonRef.current?.focus());
  }, [open]);

  return (
    <aside
      id="mobile-navigation"
      className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-[#1E293B] bg-[#0A1120] transition-transform duration-200 lg:static lg:z-auto lg:w-56 lg:visible lg:translate-x-0 ${open ? 'visible translate-x-0' : 'invisible -translate-x-full'}`}
    >
      {/* Brand */}
      <div className="flex items-center justify-between border-b border-[#1E293B] px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div aria-hidden="true" className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-sm shadow-lg shadow-orange-500/30 shrink-0">
            🍕
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">ShiftPizza</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
              {isAdmin ? 'Admin' : 'Funcionário'}
            </p>
          </div>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Fechar menu"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-300 hover:bg-[#1E293B] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 lg:hidden"
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav aria-label="Navegação principal" className="flex-1 px-2 py-3 space-y-0.5">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-[#1E293B]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} className={isActive ? 'text-orange-400' : ''} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-2 py-3 border-t border-[#1E293B] space-y-1">
        <div className="px-3 py-2.5 rounded-lg bg-[#111827] border border-[#1E293B]">
          <p className="text-xs font-semibold text-slate-200 truncate leading-none">{user?.fullName}</p>
          <p className="text-[10px] text-slate-400 mt-1">{user?.role}</p>
        </div>
        <button
          type="button"
          onClick={() => { logout(); navigate('/login'); onClose(); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </aside>
  );
}

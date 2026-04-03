import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, ClipboardList, Calendar, User, LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

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

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <aside className="w-56 shrink-0 bg-[#0A1120] border-r border-[#1E293B] flex flex-col">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-sm shadow-lg shadow-orange-500/30 shrink-0">
            🍕
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">ShiftPizza</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
              {isAdmin ? 'Admin' : 'Funcionário'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-[#1E293B]'
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
          <p className="text-[10px] text-slate-500 mt-1">{user?.role}</p>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </aside>
  );
}

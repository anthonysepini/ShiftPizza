import { useAuth } from '../../features/auth/useAuth';
import PageHeader from '../../components/layouts/PageHeader.tsx';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { useState, useEffect } from 'react';
import { employeesService } from '../../services/employees.service';
import type { Employee } from '../../types';

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function MyProfilePage() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.employeeId) {
      employeesService.findOne(user.employeeId)
        .then(setEmployee)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!employee) return null;

  const workDays = employee.weeklyRules.filter((r) => r.shouldWork).map((r) => r.weekday);

  return (
    <div className="animate-in">
      <PageHeader title="Meu Perfil" subtitle="Suas informações e escala semanal" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Avatar */}
        <Card className="flex flex-col items-center text-center col-span-1">
          <div className="w-20 h-20 rounded-2xl bg-orange-500/20 border-2 border-orange-500/30 flex items-center justify-center text-3xl font-bold text-orange-400 mb-4">
            {employee.fullName.charAt(0)}
          </div>
          <h2 className="text-lg font-bold text-white">{employee.fullName}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{employee.position}</p>
          <span className={`mt-3 text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider ${employee.isActive ? 'bg-green-500/15 text-green-400' : 'bg-slate-500/15 text-slate-400'}`}>
            {employee.isActive ? 'Ativo' : 'Inativo'}
          </span>
        </Card>

        {/* Dados */}
        <Card className="col-span-2">
          <h3 className="text-sm font-semibold text-white mb-4">Dados pessoais</h3>
          <div className="space-y-3">
            {[
              { label: 'CPF', value: employee.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') },
              { label: 'Telefone', value: employee.phone ?? '—' },
              { label: 'Cargo', value: employee.position },
              { label: 'Perfil', value: employee.user?.role ?? '—' },
              { label: 'Cadastrado em', value: new Date(employee.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-[#1E293B] last:border-0">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-sm text-slate-200 font-medium">{value}</p>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-white mt-5 mb-3">Escala semanal fixa</h3>
          <div className="flex gap-2 flex-wrap">
            {WEEKDAYS.map((d, i) => (
              <span
                key={d}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${workDays.includes(i) ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-[#1E293B] text-slate-600'}`}
              >
                {d}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

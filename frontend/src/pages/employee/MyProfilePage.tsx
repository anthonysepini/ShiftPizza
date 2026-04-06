import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, BadgeCheck, Phone, IdCard } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';
import PageHeader from '../../components/layout/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { employeesService } from '../../services/employees.service';
import type { Employee } from '../../types';

const WEEKDAYS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  EMPLOYEE: 'Empregado',
};

function formatCpf(value?: string | null) {
  const digits = (value ?? '').replace(/\D/g, '');

  if (digits.length !== 11) {
    return value ?? '—';
  }

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatDate(value?: string | Date | null) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getInitials(name?: string | null) {
  if (!name?.trim()) {
    return '?';
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export default function MyProfilePage() {
  const { user } = useAuth();
  const employeeId = user?.employeeId ?? null;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [resolvedEmployeeId, setResolvedEmployeeId] = useState<
    number | string | null
  >(null);

  useEffect(() => {
    if (!employeeId) {
      return;
    }

    let cancelled = false;

    employeesService
      .findOne(employeeId)
      .then((emp) => {
        if (cancelled) return;

        setEmployee(emp);

        const savedPhoto = localStorage.getItem(`sp_photo_${emp.id}`);
        setPhoto(savedPhoto || null);
        setResolvedEmployeeId(employeeId);
      })
      .catch(() => {
        if (cancelled) return;

        setEmployee(null);
        setPhoto(null);
        setResolvedEmployeeId(employeeId);
      });

    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  const isLoading = Boolean(employeeId) && resolvedEmployeeId !== employeeId;

  const workDays = useMemo(() => {
    return new Set(
      (employee?.weeklyRules ?? [])
        .filter((rule) => rule.shouldWork)
        .map((rule) => rule.weekday),
    );
  }, [employee]);

  const activeDaysCount = workDays.size;
  const roleLabel =
    ROLE_LABEL[employee?.user?.role ?? ''] ?? employee?.user?.role ?? '—';

  if (isLoading) {
    return (
      <div className="flex min-h-[42vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!employeeId || !employee) {
    return (
      <div className="animate-in space-y-6">
        <PageHeader
          title="Meu Perfil"
          subtitle="Suas informações pessoais e rotina de trabalho."
        />

        <div className="rounded-[28px] border border-white/8 bg-[#090909] p-4 sm:p-6">
          <EmptyState
            icon="👤"
            title="Perfil indisponível"
            description="Não foi possível carregar suas informações no momento."
          />
        </div>
      </div>
    );
  }

  const infoCards = [
    {
      label: 'ㅤCPF',
      value: formatCpf(employee.cpf),
      icon: IdCard,
    },
    {
      label: 'ㅤTelefone',
      value: employee.phone ?? '—',
      icon: Phone,
    },
    {
      label: 'ㅤCargo',
      value: employee.position || '—',
      icon: BadgeCheck,
    },
    {
      label: 'ㅤPerfil',
      value: roleLabel,
      icon: BadgeCheck,
    },
    {
      label: 'ㅤCadastrado em',
      value: formatDate(employee.createdAt),
      icon: CalendarDays,
    },
    {
      label: 'ㅤ Dias fixos por semana',
      value: `${activeDaysCount} dia${activeDaysCount === 1 ? '' : 's'}`,
      icon: CalendarDays,
    },
  ];

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title="Meu Perfil"
        subtitle="Suas informações, status e rotina semanal em uma visão organizada."
      />

      <section className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[#070707] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.42)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 top-[-92px] h-44 w-44 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-68px] left-[-28px] h-32 w-32 rounded-full bg-amber-500/6 blur-3xl" />

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-orange-400/15 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">
            ㅤÁrea do funcionário
          </span>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
            Seu perfil centralizado.
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Consulte rapidamente seus dados principais, cargo, status e dias
            fixos da sua rotina ㅤㅤㅤsemanal.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px,minmax(0,1fr)]">
        <section className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[#090909] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
          <div className="pointer-events-none absolute -top-10 right-[-24px] h-28 w-28 rounded-full bg-orange-500/8 blur-3xl" />

          <div className="relative flex flex-col items-center text-center">
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-[28px] bg-orange-500/15 blur-2xl" />

              {photo ? (
                <img
                  src={photo}
                  alt={employee.fullName}
                  className="relative h-28 w-28 rounded-[28px] border border-orange-400/25 object-cover shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
                />
              ) : (
                <div className="relative flex h-28 w-28 items-center justify-center rounded-[28px] border border-orange-400/25 bg-orange-500/10 text-3xl font-bold text-orange-300 shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
                  {getInitials(employee.fullName)}
                </div>
              )}
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-white">
              {employee.fullName}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {employee.position || 'Cargo não informado'}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                  employee.isActive
                    ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-300'
                    : 'border-white/10 bg-white/[0.04] text-zinc-300'
                }`}
              >
                {employee.isActive ? 'Ativo' : 'Inativo'}
              </span>

              <span className="inline-flex items-center rounded-full border border-orange-400/15 bg-orange-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-300">
                {roleLabel}
              </span>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-[28px] border border-white/8 bg-[#090909] shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-3 border-b border-white/8 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">
                  ㅤDados do colaborador
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  ㅤInformações principais organizadas com leitura rápida e limpa.
                </p>
              </div>

              <div className="inline-flex w-fit items-center rounded-full border border-orange-400/15 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
                Perfil atualizado
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:p-4">
              {infoCards.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 transition-all duration-200 hover:border-orange-500/15 hover:bg-white/[0.03]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                        {label}
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {value}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-400/15 bg-orange-500/10 text-orange-300">
                      <Icon size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-white/8 bg-[#090909] shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-3 border-b border-white/8 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">
                  ㅤEscala semanal fixa
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  ㅤDias da semana em que você está escalado para trabalhar.
                </p>
              </div>

              <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-zinc-300">
                {activeDaysCount} dia{activeDaysCount === 1 ? '' : 's'} ativo
                {activeDaysCount === 1 ? '' : 's'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-4 lg:grid-cols-7 sm:p-4">
              {WEEKDAYS.map((day, index) => {
                const enabled = workDays.has(index);

                return (
                  <div
                    key={day}
                    className={`rounded-2xl border p-4 text-center transition-all duration-200 ${
                      enabled
                        ? 'border-orange-500/20 bg-orange-500/10'
                        : 'border-white/8 bg-white/[0.02]'
                    }`}
                  >
                    <p
                      className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                        enabled ? 'text-orange-300' : 'text-slate-500'
                      }`}
                    >
                      {WEEKDAYS_SHORT[index]}
                    </p>

                    <p
                      className={`mt-3 text-sm font-medium ${
                        enabled ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {day}
                    </p>

                    <div className="mt-4 flex justify-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                          enabled
                            ? 'border border-orange-400/15 bg-orange-500/10 text-orange-300'
                            : 'border border-white/10 bg-white/[0.03] text-zinc-400'
                        }`}
                      >
                        {enabled ? 'Ativo' : 'Inoperante'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

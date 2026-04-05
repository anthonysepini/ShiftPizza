import { useState, type FormEvent, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { demoService } from '../../services/demo.service';

function GithubIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57
           0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695
           -.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99
           .105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225
           -.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405
           c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225
           0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3
           0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
      />
    </svg>
  );
}

function ShieldIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3 5.5 5.4v5.4c0 4.27 2.73 8.25 6.5 9.7 3.77-1.45 6.5-5.43 6.5-9.7V5.4L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m9.5 11.9 1.7 1.7 3.6-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5 19.2c1.55-2.6 4.07-3.9 7-3.9s5.45 1.3 7 3.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8.5 11V8.6A3.5 3.5 0 0 1 12 5a3.5 3.5 0 0 1 3.5 3.6V11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowUpRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7 17 17 7M9 7h8v8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RefreshIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.36 2.64L21 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M21 3v6h-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.36-2.64L3 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3 21v-6h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarningIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BrandMark() {
  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-[0_14px_40px_rgba(0,0,0,0.32)] backdrop-blur-md">
      <div className="absolute inset-[4px] rounded-[14px] bg-gradient-to-br from-orange-500 via-amber-500 to-orange-400 opacity-95" />
      <span className="relative text-[1.45rem] leading-none">🍕</span>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

type FieldProps = {
  id: string;
  label: string;
  type: 'text' | 'password';
  placeholder: string;
  value: string;
  autoComplete: string;
  onChange: (value: string) => void;
  icon: ReactNode;
  accent:
    | 'focus-within:border-orange-400/40 focus-within:ring-orange-400/10'
    | 'focus-within:border-amber-400/40 focus-within:ring-amber-400/10';
};

function InputField({
  id,
  label,
  type,
  placeholder,
  value,
  autoComplete,
  onChange,
  icon,
  accent,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2.5 block text-sm font-medium text-slate-200">
        {label}
      </label>

      <div
        className={`group flex h-16 items-center gap-3 rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 transition-all focus-within:bg-[#101010] focus-within:ring-4 ${accent}`}
      >
        <div className="flex h-5 w-5 shrink-0 items-center justify-center text-slate-500 transition-colors group-focus-within:text-white/90">
          {icon}
        </div>

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          autoComplete={autoComplete}
          className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] leading-normal text-white outline-none placeholder:text-slate-500"
        />
      </div>
    </div>
  );
}

const demoAccounts = [
  { role: 'Admin', cpf: '000.000.000-01', pwd: 'admin123', accent: 'orange' },
  { role: 'João', cpf: '000.000.000-02', pwd: 'joao123', accent: 'amber' },
] as const;

const accentStyles = {
  orange: {
    badge: 'border-orange-400/25 bg-orange-400/10 text-orange-200',
    line: 'from-orange-400 via-amber-400 to-transparent',
    shadow: 'hover:shadow-[0_16px_40px_rgba(249,115,22,0.18)]',
  },
  amber: {
    badge: 'border-amber-400/25 bg-amber-400/10 text-amber-200',
    line: 'from-amber-400 via-orange-300 to-transparent',
    shadow: 'hover:shadow-[0_16px_40px_rgba(245,158,11,0.16)]',
  },
} as const;

function ResetModal({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (open) document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#050505] p-7 shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/30 to-transparent" />

        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10">
          <WarningIcon className="h-7 w-7 text-red-400" />
        </div>

        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-400/80">
          Ação irreversível
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Resetar demo?</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Isso vai restaurar o sistema para o estado original de demonstração.
        </p>

        <ul className="mt-4 space-y-2">
          {[
            'Funcionários adicionados depois do seed',
            'Fotos salvas localmente dos funcionários',
            'Alterações na escala e faltas registradas',
            'Histórico de ações do sistema',
            'Dados de sessão salvos no navegador',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm text-slate-400">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-[10px] font-bold text-red-400">
                ✕
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-7 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-300 transition-all hover:bg-white/8 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_12px_30px_rgba(239,68,68,0.3)] transition-all hover:from-red-500 hover:to-red-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                Resetando...
              </>
            ) : (
              <>
                <RefreshIcon className="h-4 w-4" />
                Resetar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(user?.role === 'ADMIN' ? '/admin' : '/employee', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(cpf, password);
    } catch {
      setError('CPF ou senha incorretos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    setResetMsg('');

    try {
      await demoService.reset();

      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key?.startsWith('sp_photo_') || key === 'sp_token' || key === 'sp_user') {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));

      setCpf('');
      setPassword('');
      setError('');
      setShowResetModal(false);
      setResetMsg('✅ Demo restaurada com sucesso. Faça login novamente para testar.');
    } catch {
      setShowResetModal(false);
      setResetMsg('❌ Erro ao resetar a demo. Verifique se o backend está rodando.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(245,158,11,0.10),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(249,115,22,0.08),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:82px_82px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_22%)]" />

      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-orange-500/16 blur-3xl" />
      <div className="pointer-events-none absolute right-[-4rem] top-[14%] h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute left-[10%] bottom-[10%] h-64 w-64 rounded-full bg-orange-600/10 blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-[760px]">
          <div className="mb-8 flex flex-col items-center gap-3">
            {resetMsg && (
              <div
                aria-live="polite"
                className={`w-full max-w-md rounded-2xl border px-5 py-3 text-center text-sm font-medium ${
                  resetMsg.startsWith('✅')
                    ? 'border-green-400/20 bg-green-400/10 text-green-200'
                    : 'border-red-400/20 bg-red-400/10 text-red-200'
                }`}
              >
                {resetMsg}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setResetMsg('');
                setShowResetModal(true);
              }}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]/80 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-slate-300 shadow-[0_8px_28px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-400/25 hover:shadow-[0_14px_40px_rgba(249,115,22,0.14)] hover:text-orange-200"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <RefreshIcon className="h-4 w-4 text-orange-400/80 transition-transform duration-500 group-hover:rotate-180" />
              Resetar demo
            </button>

            <p className="max-w-xs text-center text-[11px] text-slate-600">
              Restaura funcionários, agenda, faltas, fotos e histórico da demonstração
            </p>
          </div>

          <div className="relative mx-auto w-full overflow-hidden rounded-[30px] border border-white/10 bg-[#050505]/90 p-5 shadow-[0_32px_90px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-7">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06),transparent_26%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/20 to-transparent" />

            <div className="relative">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <BrandMark />

                  <div className="min-w-0">
                    <p className="truncate text-[2rem] font-semibold leading-none tracking-tight text-white">
                      ShiftPizza
                    </p>
                    <p className="mt-2 text-sm text-slate-400">Acesso ao painel da operação</p>
                  </div>
                </div>

                <div className="inline-flex w-fit shrink-0 items-center gap-2 self-start rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-300">
                  <ShieldIcon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">Secure Access</span>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-lg font-semibold uppercase tracking-[0.24em] text-slate-300 sm:text-xl">
                  Bem-vindo
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white sm:text-[3rem] sm:leading-[0.98]">
                  Faça login na sua conta
                </h1>
              </div>

              <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-5">
                <div className="space-y-4 rounded-[24px] border border-white/10 bg-white/[0.025] p-4 sm:p-5">
                  <InputField
                    id="cpf"
                    label="CPF"
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={setCpf}
                    autoComplete="username"
                    accent="focus-within:border-orange-400/40 focus-within:ring-orange-400/10"
                    icon={<UserIcon className="h-5 w-5" />}
                  />

                  <InputField
                    id="password"
                    label="Senha"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={setPassword}
                    autoComplete="current-password"
                    accent="focus-within:border-amber-400/40 focus-within:ring-amber-400/10"
                    icon={<LockIcon className="h-5 w-5" />}
                  />
                </div>

                {error && (
                  <div
                    aria-live="polite"
                    className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 px-5 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_18px_45px_rgba(249,115,22,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(249,115,22,0.36)] disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar no sistema
                      <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-center text-sm leading-6 text-slate-400">
                  Use uma credencial demo abaixo ou faça login com seu CPF e senha.
                </div>
              </form>

              <div className="mt-7">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Credenciais demo
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Clique em uma opção para preencher automaticamente.
                    </p>
                  </div>

                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Quick fill
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {demoAccounts.map((account) => {
                    const styles = accentStyles[account.accent];

                    return (
                      <button
                        key={account.role}
                        type="button"
                        onClick={() => {
                          setCpf(account.cpf);
                          setPassword(account.pwd);
                          setError('');
                        }}
                        className={`group relative rounded-[22px] border border-white/10 bg-[#0A0A0A]/92 p-5 pr-12 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-400/20 ${styles.shadow}`}
                      >
                        <div
                          className={`pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[22px] bg-gradient-to-r ${styles.line} opacity-80`}
                        />

                        <ArrowUpRightIcon className="absolute right-5 top-5 h-4 w-4 shrink-0 text-slate-500 transition-colors group-hover:text-orange-200" />

                        <div
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${styles.badge}`}
                        >
                          {account.role}
                        </div>

                        <div className="mt-5">
                          <p className="break-words text-[1.05rem] font-semibold text-white">
                            {account.cpf}
                          </p>
                          <p className="mt-2 text-sm text-slate-400">{account.pwd}</p>
                          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">
                            {account.role === 'Admin'
                              ? 'Área administrativa'
                              : 'Área de colaborador'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-slate-400">Desenvolvido por</p>

          <a
            href="https://github.com/anthonysepini"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-slate-300 shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-all hover:border-orange-400/20 hover:bg-orange-400/[0.08] hover:text-orange-100"
          >
            <GithubIcon
              size={15}
              className="text-slate-400 transition-colors group-hover:text-orange-200"
            />
            anthonysepini
          </a>
        </div>
      </div>

      <ResetModal
        open={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={() => void handleReset()}
        loading={resetting}
      />
    </div>
  );
}

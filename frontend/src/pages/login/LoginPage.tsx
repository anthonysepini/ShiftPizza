import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

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

const demoAccounts = [
  { role: 'Admin', cpf: '000.000.000-01', pwd: 'admin123', accent: 'orange' },
  { role: 'João', cpf: '000.000.000-02', pwd: 'joao123', accent: 'blue' },
] as const;

const accentStyles = {
  orange: {
    badge: 'border-orange-500/25 bg-orange-500/10 text-orange-300',
    title: 'text-orange-400',
    ring: 'hover:border-orange-500/35',
  },
  blue: {
    badge: 'border-blue-500/25 bg-blue-500/10 text-blue-300',
    title: 'text-blue-400',
    ring: 'hover:border-blue-500/35',
  },
} as const;

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060B16] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_24%)]" />

      <div className="pointer-events-none absolute left-[8%] top-[18%] h-[320px] w-[320px] rounded-full bg-blue-500/12 blur-3xl" />
      <div className="pointer-events-none absolute left-[14%] bottom-[10%] h-[220px] w-[220px] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[16%] h-[340px] w-[340px] rounded-full bg-orange-500/14 blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] bottom-[12%] h-[220px] w-[220px] rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-10 sm:px-8 lg:px-12">
        <div className="grid w-full items-center gap-14 xl:grid-cols-[0.96fr_1.04fr] xl:gap-16">
          <section className="flex min-h-[720px] flex-col justify-between">
            <div className="mx-auto w-full max-w-[620px] xl:mx-0 xl:max-w-[660px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-[#F5F1E8] backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_18px_rgba(251,146,60,0.95)]" />
                Sistema de escalas
              </div>

              <div className="mt-10 space-y-6">
                <h1 className="text-4xl font-black leading-[0.94] tracking-[-0.045em] text-white sm:text-5xl lg:text-[4.25rem] xl:text-[4.75rem]">
                  Gestão de equipes
                  <br />
                  com presença.
                </h1>

                <p className="max-w-[610px] text-base leading-8 text-slate-300 sm:text-lg">
                  Organize funcionários, escalas e rotina da operação em uma interface mais
                  limpa, moderna e profissional, com foco em clareza, velocidade e boa apresentação.
                </p>
              </div>

              <div className="mt-10 grid gap-5 md:grid-cols-2">
                <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.18)] backdrop-blur-md">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Painel</p>
                  <p className="mt-2 text-[1.55rem] font-semibold leading-tight text-white">
                    Admin intuitivo
                  </p>
                  <p className="mt-3 text-[15px] leading-7 text-slate-400">
                    Controle visual mais claro para ações do dia a dia.
                  </p>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.18)] backdrop-blur-md">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Equipe</p>
                  <p className="mt-2 text-[1.55rem] font-semibold leading-tight text-white">
                    Fluxo simples
                  </p>
                  <p className="mt-3 text-[15px] leading-7 text-slate-400">
                    Acesso rápido com credenciais de demonstração.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-center xl:justify-start">
              <div className="flex flex-col items-center gap-3 xl:items-start">
                <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#F5F1E8]">
                  Desenvolvido por
                </span>

                <a
                  href="https://github.com/anthonysepini"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 rounded-xl border border-white/10 bg-[#111827] px-3.5 py-2.5 shadow-[0_14px_35px_rgba(0,0,0,0.18)] transition-all duration-200 hover:border-orange-500/30 hover:bg-[#162032]"
                >
                  <GithubIcon
                    size={14}
                    className="text-slate-400 transition-colors group-hover:text-orange-400"
                  />
                  <span className="text-sm font-semibold text-slate-300 transition-colors group-hover:text-orange-400">
                    anthonysepini
                  </span>
                </a>
              </div>
            </div>
          </section>

          <section className="flex justify-center xl:justify-end">
            <div className="relative w-full max-w-[720px] overflow-hidden rounded-[30px] border border-white/10 bg-[#0B1220]/90 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:p-8">
              <div className="pointer-events-none absolute inset-0 rounded-[30px] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06),transparent_26%)]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="relative">
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 rounded-2xl bg-orange-500/30 blur-xl" />
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-3xl shadow-2xl shadow-orange-500/25">
                        🍕
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="text-3xl font-bold tracking-tight text-white sm:text-[2.05rem]">
                        ShiftPizza
                      </p>
                      <p className="mt-1 text-base text-slate-400">Acesse sua conta</p>
                    </div>
                  </div>

                  <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300 sm:text-[11px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Acesso seguro
                  </div>
                </div>

                <div className="mb-7">
                  <h2 className="text-2xl font-semibold text-white sm:text-3xl">Entrar no sistema</h2>
                  <p className="mt-3 text-base leading-7 text-slate-400">
                    Faça login para acessar o painel administrativo ou a área do funcionário.
                  </p>
                </div>

                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
                  <div className="space-y-5 rounded-[22px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                    <Input
                      label="CPF"
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      required
                      autoComplete="username"
                    />

                    <Input
                      label="Senha"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full justify-center py-3.5 text-base font-semibold shadow-[0_16px_40px_rgba(249,115,22,0.28)]"
                  >
                    Entrar no sistema
                  </Button>

                  <p className="text-center text-sm leading-7 text-slate-500">
                    Use uma credencial demo abaixo ou entre com seu CPF e senha.
                  </p>
                </form>

                <div className="mt-7 border-t border-white/10 pt-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Credenciais de demo
                    </p>

                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                      clique para preencher
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
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
                          className={`group rounded-[20px] border border-white/10 bg-[#111827]/88 p-4 text-left shadow-[0_16px_36px_rgba(0,0,0,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#162032] ${styles.ring}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div
                                className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${styles.badge}`}
                              >
                                {account.role}
                              </div>

                              <p className={`mt-3 text-[1.1rem] font-semibold leading-none ${styles.title}`}>
                                {account.cpf}
                              </p>

                              <p className="mt-3 text-sm leading-5 text-slate-500 transition-colors group-hover:text-slate-400">
                                {account.pwd}
                              </p>
                            </div>

                            <span className="mt-1 shrink-0 text-lg text-slate-600 transition-colors group-hover:text-slate-300">
                              →
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

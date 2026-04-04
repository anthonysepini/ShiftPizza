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
    <div className="min-h-screen w-full bg-[#070C18] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-125 bg-orange-500/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-blue-500/3 rounded-full blur-3xl pointer-events-none" />

      {/* Main content */}
      <div className="w-full max-w-sm relative flex-1 flex flex-col justify-center animate-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-orange-500/30 rounded-2xl blur-xl" />
            <div className="relative w-16 h-16 rounded-2xl bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-3xl shadow-2xl">
              🍕
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ShiftPizza</h1>
          <p className="text-slate-500 text-sm mt-1.5 text-center">
            Gestão de escalas para pequenas equipes
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0D1426]/90 border border-[#1E293B] rounded-2xl p-7 shadow-2xl backdrop-blur-sm">
          <h2 className="text-base font-semibold text-white mb-6">Entrar na conta</h2>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
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

            {error && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full justify-center mt-2 py-3 text-base font-semibold"
            >
              Entrar
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-[#1E293B]">
            <p className="text-[10px] text-slate-600 text-center uppercase tracking-widest mb-3 font-medium">
              Credenciais de demo
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'Admin', cpf: '000.000.000-01', pwd: 'admin123', color: 'orange' },
                { role: 'João',  cpf: '000.000.000-02', pwd: 'joao123',  color: 'blue'   },
              ].map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => { setCpf(d.cpf); setPassword(d.pwd); }}
                  className="bg-[#111827] hover:bg-[#162032] border border-[#1E293B] hover:border-orange-500/20 rounded-xl px-3 py-3 text-center transition-all duration-200 group"
                >
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${d.color === 'orange' ? 'text-orange-400' : 'text-blue-400'}`}>
                    {d.role}
                  </p>
                  <p className="text-xs text-slate-300 font-medium">{d.cpf}</p>
                  <p className="text-[10px] text-slate-600 group-hover:text-slate-500 transition-colors mt-0.5">
                    {d.pwd}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GitHub link */}
      <div className="relative mt-8 pb-6 w-full max-w-sm flex justify-center">
        
          href="https://github.com/anthonysepini"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 group"
        {'>'}
          <span className="text-[10px] text-slate-600 uppercase tracking-widest font-medium">
            Desenvolvido por
          </span>
          <div className="flex items-center gap-2 bg-[#111827] border border-[#1E293B] hover:border-orange-500/30 rounded-xl px-4 py-2 transition-all duration-200 group-hover:bg-[#162032]">
            <GithubIcon
              size={14}
              className="text-slate-400 group-hover:text-orange-400 transition-colors"
            />
            <span className="text-sm font-semibold text-slate-300 group-hover:text-orange-400 transition-colors">
              anthonysepini
            </span>
          </div>
        </div>
      </div>
  );
}

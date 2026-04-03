import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(user?.role === 'ADMIN' ? '/admin' : '/employee', { replace: true });
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
    <div className="min-h-screen bg-[#070C18] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 'w-125' 'h-75' bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative animate-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-3xl shadow-2xl shadow-orange-500/40 mb-4">
            🍕
          </div>
          <h1 className="text-2xl font-bold text-white">ShiftPizza</h1>
          <p className="text-slate-500 text-sm mt-1">Gestão de escalas para pequenas equipes</p>
        </div>

        {/* Form */}
        <div className="bg-[#0D1426] border border-[#1E293B] rounded-2xl p-6 shadow-2xl">
          <h2 className="text-base font-semibold text-white mb-5">Entrar na conta</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="CPF" type="text" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value)} required autoComplete="username" />
            <Input label="Senha" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full justify-center mt-1">
              Entrar
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 pt-5 border-t border-[#1E293B]">
            <p className="text-[10px] text-slate-600 text-center uppercase tracking-wider mb-3">Credenciais de demo</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'Admin', cpf: '000.000.000-01', pwd: 'admin123', color: 'orange' },
                { role: 'João', cpf: '000.000.000-02', pwd: 'joao123', color: 'blue' },
              ].map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => { setCpf(d.cpf); setPassword(d.pwd); }}
                  className="bg-[#111827] hover:bg-[#162032] border border-[#1E293B] rounded-lg px-3 py-2.5 text-center transition-all duration-200 group"
                >
                  <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${d.color === 'orange' ? 'text-orange-400' : 'text-blue-400'}`}>{d.role}</p>
                  <p className="text-xs text-slate-400">{d.cpf}</p>
                  <p className="text-[10px] text-slate-600 group-hover:text-slate-500 transition-colors">{d.pwd}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

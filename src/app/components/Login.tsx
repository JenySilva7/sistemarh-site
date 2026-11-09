import { useState, type FormEvent } from 'react';
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login, erroLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setCarregando(true);
    try {
      await login(email, senha);
    } catch {
      // erroLogin já guarda a mensagem — só evita que o erro suba sem tratamento.
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm">
        <div
          className="relative overflow-hidden rounded-t-2xl px-6 pt-10 pb-20 text-center"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)' }}
        >
          <div
            className="absolute -right-10 -top-14 w-44 h-44 rounded-full"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            aria-hidden="true"
          />
          <div className="relative w-32 mx-auto rounded-2xl bg-white p-2.5 mb-4 shadow-lg overflow-hidden">
            <img src="/logo-humanconnect.jpg" alt="HumanConnect" className="w-full h-full object-contain rounded-lg" />
          </div>
          <p className="relative text-sm text-white/80 mt-1">Entre com sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-b-2xl shadow-xl px-6 py-6 -mt-8 relative space-y-4">
          {erroLogin && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{erroLogin}</span>
            </div>
          )}

          <div>
            <label className="text-sm text-gray-700 font-medium" htmlFor="email">
              E-mail
            </label>
            <div className="relative mt-1.5">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 font-medium" htmlFor="senha">
              Senha
            </label>
            <div className="relative mt-1.5">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="senha"
                type={mostrarSenha ? 'text' : 'password'}
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {carregando && <Loader2 className="w-4 h-4 animate-spin" />}
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

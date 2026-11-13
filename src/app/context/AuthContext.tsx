import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { api, ApiError, definirHandlerNaoAutorizado, MENSAGEM_SESSAO_EXPIRADA } from '../../services/api';
import type { PerfilUsuario, UsuarioDto } from '../../types/api';

const TOKEN_STORAGE_KEY = 'sistemarh.token';

// O token JWT não devolve o perfil (Funcionario/Rh/Admin) no corpo do
// /api/auth/me — mas o próprio token carrega essa informação numa claim
// "perfil" (ver JwtTokenService no backend). Decodificamos o payload do JWT
// no navegador (sem validar assinatura — quem valida é sempre o backend,
// isso aqui é só pra saber o que mostrar na tela).
function decodificarPerfilDoToken(token: string): PerfilUsuario | null {
  try {
    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson) as { perfil?: string };
    return (payload.perfil as PerfilUsuario) ?? null;
  } catch {
    return null;
  }
}

interface AuthContextValue {
  token: string | null;
  usuario: UsuarioDto | null;
  perfil: PerfilUsuario | null;
  isAuthenticated: boolean;
  isRhOuAdmin: boolean;
  loading: boolean;
  erroLogin: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<UsuarioDto | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [erroLogin, setErroLogin] = useState<string | null>(null);
  // Cópia síncrona do token atual, lida pelo handler de 401 (que vive fora do
  // ciclo de render).
  const tokenAtualRef = useRef<string | null>(null);

  function iniciarSessao(novoToken: string, novoUsuario: UsuarioDto) {
    tokenAtualRef.current = novoToken;
    setToken(novoToken);
    setUsuario(novoUsuario);
    setPerfil(decodificarPerfilDoToken(novoToken));
  }

  function logout() {
    tokenAtualRef.current = null;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUsuario(null);
    setPerfil(null);
  }

  // Qualquer chamada autenticada que volte 401 (token de 120 min expirado)
  // encerra a sessão e leva pro login com o aviso.
  useEffect(() => {
    definirHandlerNaoAutorizado((tokenUsado) => {
      // Uma resposta atrasada de uma sessão antiga não pode derrubar o login novo.
      if (tokenAtualRef.current !== null && tokenAtualRef.current !== tokenUsado) return;
      logout();
      setErroLogin(MENSAGEM_SESSAO_EXPIRADA);
    });
    return () => definirHandlerNaoAutorizado(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ao carregar a página, tenta restaurar a sessão a partir do token salvo.
  useEffect(() => {
    const tokenSalvo = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!tokenSalvo) {
      setLoading(false);
      return;
    }

    api
      .me(tokenSalvo)
      .then((usuarioRestaurado) => iniciarSessao(tokenSalvo, usuarioRestaurado))
      .catch((erro) => {
        // 401 já foi tratado pelo handler acima. Servidor fora do ar não
        // invalida o token: ele fica salvo pra próxima tentativa.
        if (erro instanceof ApiError && erro.status !== 401) {
          setErroLogin(erro.message);
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, senha: string) {
    setErroLogin(null);
    try {
      const resposta = await api.login(email, senha);
      localStorage.setItem(TOKEN_STORAGE_KEY, resposta.token);
      iniciarSessao(resposta.token, resposta.usuario);
    } catch (erro) {
      const mensagem = erro instanceof ApiError ? erro.message : 'Não foi possível conectar ao servidor.';
      setErroLogin(mensagem);
      throw erro;
    }
  }

  const value: AuthContextValue = {
    token,
    usuario,
    perfil,
    isAuthenticated: token !== null && usuario !== null,
    isRhOuAdmin: perfil === 'Rh' || perfil === 'Admin',
    loading,
    erroLogin,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de um <AuthProvider>.');
  }
  return context;
}

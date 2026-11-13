// Cliente HTTP simples pro backend .NET (SistemaRH.Backend). Usa fetch puro
// (sem axios) e lança um erro com a mensagem amigável que a API devolve em
// `{ mensagem: "..." }` nas respostas de erro (ver ExceptionMiddleware no backend).

import type {
  ApiErrorBody,
  AusenciaRhDto,
  AuthResponseDto,
  CargoDto,
  DepartamentoCreateDto,
  DepartamentoDto,
  ExtratoBancoHorasDto,
  FuncionarioCreateDto,
  FuncionarioDto,
  FuncionarioUpdateDto,
  RecrutamentoDto,
  RegistroPontoRhDto,
  StatusAusencia,
  UsuarioDto,
} from '../types/api';

// Em dev local isso seria http://localhost:5080, mas o backend está exposto
// via túnel (Cloudflare) pra o site também poder ser acessado de fora desta
// máquina — ambos precisam apontar pro mesmo endereço público.
const BASE_URL = 'https://solved-dish-observer-mix.trycloudflare.com';

export class ApiError extends Error {
  status: number;
  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.status = status;
  }
}

export const MENSAGEM_SESSAO_EXPIRADA = 'Sua sessão expirou. Faça login novamente.';
const MENSAGEM_SEM_CONEXAO = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
const MENSAGEM_SERVIDOR_INDISPONIVEL = 'O servidor está indisponível no momento. Tente novamente em instantes.';

// Chamado quando uma requisição autenticada volta 401 (token expirado ou
// inválido). Quem registra é o AuthContext, que encerra a sessão — o módulo
// da API não conhece o React. Recebe o token usado na requisição.
type HandlerNaoAutorizado = (tokenUsado: string) => void;
let handlerNaoAutorizado: HandlerNaoAutorizado | null = null;

export function definirHandlerNaoAutorizado(handler: HandlerNaoAutorizado | null) {
  handlerNaoAutorizado = handler;
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {}
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, MENSAGEM_SEM_CONEXAO);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  // O login também responde 401 (senha errada), mas aí a mensagem do backend
  // é a que importa — só derruba a sessão quando havia um token.
  if (response.status === 401 && options.token) {
    handlerNaoAutorizado?.(options.token);
    throw new ApiError(401, MENSAGEM_SESSAO_EXPIRADA);
  }

  // Com o túnel do Cloudflare fora do ar chega uma página HTML (530/502),
  // não o JSON do backend.
  if (response.status >= 500) {
    throw new ApiError(response.status, MENSAGEM_SERVIDOR_INDISPONIVEL);
  }

  const isJson = /json/i.test(response.headers.get('content-type') ?? '');
  let data: unknown = undefined;
  if (isJson) {
    try {
      data = await response.json();
    } catch {
      data = undefined;
    }
  }

  if (!response.ok) {
    const mensagem = (data as ApiErrorBody | undefined)?.mensagem;
    if (mensagem) {
      throw new ApiError(response.status, mensagem);
    }
    // A policy "RhOuAdmin" devolve 403 sem corpo nenhum.
    if (response.status === 403) {
      throw new ApiError(403, 'Você não tem permissão para acessar este recurso.');
    }
    throw new ApiError(response.status, MENSAGEM_SERVIDOR_INDISPONIVEL);
  }

  return data as T;
}

export const api = {
  login: (email: string, senha: string) =>
    request<AuthResponseDto>('/api/auth/login', { method: 'POST', body: { email, senha } }),

  me: (token: string) => request<UsuarioDto>('/api/auth/me', { token }),

  listarFuncionarios: (token: string) => request<FuncionarioDto[]>('/api/funcionarios', { token }),

  listarDepartamentos: (token: string) => request<DepartamentoDto[]>('/api/departamentos', { token }),

  listarCargos: (token: string) => request<CargoDto[]>('/api/cargos', { token }),

  criarDepartamento: (token: string, dto: DepartamentoCreateDto) =>
    request<DepartamentoDto>('/api/departamentos', { method: 'POST', body: dto, token }),

  criarFuncionario: (token: string, dto: FuncionarioCreateDto) =>
    request<FuncionarioDto>('/api/funcionarios', { method: 'POST', body: dto, token }),

  atualizarFuncionario: (token: string, id: number, dto: FuncionarioUpdateDto) =>
    request<FuncionarioDto>(`/api/funcionarios/${id}`, { method: 'PUT', body: dto, token }),

  desligarFuncionario: (token: string, id: number) =>
    request<FuncionarioDto>(`/api/funcionarios/${id}/desligar`, { method: 'POST', body: {}, token }),

  obterExtratoBancoHoras: (token: string, funcionarioId: number) =>
    request<ExtratoBancoHorasDto>(`/api/funcionarios/${funcionarioId}/banco-horas`, { token }),

  // Cria o login do colaborador no app, vincula uma conta existente com o
  // mesmo e-mail ou redefine a senha do app.
  definirAcessoApp: (token: string, funcionarioId: number, senha: string) =>
    request<FuncionarioDto>(`/api/funcionarios/${funcionarioId}/acesso-app`, { method: 'POST', body: { senha }, token }),

  listarAusenciasRh: (token: string, status?: StatusAusencia) =>
    request<AusenciaRhDto[]>(`/api/rh/ausencias${status !== undefined ? `?status=${status}` : ''}`, { token }),

  atualizarStatusAusencia: (token: string, id: number, status: StatusAusencia) =>
    request<AusenciaRhDto | undefined>(`/api/rh/ausencias/${id}/status`, { method: 'PUT', body: { status }, token }),

  /** `data` no formato YYYY-MM-DD; sem ela o backend usa o dia de hoje (Brasília). */
  listarPontoRh: (token: string, data?: string) =>
    request<RegistroPontoRhDto[]>(`/api/rh/ponto${data ? `?data=${encodeURIComponent(data)}` : ''}`, { token }),

  listarRecrutamentos: (token: string) => request<RecrutamentoDto[]>('/api/recrutamento', { token }),
};

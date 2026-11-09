// Cliente HTTP simples pro backend .NET (SistemaRH.Backend). Usa fetch puro
// (sem axios) e lança um erro com a mensagem amigável que a API devolve em
// `{ mensagem: "..." }` nas respostas de erro (ver ExceptionMiddleware no backend).

import type {
  ApiErrorBody,
  AuthResponseDto,
  CargoDto,
  DepartamentoCreateDto,
  DepartamentoDto,
  ExtratoBancoHorasDto,
  FuncionarioCreateDto,
  FuncionarioDto,
  FuncionarioUpdateDto,
  UsuarioDto,
} from '../types/api';

// Em dev local isso seria http://localhost:5080, mas o backend está exposto
// via túnel (Cloudflare) pra o site também poder ser acessado de fora desta
// máquina — ambos precisam apontar pro mesmo endereço público.
const BASE_URL = 'https://knee-skill-pretty-pop.trycloudflare.com';

export class ApiError extends Error {
  status: number;
  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {}
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const mensagem = (data as ApiErrorBody | undefined)?.mensagem ?? 'Ocorreu um erro inesperado.';
    throw new ApiError(response.status, mensagem);
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
};

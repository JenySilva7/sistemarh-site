// Tipos espelhando exatamente os DTOs do backend (SistemaRH.Backend/SistemaRH.Api/Dtos).
// Nomes de campo em português, batendo com o JSON real devolvido pela API.

export interface UsuarioDto {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  saldoBancoHorasMinutos: number;
  totalSolicitacoesAusencia: number;
}

export interface AuthResponseDto {
  token: string;
  usuario: UsuarioDto;
}

export type PerfilUsuario = 'Funcionario' | 'Rh' | 'Admin';

// StatusFuncionario é serializado como número pelo backend (enum sem
// JsonStringEnumConverter): 0 = Ativo, 1 = Desligado.
export enum StatusFuncionario {
  Ativo = 0,
  Desligado = 1,
}

export interface FuncionarioDto {
  id: number;
  nome: string;
  cpf: string;
  email: string | null;
  telefone: string | null;
  dataNascimento: string | null;
  dataAdmissao: string;
  dataDesligamento: string | null;
  status: StatusFuncionario;
  departamentoId: number;
  departamentoNome: string;
  cargoId: number;
  cargoNome: string;
  gerenteId: number | null;
  gerenteNome: string | null;
  totalSolicitacoesAusencia: number;
}

export interface DepartamentoDto {
  id: number;
  nome: string;
  descricao: string;
}

export interface DepartamentoCreateDto {
  nome: string;
  descricao?: string;
}

export interface CargoDto {
  id: number;
  nome: string;
  salarioBase: number;
  descricao: string;
}

export interface FuncionarioCreateDto {
  nome: string;
  cpf: string;
  email?: string;
  telefone?: string;
  dataNascimento?: string;
  dataAdmissao: string;
  departamentoId: number;
  cargoId: number;
  gerenteId?: number | null;
}

// Igual ao Create, mas sem CPF (imutável depois de cadastrado) nem data de
// admissão (também não muda numa edição comum).
export interface FuncionarioUpdateDto {
  nome: string;
  email?: string;
  telefone?: string;
  dataNascimento?: string;
  departamentoId: number;
  cargoId: number;
  gerenteId?: number | null;
}

// TipoLancamentoBancoHoras também é serializado como número: 0 = Credito, 1 = Debito.
export enum TipoLancamentoBancoHoras {
  Credito = 0,
  Debito = 1,
}

export interface LancamentoBancoHorasDto {
  id: number;
  dataRegistro: string;
  tipo: TipoLancamentoBancoHoras;
  quantidadeMinutos: number;
  descricao: string;
  criadoEm: string;
}

export interface ExtratoBancoHorasDto {
  saldoMinutos: number;
  lancamentos: LancamentoBancoHorasDto[];
}

export interface ApiErrorBody {
  mensagem: string;
}

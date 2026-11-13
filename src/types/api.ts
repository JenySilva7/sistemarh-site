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
  // null quando a conta não está vinculada a um cadastro de funcionário.
  funcionarioId: number | null;
  dataAdmissao: string | null;
  gerenteNome: string | null;
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
  possuiAcessoApp: boolean;
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
  // Se informada (mín. 6 caracteres), já cria o login do colaborador no app
  // com o e-mail acima — que passa a ser obrigatório.
  senhaAcessoApp?: string;
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

// Justificativas de ausência enviadas pelo app (enums também como número).
export enum StatusAusencia {
  Enviada = 0,
  EmAnalise = 1,
  Aprovada = 2,
  Recusada = 3,
}

export enum TipoAusencia {
  AtestadoMedico = 0,
  FaltaJustificada = 1,
  EsquecimentoDePonto = 2,
  Outro = 3,
}

export interface AusenciaRhDto {
  id: number;
  tipo: TipoAusencia;
  // Data de calendário ("2026-11-13T00:00:00") — não é um instante.
  data: string;
  diaInteiro: boolean;
  descricao: string;
  status: StatusAusencia;
  // Instante em UTC (termina com "Z").
  criadoEm: string;
  usuarioId: number;
  usuarioNome: string;
  usuarioEmail: string;
  funcionarioId: number | null;
}

export enum TipoRegistroPonto {
  Entrada = 0,
  SaidaAlmoco = 1,
  VoltaAlmoco = 2,
  Saida = 3,
}

export interface RegistroPontoRhDto {
  id: number;
  tipo: TipoRegistroPonto;
  // Instante em UTC (termina com "Z").
  registradoEm: string;
  usuarioId: number;
  usuarioNome: string;
  usuarioEmail: string;
}

// Candidatos de processos seletivos (RecrutamentoController).
export enum StatusRecrutamento {
  EmProcesso = 0,
  Entrevista = 1,
  Aprovado = 2,
  Rejeitado = 3,
}

export interface RecrutamentoDto {
  id: number;
  nomeCandidato: string;
  email: string | null;
  telefone: string | null;
  vaga: string;
  dataCandidatura: string;
  status: StatusRecrutamento;
  observacoes: string;
}

export interface ApiErrorBody {
  mensagem: string;
}

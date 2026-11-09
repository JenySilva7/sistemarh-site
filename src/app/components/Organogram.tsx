import { Mail, Phone, X, Loader2, UserMinus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import '../styles/hr-system.css';
import { api, ApiError } from '../../services/api';
import { useAuth } from '../context/AuthContext';
import type { FuncionarioDto } from '../../types/api';
import { StatusFuncionario } from '../../types/api';

interface NoOrganograma extends FuncionarioDto {
  subordinados: NoOrganograma[];
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 1).toUpperCase();
  return (partes[0].slice(0, 1) + partes[partes.length - 1].slice(0, 1)).toUpperCase();
}

/** Monta a árvore do organograma a partir da lista plana de funcionários,
 * usando `gerenteId` pra decidir quem fica embaixo de quem. Quem não tem
 * gestor vira raiz (pode haver mais de uma — ex. a cúpula e cadastros de
 * teste sem gestor definido ainda). */
function montarArvore(funcionarios: FuncionarioDto[]): NoOrganograma[] {
  const porId = new Map<number, NoOrganograma>(funcionarios.map((f) => [f.id, { ...f, subordinados: [] }]));
  const raizes: NoOrganograma[] = [];

  for (const no of porId.values()) {
    if (no.gerenteId !== null && porId.has(no.gerenteId)) {
      porId.get(no.gerenteId)!.subordinados.push(no);
    } else {
      raizes.push(no);
    }
  }

  return raizes;
}

function EmployeeCard({
  funcionario,
  cor,
  onDesligado,
}: {
  funcionario: NoOrganograma;
  cor: string;
  onDesligado: () => void;
}) {
  const { token, isRhOuAdmin } = useAuth();
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [desligando, setDesligando] = useState(false);
  const [erroDesligar, setErroDesligar] = useState<string | null>(null);

  async function handleDesligar() {
    if (!token) return;

    const temSubordinados = funcionario.subordinados.length > 0;
    const aviso = temSubordinados
      ? `Desligar ${funcionario.nome}? Os ${funcionario.subordinados.length} colaborador(es) que reportam a ela(e) passam a reportar direto ao gestor dela(e).`
      : `Desligar ${funcionario.nome}? Essa ação não pode ser desfeita pelo site.`;
    if (!window.confirm(aviso)) return;

    setDesligando(true);
    setErroDesligar(null);
    try {
      // Antes de desligar, sobe os subordinados diretos um nível na
      // hierarquia (pro gestor de quem está saindo) — sem isso eles ficariam
      // "perdidos", apontando pra um gestor desligado que some da árvore.
      for (const sub of funcionario.subordinados) {
        await api.atualizarFuncionario(token, sub.id, {
          nome: sub.nome,
          email: sub.email ?? undefined,
          telefone: sub.telefone ?? undefined,
          dataNascimento: sub.dataNascimento ?? undefined,
          departamentoId: sub.departamentoId,
          cargoId: sub.cargoId,
          gerenteId: funcionario.gerenteId,
        });
      }

      await api.desligarFuncionario(token, funcionario.id);
      setMostrarDetalhes(false);
      onDesligado();
    } catch (e) {
      setErroDesligar(e instanceof ApiError ? e.message : 'Não foi possível desligar o colaborador.');
    } finally {
      setDesligando(false);
    }
  }

  return (
    <div className="flex flex-col items-center m-2 sm:m-3">
      <div className="card-funcionario" onClick={() => setMostrarDetalhes(true)}>
        <div className="avatar-funcionario" style={{ backgroundColor: cor }}>
          {iniciais(funcionario.nome)}
        </div>
        <h3 className="m-1 text-sm sm:text-base text-gray-800 font-semibold leading-tight">{funcionario.nome}</h3>
        <p className="m-0 text-xs sm:text-sm text-gray-500">{funcionario.cargoNome}</p>
      </div>

      {mostrarDetalhes && (
        <div className="modal-fundo" onClick={() => setMostrarDetalhes(false)}>
          <div className="modal-conteudo" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5 gap-3">
              <h2 className="m-0 text-xl sm:text-2xl text-gray-800 font-semibold break-words flex-1 min-w-0">
                {funcionario.nome}
              </h2>
              <button className="botao-fechar shrink-0" onClick={() => setMostrarDetalhes(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="text-center mb-5">
              <div
                className="avatar-funcionario"
                style={{ backgroundColor: cor, width: '80px', height: '80px', fontSize: '24px', margin: '0 auto 10px' }}
              >
                {iniciais(funcionario.nome)}
              </div>
              <span className="inline-block bg-gray-200 px-4 py-1 rounded-full text-sm">
                {funcionario.cargoNome}
              </span>
            </div>

            <div>
              <div className="linha-info">
                <span className="flex items-center gap-2 text-gray-500">
                  <Mail size={16} />
                  Email
                </span>
                <span className="text-gray-800 font-medium break-all">{funcionario.email ?? '—'}</span>
              </div>
              <div className="linha-info">
                <span className="flex items-center gap-2 text-gray-500">
                  <Phone size={16} />
                  Telefone
                </span>
                <span className="text-gray-800 font-medium">{funcionario.telefone ?? '—'}</span>
              </div>
              <div className="linha-info">
                <span className="text-gray-500">Departamento</span>
                <span className="text-gray-800 font-medium">{funcionario.departamentoNome}</span>
              </div>
            </div>

            {isRhOuAdmin && (
              <div className="mt-5 pt-4 border-t border-gray-200">
                {erroDesligar && <p className="text-red-600 text-sm mb-3">{erroDesligar}</p>}
                <button
                  onClick={handleDesligar}
                  disabled={desligando}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                >
                  {desligando ? <Loader2 size={16} className="animate-spin" /> : <UserMinus size={16} />}
                  Desligar colaborador
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {funcionario.subordinados.length > 0 && (
        <div className="mt-6 sm:mt-8 w-full">
          <div className="w-0.5 h-6 sm:h-8 bg-gray-300 mx-auto" />
          <div className="flex flex-wrap gap-3 sm:gap-6 justify-start">
            {funcionario.subordinados.map((sub) => (
              <EmployeeCard key={sub.id} funcionario={sub} cor="#10b981" onDesligado={onDesligado} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Organogram() {
  const { token } = useAuth();
  const [funcionarios, setFuncionarios] = useState<FuncionarioDto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    if (!token) return;
    setCarregando(true);
    setErro(null);
    try {
      const lista = await api.listarFuncionarios(token);
      setFuncionarios(lista.filter((f) => f.status === StatusFuncionario.Ativo));
    } catch (e) {
      setErro(
        e instanceof ApiError && e.status === 403
          ? 'Só RH/Admin pode ver o organograma completo.'
          : 'Não foi possível carregar o organograma.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const raizes = useMemo(() => montarArvore(funcionarios), [funcionarios]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="m-0 text-2xl sm:text-3xl lg:text-[32px] text-gray-800 font-semibold">Organograma</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500">Estrutura organizacional da empresa</p>
      </div>

      {carregando && (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Carregando organograma…
        </div>
      )}

      {erro && !carregando && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{erro}</div>
      )}

      {!carregando && !erro && raizes.length === 0 && (
        <p className="text-muted-foreground">Nenhum funcionário cadastrado ainda.</p>
      )}

      {!carregando && !erro && raizes.length > 0 && (
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 overflow-x-auto pb-8">
          <div className="flex flex-col items-start gap-10">
            {raizes.map((raiz) => (
              <div key={raiz.id} className="flex justify-center min-w-max">
                <EmployeeCard funcionario={raiz} cor="#3b82f6" onDesligado={carregar} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

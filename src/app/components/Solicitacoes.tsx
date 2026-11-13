import { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Loader2, RefreshCw, Check, X, Hourglass } from 'lucide-react';
import '../styles/hr-system.css';
import { api, ApiError } from '../../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusAusencia, TipoAusencia, type AusenciaRhDto } from '../../types/api';
import { formatarDataCalendario, formatarDataHoraBrasilia, instanteEmMs } from '../../utils/datas';

type Filtro = 'pendentes' | 'aprovadas' | 'recusadas' | 'todas';

const FILTROS: { id: Filtro; label: string; vazio: string; inclui: (status: StatusAusencia) => boolean }[] = [
  {
    id: 'pendentes',
    label: 'Pendentes',
    vazio: 'Nenhuma justificativa pendente. Tudo em dia!',
    inclui: (s) => s === StatusAusencia.Enviada || s === StatusAusencia.EmAnalise,
  },
  {
    id: 'aprovadas',
    label: 'Aprovadas',
    vazio: 'Nenhuma justificativa aprovada ainda.',
    inclui: (s) => s === StatusAusencia.Aprovada,
  },
  {
    id: 'recusadas',
    label: 'Recusadas',
    vazio: 'Nenhuma justificativa recusada.',
    inclui: (s) => s === StatusAusencia.Recusada,
  },
  {
    id: 'todas',
    label: 'Todas',
    vazio: 'Nenhuma justificativa foi enviada pelo app ainda.',
    inclui: () => true,
  },
];

const ROTULO_TIPO: Record<TipoAusencia, string> = {
  [TipoAusencia.AtestadoMedico]: 'Atestado médico',
  [TipoAusencia.FaltaJustificada]: 'Falta justificada',
  [TipoAusencia.EsquecimentoDePonto]: 'Esquecimento de ponto',
  [TipoAusencia.Outro]: 'Outro',
};

const VISUAL_STATUS: Record<StatusAusencia, { label: string; classes: string; aviso: string }> = {
  [StatusAusencia.Enviada]: { label: 'Enviada', classes: 'bg-blue-100 text-blue-700', aviso: 'voltou para enviada' },
  [StatusAusencia.EmAnalise]: { label: 'Em análise', classes: 'bg-amber-100 text-amber-700', aviso: 'está em análise' },
  [StatusAusencia.Aprovada]: { label: 'Aprovada', classes: 'bg-green-100 text-green-700', aviso: 'foi aprovada' },
  [StatusAusencia.Recusada]: { label: 'Recusada', classes: 'bg-red-100 text-red-700', aviso: 'foi recusada' },
};

function estaConcluida(status: StatusAusencia): boolean {
  return status === StatusAusencia.Aprovada || status === StatusAusencia.Recusada;
}

export function Solicitacoes() {
  const { token } = useAuth();
  const [ausencias, setAusencias] = useState<AusenciaRhDto[]>([]);
  const [filtro, setFiltro] = useState<Filtro>('pendentes');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [emAndamento, setEmAndamento] = useState<{ id: number; status: StatusAusencia } | null>(null);
  const [erroPorId, setErroPorId] = useState<Record<number, string>>({});

  async function carregar() {
    if (!token) return;
    setCarregando(true);
    setErro(null);
    try {
      const lista = await api.listarAusenciasRh(token);
      setAusencias(lista);
      setErroPorId({});
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível carregar as justificativas.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Mais recentes primeiro.
  const ordenadas = useMemo(
    () => [...ausencias].sort((a, b) => instanteEmMs(b.criadoEm) - instanteEmMs(a.criadoEm)),
    [ausencias]
  );

  const filtroAtual = FILTROS.find((f) => f.id === filtro) ?? FILTROS[0];
  const visiveis = ordenadas.filter((a) => filtroAtual.inclui(a.status));

  async function alterarStatus(ausencia: AusenciaRhDto, novoStatus: StatusAusencia) {
    if (!token) return;

    if (estaConcluida(novoStatus)) {
      const acao = novoStatus === StatusAusencia.Aprovada ? 'Aprovar' : 'Recusar';
      const data = formatarDataCalendario(ausencia.data) ?? '';
      const confirmou = window.confirm(
        `${acao} a justificativa de ${ausencia.usuarioNome} (${data})? Depois de concluída ela não pode mais ser alterada.`
      );
      if (!confirmou) return;
    }

    setEmAndamento({ id: ausencia.id, status: novoStatus });
    setAviso(null);
    setErroPorId((prev) => {
      const copia = { ...prev };
      delete copia[ausencia.id];
      return copia;
    });

    try {
      const atualizada = await api.atualizarStatusAusencia(token, ausencia.id, novoStatus);
      setAusencias((prev) =>
        prev.map((a) => {
          if (a.id !== ausencia.id) return a;
          // Se o backend não devolver o item atualizado, aplica só o novo status.
          return atualizada?.id === a.id ? atualizada : { ...a, status: novoStatus };
        })
      );
      setAviso(`A justificativa de ${ausencia.usuarioNome} ${VISUAL_STATUS[novoStatus].aviso}.`);
    } catch (e) {
      const mensagem = e instanceof ApiError ? e.message : 'Não foi possível atualizar a justificativa.';
      setErroPorId((prev) => ({ ...prev, [ausencia.id]: mensagem }));
    } finally {
      setEmAndamento(null);
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="m-0 text-2xl sm:text-3xl lg:text-[32px] text-gray-800 font-semibold">Justificativas</h1>
          </div>
          <p className="mt-2 text-sm sm:text-base text-gray-500">
            Ausências e justificativas enviadas pelos colaboradores pelo app
          </p>
        </div>
        <button
          onClick={carregar}
          disabled={carregando}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 w-full sm:w-auto shrink-0"
        >
          <RefreshCw size={16} className={carregando ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* Abas de filtro */}
      <div className="mb-5 border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {FILTROS.map((f) => {
            const ativo = filtro === f.id;
            const quantidade = ausencias.filter((a) => f.inclui(a.status)).length;
            return (
              <button
                key={f.id}
                onClick={() => setFiltro(f.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-3 border-b-2 transition-colors whitespace-nowrap text-sm ${
                  ativo ? 'border-primary text-primary font-medium' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {f.label}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${ativo ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}
                >
                  {quantidade}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {erro && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{erro}</div>
      )}
      {aviso && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">{aviso}</div>
      )}

      {carregando && ausencias.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Carregando justificativas…
        </div>
      ) : (
        !erro &&
        visiveis.length === 0 && (
          <div className="card-simples text-center !py-10">
            <ClipboardCheck className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="m-0 text-sm text-gray-500">{filtroAtual.vazio}</p>
          </div>
        )
      )}

      <div className="grid gap-4">
        {visiveis.map((a) => {
          const visual = VISUAL_STATUS[a.status] ?? { label: String(a.status), classes: 'bg-gray-100 text-gray-700' };
          const concluida = estaConcluida(a.status);
          const ocupada = emAndamento?.id === a.id;

          return (
            <div key={a.id} className="card-simples !mb-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                <div className="min-w-0">
                  <p className="m-0 font-semibold text-gray-800 break-words">{a.usuarioNome}</p>
                  <p className="m-0 text-sm text-gray-500 break-all">{a.usuarioEmail}</p>
                </div>
                <span
                  className={`self-start shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${visual.classes}`}
                >
                  {visual.label}
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 text-sm">
                <div>
                  <p className="m-0 text-gray-500">Tipo</p>
                  <p className="m-0 text-gray-800 font-medium">{ROTULO_TIPO[a.tipo] ?? 'Outro'}</p>
                </div>
                <div>
                  <p className="m-0 text-gray-500">Data</p>
                  <p className="m-0 text-gray-800 font-medium">{formatarDataCalendario(a.data) ?? '—'}</p>
                </div>
                <div>
                  <p className="m-0 text-gray-500">Período</p>
                  <p className="m-0 text-gray-800 font-medium">{a.diaInteiro ? 'Dia inteiro' : 'Parte do dia'}</p>
                </div>
                <div>
                  <p className="m-0 text-gray-500">Enviada em</p>
                  <p className="m-0 text-gray-800 font-medium">{formatarDataHoraBrasilia(a.criadoEm)}</p>
                </div>
              </div>

              {a.descricao?.trim() && (
                <p className="m-0 mb-4 p-3 rounded-md bg-gray-50 text-sm text-gray-700 whitespace-pre-line break-words">
                  {a.descricao}
                </p>
              )}

              {erroPorId[a.id] && <p className="m-0 mb-3 text-sm text-red-600">{erroPorId[a.id]}</p>}

              {!concluida && (
                <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4 border-t border-gray-200">
                  {a.status === StatusAusencia.Enviada && (
                    <button
                      onClick={() => alterarStatus(a, StatusAusencia.EmAnalise)}
                      disabled={ocupada}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-60"
                    >
                      {ocupada && emAndamento?.status === StatusAusencia.EmAnalise ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Hourglass size={16} />
                      )}
                      Em análise
                    </button>
                  )}
                  <button
                    onClick={() => alterarStatus(a, StatusAusencia.Recusada)}
                    disabled={ocupada}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                  >
                    {ocupada && emAndamento?.status === StatusAusencia.Recusada ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <X size={16} />
                    )}
                    Recusar
                  </button>
                  <button
                    onClick={() => alterarStatus(a, StatusAusencia.Aprovada)}
                    disabled={ocupada}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60"
                  >
                    {ocupada && emAndamento?.status === StatusAusencia.Aprovada ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    Aprovar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

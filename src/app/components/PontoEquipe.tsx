import { useEffect, useMemo, useState } from 'react';
import { Clock, Loader2, RefreshCw } from 'lucide-react';
import '../styles/hr-system.css';
import { api, ApiError } from '../../services/api';
import { useAuth } from '../context/AuthContext';
import { TipoRegistroPonto, type RegistroPontoRhDto } from '../../types/api';
import { formatarDataCalendario, formatarHoraBrasilia, hojeEmBrasilia, instanteEmMs } from '../../utils/datas';

interface LinhaPonto {
  usuarioId: number;
  nome: string;
  email: string;
  // Instantes em UTC, como vieram da API.
  entrada: string | null;
  saidaAlmoco: string | null;
  voltaAlmoco: string | null;
  saida: string | null;
}

function agruparPorColaborador(registros: RegistroPontoRhDto[]): LinhaPonto[] {
  const ordenados = [...registros].sort((a, b) => instanteEmMs(a.registradoEm) - instanteEmMs(b.registradoEm));
  const porUsuario = new Map<number, LinhaPonto>();

  for (const r of ordenados) {
    let linha = porUsuario.get(r.usuarioId);
    if (!linha) {
      linha = {
        usuarioId: r.usuarioId,
        nome: r.usuarioNome,
        email: r.usuarioEmail,
        entrada: null,
        saidaAlmoco: null,
        voltaAlmoco: null,
        saida: null,
      };
      porUsuario.set(r.usuarioId, linha);
    }

    // Se houver batida repetida, vale a primeira de cada tipo — menos a
    // saída, em que vale a última.
    if (r.tipo === TipoRegistroPonto.Entrada && !linha.entrada) linha.entrada = r.registradoEm;
    if (r.tipo === TipoRegistroPonto.SaidaAlmoco && !linha.saidaAlmoco) linha.saidaAlmoco = r.registradoEm;
    if (r.tipo === TipoRegistroPonto.VoltaAlmoco && !linha.voltaAlmoco) linha.voltaAlmoco = r.registradoEm;
    if (r.tipo === TipoRegistroPonto.Saida) linha.saida = r.registradoEm;
  }

  return [...porUsuario.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

// Trabalha em minutos inteiros pra bater com os horários HH:mm mostrados.
function minutoDo(instante: string): number {
  return Math.floor(instanteEmMs(instante) / 60000);
}

/** Entrada→saída menos o almoço (quando as duas batidas do almoço existem). */
function minutosTrabalhados(linha: LinhaPonto): number | null {
  if (!linha.entrada || !linha.saida) return null;
  let total = minutoDo(linha.saida) - minutoDo(linha.entrada);
  if (total <= 0) return null;

  if (linha.saidaAlmoco && linha.voltaAlmoco) {
    const almoco = minutoDo(linha.voltaAlmoco) - minutoDo(linha.saidaAlmoco);
    if (almoco > 0 && almoco < total) total -= almoco;
  }
  return total;
}

function formatarDuracao(minutos: number | null): string {
  if (minutos === null) return '—';
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return `${horas}h${resto.toString().padStart(2, '0')}`;
}

function hora(instante: string | null): string {
  return instante ? formatarHoraBrasilia(instante) : '—';
}

const COLUNAS: { chave: 'entrada' | 'saidaAlmoco' | 'voltaAlmoco' | 'saida'; label: string }[] = [
  { chave: 'entrada', label: 'Entrada' },
  { chave: 'saidaAlmoco', label: 'Saída almoço' },
  { chave: 'voltaAlmoco', label: 'Volta almoço' },
  { chave: 'saida', label: 'Saída' },
];

export function PontoEquipe() {
  const { token } = useAuth();
  const hoje = hojeEmBrasilia();
  const [data, setData] = useState(hoje);
  const [registros, setRegistros] = useState<RegistroPontoRhDto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    if (!token) return;
    if (!data) {
      setRegistros([]);
      setCarregando(false);
      return;
    }

    // Evita que a resposta de uma data anterior sobrescreva a da data atual.
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    api
      .listarPontoRh(token, data)
      .then((lista) => {
        if (!cancelado) setRegistros(lista);
      })
      .catch((e) => {
        if (cancelado) return;
        setRegistros([]);
        setErro(e instanceof ApiError ? e.message : 'Não foi possível carregar o ponto da equipe.');
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [token, data, versao]);

  const linhas = useMemo(() => agruparPorColaborador(registros), [registros]);
  const dataFormatada = formatarDataCalendario(data) ?? '';

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <h1 className="m-0 text-2xl sm:text-3xl lg:text-[32px] text-gray-800 font-semibold">Ponto da equipe</h1>
        </div>
        <p className="mt-2 text-sm sm:text-base text-gray-500">
          Batidas de ponto registradas pelos colaboradores no app (horário de Brasília)
        </p>
      </div>

      <div className="card-simples flex flex-col sm:flex-row sm:items-end gap-3">
        <div>
          <label htmlFor="dataPonto" className="block text-sm text-gray-600 mb-1.5">
            Data
          </label>
          <input
            type="date"
            id="dataPonto"
            value={data}
            max={hoje}
            onChange={(e) => setData(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          {data !== hoje && (
            <button
              onClick={() => setData(hoje)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hoje
            </button>
          )}
          <button
            onClick={() => setVersao((v) => v + 1)}
            disabled={carregando || !data}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            <RefreshCw size={16} className={carregando ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
        {!carregando && !erro && data && (
          <p className="m-0 sm:ml-auto text-sm text-gray-500">
            {linhas.length} colaborador{linhas.length === 1 ? '' : 'es'} com ponto em {dataFormatada}
          </p>
        )}
      </div>

      {erro && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{erro}</div>}

      {!data && <p className="text-sm text-gray-500">Escolha uma data para ver o ponto da equipe.</p>}

      {carregando && data && (
        <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Carregando ponto…
        </div>
      )}

      {!carregando && !erro && data && linhas.length === 0 && (
        <div className="card-simples text-center !py-10">
          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="m-0 text-sm text-gray-500">Nenhuma batida de ponto registrada em {dataFormatada}.</p>
        </div>
      )}

      {!carregando && !erro && linhas.length > 0 && (
        <>
          {/* Tabela (telas médias pra cima) */}
          <div className="hidden md:block card-simples !p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Colaborador</th>
                  {COLUNAS.map((c) => (
                    <th key={c.chave} className="px-4 py-3 font-medium whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Total trabalhado</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.usuarioId} className="border-t border-gray-200">
                    <td className="px-4 py-3">
                      <p className="m-0 font-medium text-gray-800">{l.nome}</p>
                      <p className="m-0 text-xs text-gray-500 break-all">{l.email}</p>
                    </td>
                    {COLUNAS.map((c) => (
                      <td key={c.chave} className="px-4 py-3 text-gray-800 tabular-nums">
                        {hora(l[c.chave])}
                      </td>
                    ))}
                    <td className="px-4 py-3 font-semibold text-gray-800 tabular-nums">
                      {formatarDuracao(minutosTrabalhados(l))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cartões (celular) */}
          <div className="md:hidden grid gap-3">
            {linhas.map((l) => (
              <div key={l.usuarioId} className="card-simples !mb-0">
                <p className="m-0 font-semibold text-gray-800 break-words">{l.nome}</p>
                <p className="m-0 mb-3 text-sm text-gray-500 break-all">{l.email}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {COLUNAS.map((c) => (
                    <div key={c.chave}>
                      <p className="m-0 text-gray-500">{c.label}</p>
                      <p className="m-0 text-gray-800 font-medium tabular-nums">{hora(l[c.chave])}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center text-sm">
                  <span className="text-gray-500">Total trabalhado</span>
                  <span className="font-semibold text-gray-800 tabular-nums">{formatarDuracao(minutosTrabalhados(l))}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Users, Briefcase, ClipboardCheck, Clock, Loader2, type LucideIcon } from 'lucide-react';
import '../styles/hr-system.css';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../../services/api';
import {
  StatusAusencia,
  StatusFuncionario,
  StatusRecrutamento,
  type DepartamentoDto,
  type FuncionarioDto,
} from '../../types/api';
import { hojeEmBrasilia } from '../../utils/datas';

interface Indicadores {
  candidatosEmProcesso: number | null;
  justificativasPendentes: number | null;
  pontoHoje: number | null;
}

const INDICADORES_VAZIOS: Indicadores = { candidatosEmProcesso: null, justificativasPendentes: null, pontoHoje: null };

function contar<T>(resultado: PromiseSettledResult<T[] | null>, contagem: (lista: T[]) => number): number | null {
  return resultado.status === 'fulfilled' && resultado.value ? contagem(resultado.value) : null;
}

function CardIndicador({
  icone: Icone,
  cor,
  titulo,
  valor,
  detalhe,
  carregando,
}: {
  icone: LucideIcon;
  cor?: string;
  titulo: string;
  valor: number | null;
  detalhe?: string;
  carregando: boolean;
}) {
  return (
    <div className="card-simples !mb-0">
      <div className="flex justify-between items-center mb-4">
        <div className="icone-card" style={cor ? { backgroundColor: cor } : undefined}>
          <Icone size={24} />
        </div>
      </div>
      <h3 className="m-0 text-gray-500 text-sm">{titulo}</h3>
      <p className="mt-1 mb-0 text-3xl sm:text-4xl font-bold text-gray-800">
        {carregando ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> : (valor ?? '—')}
      </p>
      {detalhe && <p className="m-0 mt-1 text-xs text-gray-400">{detalhe}</p>}
    </div>
  );
}

export function Dashboard() {
  const { token, isRhOuAdmin } = useAuth();
  const [funcionarios, setFuncionarios] = useState<FuncionarioDto[] | null>(null);
  const [departamentos, setDepartamentos] = useState<DepartamentoDto[]>([]);
  const [indicadores, setIndicadores] = useState<Indicadores>(INDICADORES_VAZIOS);
  const [semPermissao, setSemPermissao] = useState(false);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!token) return;
    const t = token;
    let cancelado = false;

    // As rotas de RH nem são chamadas pra quem não é RH/Admin (dariam 403).
    function soRh<T>(chamada: () => Promise<T>): Promise<T | null> {
      return isRhOuAdmin ? chamada() : Promise.resolve(null);
    }

    async function carregar() {
      setCarregando(true);
      setErroCarga(null);

      const [resDeps, resFunc, resRecrutamento, resAusencias, resPonto] = await Promise.allSettled([
        api.listarDepartamentos(t),
        api.listarFuncionarios(t),
        soRh(() => api.listarRecrutamentos(t)),
        soRh(() => api.listarAusenciasRh(t)),
        soRh(() => api.listarPontoRh(t, hojeEmBrasilia())),
      ]);
      if (cancelado) return;

      if (resDeps.status === 'fulfilled') setDepartamentos(resDeps.value);
      if (resFunc.status === 'fulfilled') {
        setFuncionarios(resFunc.value);
      } else if (resFunc.reason instanceof ApiError && resFunc.reason.status === 403) {
        // Rota administrativa — usuário comum (perfil Funcionario) não tem acesso.
        setSemPermissao(true);
      }

      setIndicadores({
        // Os registros de recrutamento são candidatos; "em processo" = ainda
        // sem decisão (em processo ou em entrevista).
        candidatosEmProcesso: contar(resRecrutamento, (lista) =>
          lista.filter((r) => r.status === StatusRecrutamento.EmProcesso || r.status === StatusRecrutamento.Entrevista).length
        ),
        justificativasPendentes: contar(resAusencias, (lista) =>
          lista.filter((a) => a.status === StatusAusencia.Enviada || a.status === StatusAusencia.EmAnalise).length
        ),
        pontoHoje: contar(resPonto, (lista) => new Set(lista.map((r) => r.usuarioId)).size),
      });

      const falhas = [resDeps, resFunc, resRecrutamento, resAusencias, resPonto]
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map((r) => r.reason)
        .filter((motivo) => !(motivo instanceof ApiError && motivo.status === 403));
      if (falhas.length > 0) {
        setErroCarga(falhas[0] instanceof ApiError ? falhas[0].message : 'Ocorreu um erro inesperado.');
      }

      setCarregando(false);
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [token, isRhOuAdmin]);

  const totalAtivos = funcionarios?.filter((f) => f.status === StatusFuncionario.Ativo).length ?? null;

  const porDepartamento = departamentos.map((dep) => ({
    nome: dep.nome,
    quantidade: funcionarios?.filter((f) => f.departamentoId === dep.id && f.status === StatusFuncionario.Ativo).length ?? 0,
  }));

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="m-0 text-2xl sm:text-3xl lg:text-[32px] text-gray-800 font-semibold">Dashboard de RH</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500">Visão geral dos recursos humanos da empresa</p>
      </div>

      {semPermissao && (
        <div className="card-simples !mb-6 border-amber-300 bg-amber-50">
          <p className="text-sm text-amber-700 m-0">
            Sua conta não tem perfil de RH/Admin — os indicadores abaixo não estão disponíveis pra você.
          </p>
        </div>
      )}

      {erroCarga && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          Alguns indicadores não puderam ser carregados. {erroCarga}
        </div>
      )}

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <CardIndicador
          icone={Users}
          titulo="Total de Funcionários Ativos"
          valor={semPermissao ? null : totalAtivos}
          carregando={carregando}
        />
        <CardIndicador
          icone={Briefcase}
          cor="#10b981"
          titulo="Candidatos em processo"
          valor={indicadores.candidatosEmProcesso}
          detalhe="Em processo seletivo ou entrevista"
          carregando={carregando}
        />
        <CardIndicador
          icone={ClipboardCheck}
          cor="#8b5cf6"
          titulo="Justificativas pendentes"
          valor={indicadores.justificativasPendentes}
          detalhe="Enviadas pelo app ou em análise"
          carregando={carregando}
        />
        <CardIndicador
          icone={Clock}
          cor="#f59e0b"
          titulo="Ponto registrado hoje"
          valor={indicadores.pontoHoje}
          detalhe="Colaboradores com ao menos uma batida"
          carregando={carregando}
        />
      </div>

      {/* Informações Adicionais */}
      <div className="card-simples">
        <h2 className="m-0 mb-5 text-lg sm:text-xl text-gray-800 pb-3 border-b-2 border-gray-200">
          Resumo dos Departamentos
        </h2>

        {semPermissao ? (
          <p className="text-sm text-gray-500">Disponível só pra contas com perfil de RH/Admin.</p>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {porDepartamento.map((dep) => (
              <div key={dep.nome} className="flex flex-wrap justify-between items-center gap-2 p-3 bg-gray-100 rounded-md">
                <span className="font-medium">{dep.nome}</span>
                <span className="text-blue-500 font-bold">{dep.quantidade} colaborador{dep.quantidade === 1 ? '' : 'es'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

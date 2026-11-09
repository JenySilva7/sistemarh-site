import { useEffect, useState } from 'react';
import { Users, Briefcase, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import '../styles/hr-system.css';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../../services/api';
import { StatusFuncionario, type DepartamentoDto, type FuncionarioDto } from '../../types/api';

export function Dashboard() {
  const { token } = useAuth();
  const [funcionarios, setFuncionarios] = useState<FuncionarioDto[] | null>(null);
  const [departamentos, setDepartamentos] = useState<DepartamentoDto[]>([]);
  const [semPermissao, setSemPermissao] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!token) return;

    let cancelado = false;

    async function carregar() {
      setCarregando(true);
      try {
        const deps = await api.listarDepartamentos(token!);
        if (cancelado) return;
        setDepartamentos(deps);
      } catch {
        // departamentos é aberto a qualquer usuário autenticado — se falhar
        // mesmo assim, só deixa a lista vazia.
      }

      try {
        const func = await api.listarFuncionarios(token!);
        if (cancelado) return;
        setFuncionarios(func);
      } catch (erro) {
        if (erro instanceof ApiError && erro.status === 403) {
          // Rota administrativa — usuário comum (perfil Funcionario) não tem acesso.
          setSemPermissao(true);
        }
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [token]);

  const totalAtivos = funcionarios?.filter((f) => f.status === StatusFuncionario.Ativo).length ?? 0;

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
            Sua conta não tem perfil de RH/Admin — os números de funcionários abaixo não estão disponíveis pra você.
          </p>
        </div>
      )}

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">

        {/* Card 1 - Total de Funcionários (real) */}
        <div className="card-simples !mb-0">
          <div className="flex justify-between items-center mb-4">
            <div className="icone-card">
              <Users size={24} />
            </div>
          </div>
          <h3 className="m-0 text-gray-500 text-sm">Total de Funcionários Ativos</h3>
          <p className="mt-1 text-3xl sm:text-4xl font-bold text-gray-800">
            {carregando ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> : semPermissao ? '—' : totalAtivos}
          </p>
        </div>

        {/* Card 2 - Vagas Abertas (ainda não tem fonte real no backend) */}
        <div className="card-simples !mb-0">
          <div className="flex justify-between items-center mb-4">
            <div className="icone-card" style={{ backgroundColor: '#10b981' }}>
              <Briefcase size={24} />
            </div>
          </div>
          <h3 className="m-0 text-gray-500 text-sm">Vagas Abertas</h3>
          <p className="mt-1 text-3xl sm:text-4xl font-bold text-gray-800">18</p>
        </div>

        {/* Card 3 - Satisfação (ainda não tem fonte real no backend) */}
        <div className="card-simples !mb-0">
          <div className="flex justify-between items-center mb-4">
            <div className="icone-card" style={{ backgroundColor: '#8b5cf6' }}>
              <TrendingUp size={24} />
            </div>
          </div>
          <h3 className="m-0 text-gray-500 text-sm">Satisfação</h3>
          <p className="mt-1 text-3xl sm:text-4xl font-bold text-gray-800">90%</p>
        </div>

        {/* Card 4 - Férias Pendentes (ainda não tem fonte real no backend) */}
        <div className="card-simples !mb-0">
          <div className="flex justify-between items-center mb-4">
            <div className="icone-card" style={{ backgroundColor: '#f59e0b' }}>
              <Calendar size={24} />
            </div>
          </div>
          <h3 className="m-0 text-gray-500 text-sm">Férias Pendentes</h3>
          <p className="mt-1 text-3xl sm:text-4xl font-bold text-gray-800">24</p>
        </div>
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

import { useEffect, useState } from 'react';
import { UserPlus, Save, X, Loader2, Plus } from 'lucide-react';
import { api, ApiError } from '../../services/api';
import { useAuth } from '../context/AuthContext';
import type { CargoDto, DepartamentoDto, FuncionarioDto } from '../../types/api';
import { StatusFuncionario } from '../../types/api';
import { formatarCpf } from '../../utils/cpf';

const CRIAR_NOVO = '__criar_novo__';

const FORM_INICIAL = {
  nome: '',
  email: '',
  cpf: '',
  telefone: '',
  dataNascimento: '',
  dataAdmissao: '',
  departamentoId: '',
  cargoId: '',
  gerenteId: '',
};

export function NewEmployee() {
  const { token } = useAuth();
  const [formData, setFormData] = useState(FORM_INICIAL);

  const [departamentos, setDepartamentos] = useState<DepartamentoDto[]>([]);
  const [cargos, setCargos] = useState<CargoDto[]>([]);
  const [funcionarios, setFuncionarios] = useState<FuncionarioDto[]>([]);
  const [carregandoListas, setCarregandoListas] = useState(true);

  const [criandoDepartamento, setCriandoDepartamento] = useState(false);
  const [novoDepartamentoNome, setNovoDepartamentoNome] = useState('');
  const [salvandoDepartamento, setSalvandoDepartamento] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    carregarListas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function carregarListas() {
    if (!token) return;
    setCarregandoListas(true);
    try {
      const [deps, cgs, funcs] = await Promise.all([
        api.listarDepartamentos(token),
        api.listarCargos(token),
        api.listarFuncionarios(token),
      ]);
      setDepartamentos(deps);
      setCargos(cgs);
      // Só funcionários ativos podem ser escolhidos como gestor — alguém
      // desligado não deveria aparecer como chefe de ninguém.
      setFuncionarios(funcs.filter((f) => f.status === StatusFuncionario.Ativo));
    } catch {
      setErro('Não foi possível carregar departamentos/cargos. Verifique se o backend está rodando.');
    } finally {
      setCarregandoListas(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    if (name === 'departamentoId' && value === CRIAR_NOVO) {
      setCriandoDepartamento(true);
      return;
    }

    if (name === 'cpf') {
      setFormData((prev) => ({ ...prev, cpf: formatarCpf(value) }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCriarDepartamento() {
    if (!token || !novoDepartamentoNome.trim()) return;
    setSalvandoDepartamento(true);
    setErro(null);
    try {
      const novo = await api.criarDepartamento(token, { nome: novoDepartamentoNome.trim() });
      setDepartamentos((prev) => [...prev, novo].sort((a, b) => a.nome.localeCompare(b.nome)));
      setFormData((prev) => ({ ...prev, departamentoId: String(novo.id) }));
      setCriandoDepartamento(false);
      setNovoDepartamentoNome('');
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível criar o departamento.');
    } finally {
      setSalvandoDepartamento(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setErro(null);
    setSucesso(null);

    if (!formData.departamentoId || !formData.cargoId) {
      setErro('Selecione o departamento e o cargo.');
      return;
    }

    setEnviando(true);
    try {
      const criado = await api.criarFuncionario(token, {
        nome: formData.nome.trim(),
        cpf: formData.cpf.trim(),
        email: formData.email.trim() || undefined,
        telefone: formData.telefone.trim() || undefined,
        dataNascimento: formData.dataNascimento || undefined,
        dataAdmissao: formData.dataAdmissao,
        departamentoId: Number(formData.departamentoId),
        cargoId: Number(formData.cargoId),
        gerenteId: formData.gerenteId ? Number(formData.gerenteId) : undefined,
      });
      setSucesso(`${criado.nome} foi cadastrado(a) com sucesso em ${criado.departamentoNome} e já aparece no Organograma.`);
      setFormData(FORM_INICIAL);
      setFuncionarios((prev) => [...prev, criado]);
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível cadastrar o colaborador.');
    } finally {
      setEnviando(false);
    }
  }

  function handleReset() {
    setFormData(FORM_INICIAL);
    setErro(null);
    setSucesso(null);
  }

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl">Cadastrar Novo Colaborador</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">Preencha os dados do novo colaborador</p>
      </div>

      <form onSubmit={handleSubmit} className="hr-card p-4 sm:p-6">
        <div className="space-y-6">
          {erro && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{erro}</div>
          )}
          {sucesso && (
            <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {sucesso}
            </div>
          )}

          {/* Informações Pessoais */}
          <div>
            <h2 className="text-xl mb-4 pb-2 border-b border-border">Informações Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nome" className="block text-sm mb-2">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  minLength={2}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Digite o nome completo"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm mb-2">
                  E-mail Corporativo
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="email@empresa.com"
                />
              </div>

              <div>
                <label htmlFor="cpf" className="block text-sm mb-2">
                  CPF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="cpf"
                  name="cpf"
                  inputMode="numeric"
                  value={formData.cpf}
                  onChange={handleChange}
                  required
                  minLength={14}
                  maxLength={14}
                  pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
                  title="Informe os 11 dígitos do CPF"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label htmlFor="dataNascimento" className="block text-sm mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  id="dataNascimento"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="telefone" className="block text-sm mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>

          {/* Informações Profissionais */}
          <div>
            <h2 className="text-xl mb-4 pb-2 border-b border-border">Informações Profissionais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dataAdmissao" className="block text-sm mb-2">
                  Data de Admissão <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dataAdmissao"
                  name="dataAdmissao"
                  value={formData.dataAdmissao}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="cargoId" className="block text-sm mb-2">
                  Cargo <span className="text-red-500">*</span>
                </label>
                <select
                  id="cargoId"
                  name="cargoId"
                  value={formData.cargoId}
                  onChange={handleChange}
                  required
                  disabled={carregandoListas}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                >
                  <option value="">{carregandoListas ? 'Carregando…' : 'Selecione o cargo'}</option>
                  {cargos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="departamentoId" className="block text-sm mb-2">
                  Departamento <span className="text-red-500">*</span>
                </label>

                {!criandoDepartamento ? (
                  <select
                    id="departamentoId"
                    name="departamentoId"
                    value={formData.departamentoId}
                    onChange={handleChange}
                    required
                    disabled={carregandoListas}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  >
                    <option value="">{carregandoListas ? 'Carregando…' : 'Selecione o departamento'}</option>
                    {departamentos.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nome}
                      </option>
                    ))}
                    <option value={CRIAR_NOVO}>+ Criar novo departamento…</option>
                  </select>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={novoDepartamentoNome}
                      onChange={(e) => setNovoDepartamentoNome(e.target.value)}
                      placeholder="Nome do novo departamento"
                      autoFocus
                      className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCriarDepartamento}
                        disabled={salvandoDepartamento || !novoDepartamentoNome.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 whitespace-nowrap"
                      >
                        {salvandoDepartamento ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        <span>Criar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCriandoDepartamento(false);
                          setNovoDepartamentoNome('');
                        }}
                        className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors whitespace-nowrap"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="gerenteId" className="block text-sm mb-2">
                  Gestor direto
                </label>
                <select
                  id="gerenteId"
                  name="gerenteId"
                  value={formData.gerenteId}
                  onChange={handleChange}
                  disabled={carregandoListas}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                >
                  <option value="">Nenhum (topo da hierarquia)</option>
                  {funcionarios.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome} · {f.cargoNome}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Define onde esse colaborador aparece no Organograma.
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={enviando}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity w-full sm:w-auto disabled:opacity-60"
            >
              {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Cadastrar Colaborador</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors w-full sm:w-auto"
            >
              <X className="w-4 h-4" />
              <span>Limpar Formulário</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

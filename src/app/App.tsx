import { useEffect, useRef, useState } from 'react';
import { Menu, Loader2 } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Organogram } from './components/Organogram';
import { EmployeeProfile } from './components/EmployeeProfile';
import { NewEmployee } from './components/NewEmployee';
import { BuscarColaborador } from './components/BuscarColaborador';
import { Permissions } from './components/Permissions';
import { SalaryAdjustment } from './components/SalaryAdjustment';
import { MealVoucherAdjustment } from './components/MealVoucherAdjustment';
import { Promotions } from './components/Promotions';
import { Solicitacoes } from './components/Solicitacoes';
import { Login } from './components/Login';
import { LimiteDeErro } from './components/LimiteDeErro';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AreaAvisos, AvisosProvider } from './context/AvisosContext';
import { NavegacaoProvider, telaBase, tituloDaTela, useNavegacao, type ViewType } from './context/NavegacaoContext';

const TITULO_PADRAO = 'HumanConnect · Gestão de Pessoas';

export default function App() {
  return (
    <LimiteDeErro telaInteira>
      <AuthProvider>
        {/* Avisos por fora da navegação: a troca de tela consulta as
            alterações pendentes (useConfirmarSaida) antes de sair. */}
        <AvisosProvider>
          <NavegacaoProvider>
            <AppGate />
            <AreaAvisos />
          </NavegacaoProvider>
        </AvisosProvider>
      </AuthProvider>
    </LimiteDeErro>
  );
}

// Decide entre a tela de Login e o app de verdade, conforme a sessão.
function AppGate() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen h-dvh bg-gray-100 overflow-hidden">
        <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Carregando…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <AuthenticatedApp />;
}

const VIEWS_RH_OU_ADMIN: ViewType[] = [
  'organogram',
  'buscarColaborador',
  'newEmployee',
  'permissions',
  'salaryAdjustment',
  'mealVoucherAdjustment',
  'promotions',
  'solicitacoes',
  'mensagensRh',
];

function AuthenticatedApp() {
  const { isRhOuAdmin } = useAuth();
  const { tela, navegar } = useNavegacao();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const conteudoRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const botaoMenuRef = useRef<HTMLButtonElement>(null);

  // Mesmo que o link fique escondido no menu pra quem não é RH/Admin, essa
  // segunda trava evita que alguém chegue numa tela administrativa (ex. por
  // um link salvo) sem ter permissão — espelha a policy "RhOuAdmin" que o
  // backend já exige nessas rotas.
  const bloqueada = !isRhOuAdmin && VIEWS_RH_OU_ADMIN.includes(tela);
  const viewEfetiva: ViewType = bloqueada ? 'dashboard' : tela;

  // E o endereço acompanha: um Funcionário que abre #/organograma fica em #/dashboard.
  useEffect(() => {
    if (bloqueada) navegar('dashboard', { substituir: true });
  }, [bloqueada, navegar]);

  useEffect(() => {
    document.title = `${tituloDaTela(viewEfetiva)} · HumanConnect`;
    // A tela nova começa do topo (o <main> é quem rola).
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [viewEfetiva]);

  useEffect(() => {
    return () => {
      document.title = TITULO_PADRAO;
    };
  }, []);

  // Para onde o foco vai quando o menu do celular fecha. Só dá para focar
  // depois que o conteúdo deixa de ser inerte, por isso fica para o efeito.
  const focoAoFecharRef = useRef<'botaoMenu' | 'conteudo' | null>(null);

  // Com o menu aberto no celular, o conteúdo atrás do fundo escuro sai da
  // ordem do Tab e do leitor de tela.
  useEffect(() => {
    const conteudo = conteudoRef.current;
    if (!conteudo) return;
    conteudo.inert = sidebarOpen;
    if (!sidebarOpen && focoAoFecharRef.current) {
      (focoAoFecharRef.current === 'botaoMenu' ? botaoMenuRef.current : mainRef.current)?.focus();
      focoAoFecharRef.current = null;
    }
  }, [sidebarOpen]);

  // Se a janela alargar até o menu ficar fixo ao lado (≥1024px) com ele
  // aberto, fecha — senão o conteúdo continuaria inerte no desktop.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const aoMudar = () => {
      if (desktop.matches) setSidebarOpen(false);
    };
    desktop.addEventListener('change', aoMudar);
    return () => desktop.removeEventListener('change', aoMudar);
  }, []);

  // Esc, X ou clique no fundo escuro: o foco volta para o botão que abriu o menu.
  function fecharMenu() {
    focoAoFecharRef.current = 'botaoMenu';
    setSidebarOpen(false);
  }

  // Escolher uma tela no menu do celular fecha o menu e leva o foco para o
  // conteúdo novo (senão ele ficava num botão escondido dentro do menu).
  function aoNavegarPeloMenu() {
    if (!sidebarOpen) return;
    focoAoFecharRef.current = 'conteudo';
    setSidebarOpen(false);
  }

  // Justificativas e Mensagens são abas da mesma tela: a troca de aba não
  // desmonta a tela (nem os rascunhos). Cada aba tem o próprio limite de
  // erro, dentro de Solicitacoes.
  const chaveTela = telaBase(viewEfetiva);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar activeView={viewEfetiva} onNavigate={aoNavegarPeloMenu} isOpen={sidebarOpen} onClose={fecharMenu} />

      <div ref={conteudoRef} className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar mobile */}
        <header className="lg:hidden flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
          <button
            ref={botaoMenuRef}
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Abrir menu"
            aria-expanded={sidebarOpen}
            aria-controls="menu-lateral"
          >
            <Menu size={24} aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <img src="/logo-humanconnect-icone.png" alt="" className="w-7 h-7 rounded-md shrink-0" />
            <p className="m-0 text-base font-semibold text-gray-800 truncate">HumanConnect</p>
          </div>
          <div className="w-10" />
        </header>

        <main
          ref={mainRef}
          tabIndex={-1}
          aria-label={tituloDaTela(viewEfetiva)}
          className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 focus:outline-none"
        >
          <LimiteDeErro key={chaveTela}>
            {viewEfetiva === 'dashboard' && <Dashboard />}
            {viewEfetiva === 'organogram' && <Organogram />}
            {viewEfetiva === 'profile' && <EmployeeProfile />}
            {viewEfetiva === 'buscarColaborador' && <BuscarColaborador />}
            {viewEfetiva === 'newEmployee' && <NewEmployee />}
            {viewEfetiva === 'permissions' && <Permissions />}
            {viewEfetiva === 'salaryAdjustment' && <SalaryAdjustment />}
            {viewEfetiva === 'mealVoucherAdjustment' && <MealVoucherAdjustment />}
            {viewEfetiva === 'promotions' && <Promotions />}
            {(viewEfetiva === 'solicitacoes' || viewEfetiva === 'mensagensRh') && (
              <Solicitacoes aba={viewEfetiva === 'mensagensRh' ? 'mensagens' : 'justificativas'} />
            )}
          </LimiteDeErro>
        </main>
      </div>
    </div>
  );
}

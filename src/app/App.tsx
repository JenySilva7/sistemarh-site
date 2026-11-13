import { useState } from 'react';
import { Menu, Loader2 } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Organogram } from './components/Organogram';
import { EmployeeProfile } from './components/EmployeeProfile';
import { NewEmployee } from './components/NewEmployee';
import { Permissions } from './components/Permissions';
import { SalaryAdjustment } from './components/SalaryAdjustment';
import { MealVoucherAdjustment } from './components/MealVoucherAdjustment';
import { Promotions } from './components/Promotions';
import { Solicitacoes } from './components/Solicitacoes';
import { PontoEquipe } from './components/PontoEquipe';
import { Login } from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

type ViewType = 'dashboard' | 'organogram' | 'profile' | 'newEmployee' | 'permissions' | 'salaryAdjustment' | 'mealVoucherAdjustment' | 'promotions' | 'solicitacoes' | 'pontoEquipe';

export default function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  );
}

// Decide entre a tela de Login e o app de verdade, conforme a sessão.
function AppGate() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
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
  'newEmployee',
  'permissions',
  'salaryAdjustment',
  'mealVoucherAdjustment',
  'promotions',
  'solicitacoes',
  'pontoEquipe',
];

function AuthenticatedApp() {
  const { isRhOuAdmin } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  // Mesmo que o link fique escondido no menu pra quem não é RH/Admin, essa
  // segunda trava evita que alguém chegue numa tela administrativa (ex. via
  // estado antigo) sem ter permissão — espelha a policy "RhOuAdmin" que o
  // backend já exige nessas rotas.
  const viewEfetiva = !isRhOuAdmin && VIEWS_RH_OU_ADMIN.includes(activeView) ? 'dashboard' : activeView;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar mobile */}
        <header className="lg:hidden flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-base font-semibold text-gray-800 truncate">Sistema RH</h1>
          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {viewEfetiva === 'dashboard' && <Dashboard />}
          {viewEfetiva === 'organogram' && <Organogram />}
          {viewEfetiva === 'profile' && <EmployeeProfile />}
          {viewEfetiva === 'newEmployee' && <NewEmployee />}
          {viewEfetiva === 'permissions' && <Permissions />}
          {viewEfetiva === 'salaryAdjustment' && <SalaryAdjustment />}
          {viewEfetiva === 'mealVoucherAdjustment' && <MealVoucherAdjustment />}
          {viewEfetiva === 'promotions' && <Promotions />}
          {viewEfetiva === 'solicitacoes' && <Solicitacoes />}
          {viewEfetiva === 'pontoEquipe' && <PontoEquipe />}
        </main>
      </div>
    </div>
  );
}

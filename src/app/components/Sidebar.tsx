import { useState } from 'react';
import { LayoutDashboard, Network, User, UserPlus, Shield, Users, DollarSign, Utensils, TrendingUp, X, LogOut, ClipboardCheck, Clock } from 'lucide-react';
import '../styles/hr-system.css';
import { useAuth } from '../context/AuthContext';

type ViewType = 'dashboard' | 'organogram' | 'profile' | 'newEmployee' | 'permissions' | 'salaryAdjustment' | 'mealVoucherAdjustment' | 'promotions' | 'solicitacoes' | 'pontoEquipe';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  isOpen: boolean;
  onClose: () => void;
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 1).toUpperCase();
  return (partes[0].slice(0, 1) + partes[partes.length - 1].slice(0, 1)).toUpperCase();
}

export function Sidebar({ activeView, onViewChange, isOpen, onClose }: SidebarProps) {
  const [menuAberto, setMenuAberto] = useState(true);
  const { usuario, logout, isRhOuAdmin } = useAuth();

  return (
    <>
      {/* Backdrop mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 style={{ margin: 0, fontSize: '22px' }}>Sistema RH</h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.7 }}>Gestão de Pessoas</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 -mt-1 -mr-1 rounded hover:bg-gray-700 transition-colors"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto -mx-1 px-1">
          <button
            onClick={() => onViewChange('dashboard')}
            className={`botao-menu ${activeView === 'dashboard' ? 'ativo' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          {isRhOuAdmin && (
            <button
              onClick={() => onViewChange('organogram')}
              className={`botao-menu ${activeView === 'organogram' ? 'ativo' : ''}`}
            >
              <Network size={20} />
              <span>Organograma</span>
            </button>
          )}

          <button
            onClick={() => onViewChange('profile')}
            className={`botao-menu ${activeView === 'profile' ? 'ativo' : ''}`}
          >
            <User size={20} />
            <span>Meus Dados</span>
          </button>

          {isRhOuAdmin && (
            <>
              <div style={{ marginTop: '15px' }}>
                <button
                  onClick={() => setMenuAberto(!menuAberto)}
                  className="botao-menu"
                >
                  <Users size={20} />
                  <span style={{ flex: 1, textAlign: 'left' }}>Colaboradores</span>
                  <span>{menuAberto ? '▼' : '►'}</span>
                </button>

                {menuAberto && (
                  <div style={{ marginLeft: '15px' }}>
                    <button
                      onClick={() => onViewChange('newEmployee')}
                      className={`botao-menu ${activeView === 'newEmployee' ? 'ativo' : ''}`}
                    >
                      <UserPlus size={18} />
                      <span style={{ fontSize: '14px' }}>Novo Colaborador</span>
                    </button>

                    <button
                      onClick={() => onViewChange('salaryAdjustment')}
                      className={`botao-menu ${activeView === 'salaryAdjustment' ? 'ativo' : ''}`}
                    >
                      <DollarSign size={18} />
                      <span style={{ fontSize: '14px' }}>Ajuste Salarial</span>
                    </button>

                    <button
                      onClick={() => onViewChange('mealVoucherAdjustment')}
                      className={`botao-menu ${activeView === 'mealVoucherAdjustment' ? 'ativo' : ''}`}
                    >
                      <Utensils size={18} />
                      <span style={{ fontSize: '14px' }}>Vale Alimentação</span>
                    </button>

                    <button
                      onClick={() => onViewChange('promotions')}
                      className={`botao-menu ${activeView === 'promotions' ? 'ativo' : ''}`}
                    >
                      <TrendingUp size={18} />
                      <span style={{ fontSize: '14px' }}>Promoções</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => onViewChange('solicitacoes')}
                className={`botao-menu ${activeView === 'solicitacoes' ? 'ativo' : ''}`}
              >
                <ClipboardCheck size={20} />
                <span>Justificativas</span>
              </button>

              <button
                onClick={() => onViewChange('pontoEquipe')}
                className={`botao-menu ${activeView === 'pontoEquipe' ? 'ativo' : ''}`}
              >
                <Clock size={20} />
                <span>Ponto da equipe</span>
              </button>

              <button
                onClick={() => onViewChange('permissions')}
                className={`botao-menu ${activeView === 'permissions' ? 'ativo' : ''}`}
              >
                <Shield size={20} />
                <span>Permissões</span>
              </button>
            </>
          )}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #374151' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {usuario ? iniciais(usuario.nome) : '?'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ margin: 0, fontSize: '14px' }}>{usuario?.nome ?? 'Usuário'}</p>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{usuario?.email ?? ''}</p>
            </div>
            <button
              onClick={logout}
              aria-label="Sair"
              title="Sair"
              style={{ background: 'transparent', border: 'none', color: 'white', opacity: 0.7, cursor: 'pointer', padding: '6px', flexShrink: 0 }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

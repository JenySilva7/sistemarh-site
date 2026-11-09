import { useState } from 'react';
import { User, DollarSign, Briefcase, Clock, FileText, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type TabType = 'info' | 'salary' | 'position' | 'timebank' | 'payslip' | 'foodvoucher';

// Formata um saldo em minutos como "+6h30" / "-2h15", igual ao app Flutter.
function formatarSaldoBancoHoras(minutos: number): string {
  const sinal = minutos < 0 ? '-' : '+';
  const total = Math.abs(minutos);
  const horas = Math.floor(total / 60);
  const resto = total % 60;
  return `${sinal}${horas}h${resto.toString().padStart(2, '0')}`;
}

export function EmployeeProfile() {
  const { usuario } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('info');

  const tabs = [
    { id: 'info' as const, label: 'Informações', icon: User },
    { id: 'salary' as const, label: 'Salário', icon: DollarSign },
    { id: 'position' as const, label: 'Cargo', icon: Briefcase },
    { id: 'timebank' as const, label: 'Banco de Horas', icon: Clock },
    { id: 'payslip' as const, label: 'Holerite', icon: FileText },
    { id: 'foodvoucher' as const, label: 'Vale Alimentação', icon: FileText },
  ];

  // Nome/e-mail/cargo/departamento/saldo do banco de horas vêm da API
  // (GET /api/auth/me) — o resto (CPF, RG, endereço, composição salarial,
  // holerite, vale-alimentação) ainda não tem fonte real no backend, então
  // continua mockado por enquanto.
  const employeeData = {
    name: usuario?.nome ?? '',
    email: usuario?.email ?? '',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    birthDate: '15/03/1990',
    phone: '(11) 98765-4321',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    admissionDate: '01/06/2020',
    department: usuario?.departamento || 'Não informado',
    position: usuario?.cargo || 'Não informado',
    salary: 'R$ 12.000,00',
    baseSalary: 'R$ 10.000,00',
    benefits: 'R$ 2.000,00',
    foodVoucher: 'R$ 600,00',
    healthInsurance: 'R$ 450,00',
    manager: 'Maria Santos',
  };

  const saldoBancoHoras = usuario ? formatarSaldoBancoHoras(usuario.saldoBancoHorasMinutos) : '+0h00';

  const payslipHistory = [
    { month: 'Fevereiro 2026', grossSalary: 'R$ 12.000,00', deductions: 'R$ 2.100,00', netSalary: 'R$ 9.900,00' },
    { month: 'Janeiro 2026', grossSalary: 'R$ 12.000,00', deductions: 'R$ 2.050,00', netSalary: 'R$ 9.950,00' },
    { month: 'Dezembro 2025', grossSalary: 'R$ 15.000,00', deductions: 'R$ 2.600,00', netSalary: 'R$ 12.400,00' },
  ];

  const foodVoucherHistory = [
    { month: 'Março 2026', value: 'R$ 600,00', used: 'R$ 120,00', balance: 'R$ 480,00' },
    { month: 'Fevereiro 2026', value: 'R$ 600,00', used: 'R$ 580,00', balance: 'R$ 20,00' },
    { month: 'Janeiro 2026', value: 'R$ 600,00', used: 'R$ 600,00', balance: 'R$ 0,00' },
  ];

  const handleExport = (type: string) => {
    alert(`Exportando ${type}...`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl mb-2">Meu Cadastro</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Visualize e gerencie suas informações pessoais e profissionais</p>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6 border-b border-border overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="hr-card p-4 sm:p-6">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Solicitações abertas para o RH</p>
                <p className="text-xs text-muted-foreground mt-0.5">Ausências e justificativas enviadas pelo app</p>
              </div>
              <p className="text-2xl text-primary">{usuario?.totalSolicitacoesAusencia ?? 0}</p>
            </div>

            <div>
              <h2 className="text-xl mb-4">Informações Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Nome Completo</label>
                    <p className="mt-1">{employeeData.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">E-mail</label>
                    <p className="mt-1">{employeeData.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">CPF</label>
                    <p className="mt-1">{employeeData.cpf}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">RG</label>
                    <p className="mt-1">{employeeData.rg}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Data de Nascimento</label>
                    <p className="mt-1">{employeeData.birthDate}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Telefone</label>
                    <p className="mt-1">{employeeData.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Endereço</label>
                    <p className="mt-1">{employeeData.address}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Data de Admissão</label>
                    <p className="mt-1">{employeeData.admissionDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'salary' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl mb-4">Informações Salariais</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="p-4 sm:p-6 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">Salário Total</p>
                  <p className="text-xl sm:text-2xl text-primary break-words">{employeeData.salary}</p>
                </div>
                <div className="p-4 sm:p-6 bg-accent/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Salário Base</p>
                  <p className="text-xl sm:text-2xl break-words">{employeeData.baseSalary}</p>
                </div>
                <div className="p-4 sm:p-6 bg-accent/50 rounded-lg border border-border sm:col-span-2 lg:col-span-1">
                  <p className="text-sm text-muted-foreground mb-2">Benefícios</p>
                  <p className="text-xl sm:text-2xl break-words">{employeeData.benefits}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="text-lg">Composição Salarial</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex flex-wrap justify-between items-center gap-2 p-4 bg-accent/30 rounded-lg">
                    <span className="text-muted-foreground">Vale Alimentação</span>
                    <span>{employeeData.foodVoucher}</span>
                  </div>
                  <div className="flex flex-wrap justify-between items-center gap-2 p-4 bg-accent/30 rounded-lg">
                    <span className="text-muted-foreground">Plano de Saúde</span>
                    <span>{employeeData.healthInsurance}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'position' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl mb-4">Informações do Cargo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="p-4 sm:p-6 bg-accent/30 rounded-lg border border-border">
                  <label className="text-sm text-muted-foreground">Cargo Atual</label>
                  <p className="text-lg sm:text-xl mt-2">{employeeData.position}</p>
                </div>
                <div className="p-4 sm:p-6 bg-accent/30 rounded-lg border border-border">
                  <label className="text-sm text-muted-foreground">Departamento</label>
                  <p className="text-lg sm:text-xl mt-2">{employeeData.department}</p>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-accent/30 rounded-lg border border-border">
                <label className="text-sm text-muted-foreground">Gestor Direto</label>
                <p className="text-lg sm:text-xl mt-2">{employeeData.manager}</p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg mb-4">Responsabilidades</h3>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Desenvolver e manter aplicações web</li>
                  <li>Participar de revisões de código</li>
                  <li>Mentorar desenvolvedores júnior</li>
                  <li>Colaborar com equipes multifuncionais</li>
                  <li>Garantir qualidade e performance do código</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timebank' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <div>
                <h2 className="text-xl">Banco de Horas</h2>
                <p className="text-muted-foreground text-sm mt-1">Acompanhe seu saldo de horas</p>
              </div>
              <div className="sm:text-right">
                <p className="text-sm text-muted-foreground">Saldo Atual</p>
                <p className="text-2xl text-primary">{saldoBancoHoras}</p>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-accent/30 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                O extrato detalhado (lançamento por lançamento) fica disponível quando sua conta estiver vinculada a um
                cadastro de funcionário — por enquanto, só o saldo atual está disponível aqui.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'payslip' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl">Holerites</h2>
                <p className="text-muted-foreground text-sm mt-1">Histórico de holerites disponíveis</p>
              </div>
            </div>

            <div className="space-y-4">
              {payslipHistory.map((record, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-6 bg-accent/30 rounded-lg border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <div>
                      <h3 className="text-lg">{record.month}</h3>
                    </div>
                    <button
                      onClick={() => handleExport(`Holerite ${record.month}`)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exportar PDF</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Salário Bruto</p>
                      <p className="text-base sm:text-lg mt-1 break-words">{record.grossSalary}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Descontos</p>
                      <p className="text-base sm:text-lg mt-1 text-red-600 break-words">{record.deductions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Salário Líquido</p>
                      <p className="text-base sm:text-lg mt-1 text-green-600 break-words">{record.netSalary}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'foodvoucher' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl">Vale Alimentação</h2>
                <p className="text-muted-foreground text-sm mt-1">Histórico e demonstrativos do vale alimentação</p>
              </div>
            </div>

            <div className="space-y-4">
              {foodVoucherHistory.map((record, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-6 bg-accent/30 rounded-lg border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <div>
                      <h3 className="text-lg">{record.month}</h3>
                    </div>
                    <button
                      onClick={() => handleExport(`Demonstrativo Vale Alimentação ${record.month}`)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exportar PDF</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Recebido</p>
                      <p className="text-base sm:text-lg mt-1 text-green-600 break-words">{record.value}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Utilizado</p>
                      <p className="text-base sm:text-lg mt-1 break-words">{record.used}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo Disponível</p>
                      <p className="text-base sm:text-lg mt-1 text-primary break-words">{record.balance}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

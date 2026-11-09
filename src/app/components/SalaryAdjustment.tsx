import { useState } from 'react';
import { DollarSign, Search, Save, TrendingUp, Calendar } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  currentSalary: number;
  admissionDate: string;
}

export function SalaryAdjustment() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'percentage' | 'fixed'>('percentage');
  const [adjustmentValue, setAdjustmentValue] = useState('');
  const [reason, setReason] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');

  // Mock data
  const employees: Employee[] = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao.silva@empresa.com',
      department: 'Tecnologia',
      position: 'Desenvolvedor Sênior',
      currentSalary: 10000,
      admissionDate: '01/06/2020',
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria.santos@empresa.com',
      department: 'Recursos Humanos',
      position: 'Gerente de RH',
      currentSalary: 15000,
      admissionDate: '15/03/2018',
    },
    {
      id: 3,
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@empresa.com',
      department: 'Tecnologia',
      position: 'Coordenador de TI',
      currentSalary: 18000,
      admissionDate: '10/01/2019',
    },
    {
      id: 4,
      name: 'Ana Silva',
      email: 'ana.silva@empresa.com',
      department: 'Comercial',
      position: 'Vendedora',
      currentSalary: 5000,
      admissionDate: '20/08/2021',
    },
    {
      id: 5,
      name: 'Pedro Costa',
      email: 'pedro.costa@empresa.com',
      department: 'Financeiro',
      position: 'Analista Financeiro',
      currentSalary: 8000,
      admissionDate: '05/11/2020',
    },
  ];

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateNewSalary = (): number => {
    if (!selectedEmployee || !adjustmentValue) return 0;

    const value = parseFloat(adjustmentValue);
    if (isNaN(value)) return selectedEmployee.currentSalary;

    if (adjustmentType === 'percentage') {
      return selectedEmployee.currentSalary * (1 + value / 100);
    } else {
      return selectedEmployee.currentSalary + value;
    }
  };

  const handleSave = () => {
    if (!selectedEmployee || !adjustmentValue || !effectiveDate || !reason) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newSalary = calculateNewSalary();
    alert(
      `Ajuste salarial aplicado com sucesso!\n\nColaborador: ${selectedEmployee.name}\nSalário Anterior: R$ ${selectedEmployee.currentSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\nNovo Salário: R$ ${newSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\nData de Vigência: ${effectiveDate}`
    );

    // Reset form
    setSelectedEmployee(null);
    setAdjustmentValue('');
    setReason('');
    setEffectiveDate('');
    setSearchTerm('');
  };

  const newSalary = calculateNewSalary();
  const difference = selectedEmployee ? newSalary - selectedEmployee.currentSalary : 0;

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl">Ajuste Salarial</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gerencie e aplique ajustes salariais para os colaboradores
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Lista de Colaboradores */}
        <div className="hr-card p-4 sm:p-6">
          <h2 className="text-xl mb-4">Buscar Colaborador</h2>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, e-mail ou departamento..."
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
            {filteredEmployees.map((employee) => (
              <button
                key={employee.id}
                onClick={() => setSelectedEmployee(employee)}
                className={`w-full p-3 sm:p-4 rounded-lg border transition-all text-left ${
                  selectedEmployee?.id === employee.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-accent/30 hover:bg-accent/50'
                }`}
              >
                <h3 className="font-medium mb-1 break-words">{employee.name}</h3>
                <p className="text-sm text-muted-foreground mb-2 break-all">{employee.email}</p>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs px-2 py-1 bg-accent rounded-full">
                      {employee.department}
                    </span>
                    <span className="text-xs px-2 py-1 bg-accent rounded-full">
                      {employee.position}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-primary whitespace-nowrap">
                    R$ {employee.currentSalary.toLocaleString('pt-BR')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Formulário de Ajuste */}
        <div className="hr-card p-4 sm:p-6">
          <h2 className="text-xl mb-4">Aplicar Ajuste Salarial</h2>

          {selectedEmployee ? (
            <div className="space-y-6">
              {/* Informações do Colaborador */}
              <div className="p-4 bg-accent/30 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground shrink-0">
                    {selectedEmployee.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium break-words">{selectedEmployee.name}</h3>
                    <p className="text-sm text-muted-foreground break-words">{selectedEmployee.position}</p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-between items-center gap-2 mt-3 pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Salário Atual</span>
                  <span className="text-lg font-medium text-primary">
                    R$ {selectedEmployee.currentSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Tipo de Ajuste */}
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Ajuste</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAdjustmentType('percentage')}
                    className={`p-3 rounded-lg border transition-all ${
                      adjustmentType === 'percentage'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-accent/30 hover:bg-accent/50'
                    }`}
                  >
                    Percentual (%)
                  </button>
                  <button
                    onClick={() => setAdjustmentType('fixed')}
                    className={`p-3 rounded-lg border transition-all ${
                      adjustmentType === 'fixed'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-accent/30 hover:bg-accent/50'
                    }`}
                  >
                    Valor Fixo (R$)
                  </button>
                </div>
              </div>

              {/* Valor do Ajuste */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Valor do Ajuste {adjustmentType === 'percentage' ? '(%)' : '(R$)'}
                </label>
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="number"
                    step="0.01"
                    value={adjustmentValue}
                    onChange={(e) => setAdjustmentValue(e.target.value)}
                    placeholder={adjustmentType === 'percentage' ? 'Ex: 10' : 'Ex: 1000'}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Data de Vigência */}
              <div>
                <label className="block text-sm font-medium mb-2">Data de Vigência</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-sm font-medium mb-2">Motivo do Ajuste</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Descreva o motivo do ajuste salarial..."
                  rows={3}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Preview do Novo Salário */}
              {adjustmentValue && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-medium mb-3">Prévia do Ajuste</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="text-muted-foreground">Salário Atual:</span>
                      <span>R$ {selectedEmployee.currentSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="text-muted-foreground">Ajuste:</span>
                      <span className="text-green-600">
                        + R$ {difference.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2 pt-2 border-t border-border">
                      <span className="font-medium">Novo Salário:</span>
                      <span className="font-medium text-primary text-lg">
                        R$ {newSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Botão Salvar */}
              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                <Save className="w-4 h-4" />
                <span>Aplicar Ajuste Salarial</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <DollarSign className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-center">
                Selecione um colaborador ao lado para aplicar ajuste salarial
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

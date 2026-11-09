import { useState } from 'react';
import { Utensils, Search, Save, Calendar } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  currentMealVoucher: number;
}

export function MealVoucherAdjustment() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newValue, setNewValue] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [reason, setReason] = useState('');

  // Mock data
  const employees: Employee[] = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao.silva@empresa.com',
      department: 'Tecnologia',
      position: 'Desenvolvedor Sênior',
      currentMealVoucher: 600,
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria.santos@empresa.com',
      department: 'Recursos Humanos',
      position: 'Gerente de RH',
      currentMealVoucher: 800,
    },
    {
      id: 3,
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@empresa.com',
      department: 'Tecnologia',
      position: 'Coordenador de TI',
      currentMealVoucher: 750,
    },
    {
      id: 4,
      name: 'Ana Silva',
      email: 'ana.silva@empresa.com',
      department: 'Comercial',
      position: 'Vendedora',
      currentMealVoucher: 500,
    },
    {
      id: 5,
      name: 'Pedro Costa',
      email: 'pedro.costa@empresa.com',
      department: 'Financeiro',
      position: 'Analista Financeiro',
      currentMealVoucher: 600,
    },
  ];

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!selectedEmployee || !newValue || !effectiveDate || !reason) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const value = parseFloat(newValue);
    if (isNaN(value) || value <= 0) {
      alert('Por favor, insira um valor válido.');
      return;
    }

    alert(
      `Ajuste de vale alimentação aplicado com sucesso!\n\nColaborador: ${selectedEmployee.name}\nValor Anterior: R$ ${selectedEmployee.currentMealVoucher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\nNovo Valor: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\nData de Vigência: ${effectiveDate}`
    );

    // Reset form
    setSelectedEmployee(null);
    setNewValue('');
    setReason('');
    setEffectiveDate('');
    setSearchTerm('');
  };

  const value = parseFloat(newValue) || 0;
  const difference = selectedEmployee ? value - selectedEmployee.currentMealVoucher : 0;

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl">Ajuste Vale Alimentação</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gerencie e ajuste os valores de vale alimentação dos colaboradores
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
                    R$ {employee.currentMealVoucher.toLocaleString('pt-BR')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Formulário de Ajuste */}
        <div className="hr-card p-4 sm:p-6">
          <h2 className="text-xl mb-4">Aplicar Ajuste</h2>

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
                  <span className="text-sm text-muted-foreground">Vale Alimentação Atual</span>
                  <span className="text-lg font-medium text-primary">
                    R$ {selectedEmployee.currentMealVoucher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Novo Valor */}
              <div>
                <label className="block text-sm font-medium mb-2">Novo Valor (R$)</label>
                <div className="relative">
                  <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="number"
                    step="0.01"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Ex: 700.00"
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
                  placeholder="Descreva o motivo do ajuste..."
                  rows={3}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Preview do Novo Valor */}
              {newValue && value > 0 && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-medium mb-3">Prévia do Ajuste</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="text-muted-foreground">Valor Atual:</span>
                      <span>R$ {selectedEmployee.currentMealVoucher.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="text-muted-foreground">Diferença:</span>
                      <span className={difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {difference >= 0 ? '+' : ''} R$ {difference.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2 pt-2 border-t border-border">
                      <span className="font-medium">Novo Valor:</span>
                      <span className="font-medium text-primary text-lg">
                        R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Valores de Referência */}
              <div className="p-4 bg-accent/20 rounded-lg border border-border">
                <h4 className="text-sm font-medium mb-2">Valores de Referência</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• Estagiário: R$ 400,00</p>
                  <p>• Analista Júnior: R$ 500,00</p>
                  <p>• Analista Pleno/Sênior: R$ 600,00</p>
                  <p>• Coordenador: R$ 750,00</p>
                  <p>• Gerente: R$ 800,00</p>
                </div>
              </div>

              {/* Botão Salvar */}
              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                <Save className="w-4 h-4" />
                <span>Aplicar Ajuste</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Utensils className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-center">
                Selecione um colaborador ao lado para ajustar o vale alimentação
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

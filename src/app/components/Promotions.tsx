import { useState } from 'react';
import { TrendingUp, Search, Save, Briefcase, DollarSign, Calendar } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  currentPosition: string;
  currentSalary: number;
  admissionDate: string;
}

export function Promotions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newPosition, setNewPosition] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [justification, setJustification] = useState('');

  // Mock data
  const employees: Employee[] = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao.silva@empresa.com',
      department: 'Tecnologia',
      currentPosition: 'Desenvolvedor Pleno',
      currentSalary: 8000,
      admissionDate: '01/06/2020',
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria.santos@empresa.com',
      department: 'Recursos Humanos',
      currentPosition: 'Analista de RH Sênior',
      currentSalary: 10000,
      admissionDate: '15/03/2018',
    },
    {
      id: 3,
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@empresa.com',
      department: 'Tecnologia',
      currentPosition: 'Desenvolvedor Sênior',
      currentSalary: 12000,
      admissionDate: '10/01/2019',
    },
    {
      id: 4,
      name: 'Ana Silva',
      email: 'ana.silva@empresa.com',
      department: 'Comercial',
      currentPosition: 'Vendedora Júnior',
      currentSalary: 4000,
      admissionDate: '20/08/2021',
    },
    {
      id: 5,
      name: 'Pedro Costa',
      email: 'pedro.costa@empresa.com',
      department: 'Financeiro',
      currentPosition: 'Analista Financeiro Pleno',
      currentSalary: 7000,
      admissionDate: '05/11/2020',
    },
  ];

  const departments = [
    'Tecnologia',
    'Recursos Humanos',
    'Comercial',
    'Financeiro',
    'Marketing',
    'Operações',
    'Jurídico',
  ];

  const positions = [
    'Estagiário',
    'Analista Júnior',
    'Analista Pleno',
    'Analista Sênior',
    'Desenvolvedor Júnior',
    'Desenvolvedor Pleno',
    'Desenvolvedor Sênior',
    'Coordenador',
    'Gerente',
    'Diretor',
  ];

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setNewDepartment(employee.department);
    setNewPosition('');
    setNewSalary('');
    setEffectiveDate('');
    setJustification('');
  };

  const handleSave = () => {
    if (!selectedEmployee || !newPosition || !newDepartment || !newSalary || !effectiveDate || !justification) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const salary = parseFloat(newSalary);
    if (isNaN(salary) || salary <= 0) {
      alert('Por favor, insira um salário válido.');
      return;
    }

    alert(
      `Promoção aplicada com sucesso!\n\nColaborador: ${selectedEmployee.name}\n\nAntes:\nCargo: ${selectedEmployee.currentPosition}\nDepartamento: ${selectedEmployee.department}\nSalário: R$ ${selectedEmployee.currentSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\nDepois:\nCargo: ${newPosition}\nDepartamento: ${newDepartment}\nSalário: R$ ${salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\nData de Vigência: ${effectiveDate}`
    );

    // Reset form
    setSelectedEmployee(null);
    setNewPosition('');
    setNewDepartment('');
    setNewSalary('');
    setEffectiveDate('');
    setJustification('');
    setSearchTerm('');
  };

  const salary = parseFloat(newSalary) || 0;
  const salaryDifference = selectedEmployee ? salary - selectedEmployee.currentSalary : 0;
  const salaryIncrease = selectedEmployee && selectedEmployee.currentSalary > 0
    ? ((salaryDifference / selectedEmployee.currentSalary) * 100).toFixed(2)
    : '0';

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl">Promoções</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gerencie promoções e mudanças de cargo dos colaboradores
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
                onClick={() => handleSelectEmployee(employee)}
                className={`w-full p-3 sm:p-4 rounded-lg border transition-all text-left ${
                  selectedEmployee?.id === employee.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-accent/30 hover:bg-accent/50'
                }`}
              >
                <h3 className="font-medium mb-1 break-words">{employee.name}</h3>
                <p className="text-sm text-muted-foreground mb-2 break-all">{employee.email}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {employee.currentPosition}
                  </span>
                  <span className="text-xs px-2 py-1 bg-accent rounded-full">
                    {employee.department}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    Admissão: {employee.admissionDate}
                  </span>
                  <span className="font-medium text-primary whitespace-nowrap">
                    R$ {employee.currentSalary.toLocaleString('pt-BR')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Formulário de Promoção */}
        <div className="hr-card p-4 sm:p-6">
          <h2 className="text-xl mb-4">Aplicar Promoção</h2>

          {selectedEmployee ? (
            <div className="space-y-6">
              {/* Situação Atual */}
              <div className="p-4 bg-accent/30 rounded-lg border border-border">
                <h3 className="font-medium mb-3">Situação Atual</h3>
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
                    <h4 className="font-medium break-words">{selectedEmployee.name}</h4>
                    <p className="text-sm text-muted-foreground break-all">{selectedEmployee.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Cargo</p>
                    <p className="text-sm font-medium break-words">{selectedEmployee.currentPosition}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Departamento</p>
                    <p className="text-sm font-medium break-words">{selectedEmployee.department}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Salário Atual</p>
                    <p className="text-lg font-medium text-primary">
                      R$ {selectedEmployee.currentSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Novo Cargo */}
              <div>
                <label className="block text-sm font-medium mb-2">Novo Cargo</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                  >
                    <option value="">Selecione um cargo</option>
                    {positions.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Novo Departamento */}
              <div>
                <label className="block text-sm font-medium mb-2">Departamento</label>
                <select
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                >
                  <option value="">Selecione um departamento</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Novo Salário */}
              <div>
                <label className="block text-sm font-medium mb-2">Novo Salário (R$)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="number"
                    step="0.01"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="Ex: 15000.00"
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

              {/* Justificativa */}
              <div>
                <label className="block text-sm font-medium mb-2">Justificativa da Promoção</label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Descreva os motivos e conquistas que justificam a promoção..."
                  rows={3}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Preview da Promoção */}
              {newPosition && newSalary && salary > 0 && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-medium mb-3">Prévia da Promoção</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Cargo</p>
                        <p className="line-through opacity-60 break-words">{selectedEmployee.currentPosition}</p>
                        <p className="text-green-600 font-medium break-words">{newPosition}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-muted-foreground mb-1">Salário</p>
                        <p className="line-through opacity-60">
                          R$ {selectedEmployee.currentSalary.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-green-600 font-medium">
                          R$ {salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <div className="flex flex-wrap justify-between gap-2 text-sm">
                        <span className="text-muted-foreground">Aumento Salarial:</span>
                        <span className="font-medium text-green-600">
                          + R$ {salaryDifference.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({salaryIncrease}%)
                        </span>
                      </div>
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
                <span>Aplicar Promoção</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <TrendingUp className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-center">
                Selecione um colaborador ao lado para aplicar uma promoção
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

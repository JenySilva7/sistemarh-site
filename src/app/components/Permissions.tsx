import { useState } from 'react';
import { Shield, Search, Save, User } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  permissions: {
    ti: boolean;
    rh: boolean;
    myData: boolean;
  };
}

export function Permissions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Mock data - dados de exemplo
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      name: 'João Silva',
      email: 'joao.silva@empresa.com',
      department: 'Tecnologia',
      position: 'Desenvolvedor Sênior',
      permissions: { ti: true, rh: false, myData: true },
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria.santos@empresa.com',
      department: 'Recursos Humanos',
      position: 'Gerente de RH',
      permissions: { ti: false, rh: true, myData: true },
    },
    {
      id: 3,
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@empresa.com',
      department: 'Tecnologia',
      position: 'Coordenador de TI',
      permissions: { ti: true, rh: false, myData: true },
    },
    {
      id: 4,
      name: 'Ana Silva',
      email: 'ana.silva@empresa.com',
      department: 'Comercial',
      position: 'Vendedora',
      permissions: { ti: false, rh: false, myData: true },
    },
    {
      id: 5,
      name: 'Pedro Costa',
      email: 'pedro.costa@empresa.com',
      department: 'Financeiro',
      position: 'Analista Financeiro',
      permissions: { ti: false, rh: false, myData: true },
    },
    {
      id: 6,
      name: 'Juliana Alves',
      email: 'juliana.alves@empresa.com',
      department: 'Recursos Humanos',
      position: 'Analista de RH',
      permissions: { ti: false, rh: true, myData: true },
    },
  ]);

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePermissionChange = (permissionType: 'ti' | 'rh') => {
    if (!selectedEmployee) return;

    setSelectedEmployee({
      ...selectedEmployee,
      permissions: {
        ...selectedEmployee.permissions,
        [permissionType]: !selectedEmployee.permissions[permissionType],
      },
    });
  };

  const handleSave = () => {
    if (!selectedEmployee) return;

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === selectedEmployee.id ? selectedEmployee : emp
      )
    );

    alert('Permissões atualizadas com sucesso!');
    setSelectedEmployee(null);
    setSearchTerm('');
  };

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee({ ...employee });
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl">Gerenciar Permissões</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gerencie as permissões de acesso dos colaboradores no sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Lista de Colaboradores */}
        <div className="hr-card p-4 sm:p-6">
          <h2 className="text-xl mb-4">Buscar Colaborador</h2>

          {/* Campo de Busca */}
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

          {/* Lista de Resultados */}
          <div className="space-y-2 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum colaborador encontrado</p>
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => handleSelectEmployee(employee)}
                  className={`w-full p-3 sm:p-4 rounded-lg border transition-all text-left ${
                    selectedEmployee?.id === employee.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-accent/30 hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-1 break-words">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2 break-all">
                        {employee.email}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs px-2 py-1 bg-accent rounded-full">
                          {employee.department}
                        </span>
                        <span className="text-xs px-2 py-1 bg-accent rounded-full">
                          {employee.position}
                        </span>
                      </div>
                    </div>

                    {/* Badges de Permissões */}
                    <div className="flex flex-col gap-1 shrink-0">
                      {employee.permissions.ti && (
                        <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded">
                          TI
                        </span>
                      )}
                      {employee.permissions.rh && (
                        <span className="text-xs px-2 py-1 bg-green-500 text-white rounded">
                          RH
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Painel de Permissões */}
        <div className="hr-card p-4 sm:p-6">
          <h2 className="text-xl mb-4">Editar Permissões</h2>

          {selectedEmployee ? (
            <div className="space-y-6">
              {/* Informações do Colaborador Selecionado */}
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
                    <p className="text-sm text-muted-foreground break-all">
                      {selectedEmployee.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs px-2 py-1 bg-background rounded">
                    {selectedEmployee.department}
                  </span>
                  <span className="text-xs px-2 py-1 bg-background rounded">
                    {selectedEmployee.position}
                  </span>
                </div>
              </div>

              {/* Controles de Permissões */}
              <div className="space-y-4">
                <h3 className="font-medium mb-3">Permissões de Acesso</h3>

                {/* Permissão: Meus Dados */}
                <div className="flex items-center justify-between gap-3 p-4 bg-accent/20 rounded-lg border border-border">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium mb-1">Meus Dados</h4>
                    <p className="text-sm text-muted-foreground">
                      Acesso à visualização de dados pessoais
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline text-sm text-green-600 font-medium">
                      Ativo (padrão)
                    </span>
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="w-5 h-5 cursor-not-allowed opacity-50"
                    />
                  </div>
                </div>

                {/* Permissão: Acesso TI */}
                <div className="flex items-center justify-between gap-3 p-4 bg-accent/20 rounded-lg border border-border">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium mb-1">Acesso TI</h4>
                    <p className="text-sm text-muted-foreground">
                      Acesso a funcionalidades e dados do departamento de TI
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedEmployee.permissions.ti}
                      onChange={() => handlePermissionChange('ti')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                {/* Permissão: Acesso RH */}
                <div className="flex items-center justify-between gap-3 p-4 bg-accent/20 rounded-lg border border-border">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium mb-1">Acesso RH</h4>
                    <p className="text-sm text-muted-foreground">
                      Acesso a funcionalidades e dados do departamento de RH
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedEmployee.permissions.rh}
                      onChange={() => handlePermissionChange('rh')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>

              {/* Resumo de Permissões */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-medium mb-2">Resumo das Permissões</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    ✓ <span className="text-muted-foreground">Meus Dados</span>
                  </p>
                  <p>
                    {selectedEmployee.permissions.ti ? '✓' : '✗'}{' '}
                    <span className="text-muted-foreground">Acesso TI</span>
                  </p>
                  <p>
                    {selectedEmployee.permissions.rh ? '✓' : '✗'}{' '}
                    <span className="text-muted-foreground">Acesso RH</span>
                  </p>
                </div>
              </div>

              {/* Botão Salvar */}
              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Permissões</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Shield className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-center">
                Selecione um colaborador ao lado para gerenciar suas permissões
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

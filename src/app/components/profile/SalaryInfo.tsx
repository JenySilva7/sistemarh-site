import { DollarSign, TrendingUp, Calendar, PiggyBank } from 'lucide-react';

export function SalaryInfo() {
  const salaryData = {
    baseSalary: 5500.00,
    bonuses: 800.00,
    benefits: 450.00,
    grossSalary: 6750.00,
    deductions: 1350.00,
    netSalary: 5400.00,
    lastIncrease: '01/01/2025',
    increasePercentage: 8.5,
    nextReview: '01/01/2026',
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Salário Base</span>
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-semibold text-primary">{formatCurrency(salaryData.baseSalary)}</p>
        </div>

        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Salário Bruto</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-semibold text-green-600">{formatCurrency(salaryData.grossSalary)}</p>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Salário Líquido</span>
            <PiggyBank className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-semibold text-blue-600">{formatCurrency(salaryData.netSalary)}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Composição Salarial
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Salário Base</span>
              <span className="font-semibold">{formatCurrency(salaryData.baseSalary)}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Bonificações</span>
              <span className="font-semibold text-green-600">+{formatCurrency(salaryData.bonuses)}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Benefícios</span>
              <span className="font-semibold text-green-600">+{formatCurrency(salaryData.benefits)}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Descontos</span>
              <span className="font-semibold text-red-600">-{formatCurrency(salaryData.deductions)}</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold text-lg">Total Líquido</span>
              <span className="font-semibold text-lg text-primary">{formatCurrency(salaryData.netSalary)}</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Histórico de Reajustes
          </h3>

          <div className="space-y-4">
            <div className="bg-secondary/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Último Reajuste</span>
                <span className="text-sm font-medium">{salaryData.lastIncrease}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                  +{salaryData.increasePercentage}%
                </div>
                <span className="text-sm text-muted-foreground">de aumento</span>
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Próxima Revisão</p>
                  <p className="font-semibold mt-1">{salaryData.nextReview}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="text-sm text-muted-foreground bg-secondary/20 rounded-lg p-4">
              <p>💡 As revisões salariais são realizadas anualmente com base no desempenho e política de RH da empresa.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

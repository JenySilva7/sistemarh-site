import { Mail, Phone, MapPin, Calendar, Hash, User } from 'lucide-react';

export function PersonalInfo() {
  const personalData = {
    name: 'João Silva',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    birthDate: '15/05/1990',
    email: 'joao.silva@empresa.com',
    phone: '(11) 98765-4321',
    address: 'Rua das Flores, 123 - Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    admissionDate: '01/03/2020',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 pb-6 border-b border-border">
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl text-primary-foreground">
          {personalData.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <h2 className="text-2xl font-semibold">{personalData.name}</h2>
          <p className="text-muted-foreground">Colaborador desde {personalData.admissionDate}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg pb-2 border-b border-border">Documentos</h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Hash className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">CPF</p>
                <p className="font-medium">{personalData.cpf}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Hash className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">RG</p>
                <p className="font-medium">{personalData.rg}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                <p className="font-medium">{personalData.birthDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Data de Admissão</p>
                <p className="font-medium">{personalData.admissionDate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg pb-2 border-b border-border">Contato</h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">E-mail</p>
                <p className="font-medium">{personalData.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{personalData.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p className="font-medium">{personalData.address}</p>
                <p className="font-medium">{personalData.city} - {personalData.state}</p>
                <p className="font-medium">CEP: {personalData.zipCode}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

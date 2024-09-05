import { Separator } from '@/components/ui/separator';
import { FileText, Box, Server } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoCard } from './_components/dashboardInfoCards';

// const dataBar = [
//   { name: 'Caixa A', documentos: 24 },
//   { name: 'Caixa B', documentos: 32 },
//   { name: 'Caixa C', documentos: 16 },
//   { name: 'Caixa D', documentos: 40 },
//   { name: 'Caixa E', documentos: 20 },
// ];

// const dataLine = [
//   { name: 'Jan', visualizacoes: 30 },
//   { name: 'Feb', visualizacoes: 10 },
//   { name: 'Mar', visualizacoes: 25 },
//   { name: 'Apr', visualizacoes: 15 },
//   { name: 'May', visualizacoes: 35 },
//   { name: 'Jun', visualizacoes: 20 },
// ];

export default function DashboardView() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Painel de informações</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <InfoCard
          title="Documentos Cadastrados"
          value="3,450"
          icon={<FileText size={25} className="text-gray-500" />}
          colorClass="text-primary"
        />
        <InfoCard
          title="Caixas Cadastradas"
          value="120"
          icon={<Box size={25} className="text-gray-500" />}
          colorClass="text-primary"
        />
        <InfoCard
          title="Armazenamento oculpado"
          value="400 GB"
          icon={<Server size={25} className="text-gray-500" />}
          colorClass="text-primary"
        />
      </div>

      <Separator className="my-8" />

      <div className="flex flex-col lg:flex-row lg:space-x-6">
        <div className="flex-1 mb-6 lg:mb-0">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Documentos por Caixa</CardTitle>
            </CardHeader>
            <CardContent>
              {/* <DocumentBarChart data={dataBar} /> */}
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>
                Visualizações de Documentos ao Longo do Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* <DocumentLineChart data={dataLine} /> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

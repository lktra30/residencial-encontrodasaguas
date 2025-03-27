import { EntranceHistory } from "@/components/entrance-registry/EntranceHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  Building2, 
  Clock 
} from "lucide-react";

// Dados mockados para exemplo
const mockEntries = [
  {
    id: 1,
    name: "João Silva",
    document: "123.456.789-00",
    apartment: "101",
    entryTime: "01/01/2024 - 08:30"
  },
  {
    id: 2,
    name: "Maria Santos",
    document: "987.654.321-00",
    apartment: "202",
    entryTime: "01/01/2024 - 09:15"
  },
  // Adicione mais entradas conforme necessário
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard de Controle de Acesso</h1>
      
      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Entradas Hoje</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Apartamentos Ativos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas na Última Hora</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com diferentes visualizações */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Logs de Entrada</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Entradas</CardTitle>
            </CardHeader>
            <CardContent>
              <EntranceHistory entries={mockEntries} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Análises e Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Em breve: Gráficos e análises detalhadas dos dados de acesso.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
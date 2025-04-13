import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, Users, Clock, Info, AlertTriangle, UserCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { AccessStatCard } from "./AccessStatCard";
import { RecentAccessList } from "./RecentAccessList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { getVisitors } from "@/lib/supabase-api";

// Define the AccessEvent type to match the one in RecentAccessList
interface AccessEvent {
  id: number;
  name: string;
  accessTime: string;
  status: "granted" | "denied";
  cardId: string;
}

// Define Visitor interface
interface Visitor {
  id: number;
  name: string;
  rg: string;
  visitingApartment: string;
  visitCount: number;
  lastEntrance: string;
  photo?: string;
}

// Mock data with the correct type for status
const recentAccessData: AccessEvent[] = [
  { id: 1, name: "John Smith", accessTime: "Just now", status: "granted", cardId: "A12345" },
  { id: 2, name: "Maria Garcia", accessTime: "5 minutes ago", status: "granted", cardId: "B67890" },
  { id: 3, name: "Unknown", accessTime: "20 minutes ago", status: "denied", cardId: "Unknown" },
  { id: 4, name: "Alex Johnson", accessTime: "1 hour ago", status: "granted", cardId: "C24680" },
  { id: 5, name: "Sarah Williams", accessTime: "2 hours ago", status: "granted", cardId: "D13579" },
];

const Dashboard = () => {
  const [doorStatus, setDoorStatus] = useState("locked");
  const [occupancy, setOccupancy] = useState(37);
  const [recentAccess, setRecentAccess] = useState<AccessEvent[]>(recentAccessData);
  const [systemStatus, setSystemStatus] = useState("online");
  const [accessStats, setAccessStats] = useState({
    today: 42,
    pending: 3,
    denied: 8,
    capacity: 150
  });
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        setIsLoading(true);
        
        // Usar o método da API do Supabase ao invés de fetch direto
        const { data, error } = await getVisitors();
        
        if (error || !data) {
          throw new Error('Falha ao buscar dados');
        }
        
        // Mapear os dados para se adequar à interface Visitor, se necessário
        const visitorsData = data.map((visitor: any) => ({
          id: visitor.id,
          name: visitor.name,
          rg: visitor.cpf, // Ajustando campo cpf para rg conforme interface
          visitingApartment: visitor.visitingApartment || '',
          visitCount: visitor.visitCount || 0,
          lastEntrance: visitor.lastEntrance || visitor.registry_time,
          photo: visitor.photo_path
        }));
        
        // Ordenar por contagem de visitas
        visitorsData.sort((a: Visitor, b: Visitor) => b.visitCount - a.visitCount);
        
        setVisitors(visitorsData);
        setFilteredVisitors(visitorsData);
        setIsLoading(false);
      } catch (err) {
        console.error('Erro ao buscar dados de visitantes:', err);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados de visitantes.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchVisitors();
  }, []);

  // Filter visitors based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVisitors(visitors);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = visitors.filter(
      visitor => 
        visitor.name.toLowerCase().includes(query) || 
        visitor.rg.toLowerCase().includes(query) ||
        visitor.visitingApartment.toLowerCase().includes(query)
    );
    
    setFilteredVisitors(filtered);
  }, [searchQuery, visitors]);

  // Format ISO date string to a more readable format
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleDoor = () => {
    const newStatus = doorStatus === "locked" ? "unlocked" : "locked";
    setDoorStatus(newStatus);
    
    toast({
      title: `Door ${newStatus}`,
      description: `Main entrance has been ${newStatus}`,
      variant: newStatus === "unlocked" ? "default" : "destructive",
    });
    
    // Auto lock after 10 seconds if unlocked
    if (newStatus === "unlocked") {
      setTimeout(() => {
        setDoorStatus("locked");
        toast({
          title: "Door auto-locked",
          description: "Main entrance has been automatically locked",
          variant: "destructive",
        });
      }, 10000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AccessStatCard 
          title="Today's Access"
          value={accessStats.today}
          icon={Users}
          description="Total access events today"
        />
        <AccessStatCard 
          title="Pending Requests"
          value={accessStats.pending}
          icon={Clock}
          description="Awaiting approval"
          variant="warning"
        />
        <AccessStatCard 
          title="Access Denied"
          value={accessStats.denied}
          icon={AlertTriangle}
          description="Unauthorized attempts"
          variant="danger"
        />
      </div>

      <Tabs defaultValue="main-controls" className="space-y-4">
        <TabsList>
          <TabsTrigger value="main-controls">Controles Principais</TabsTrigger>
          <TabsTrigger value="visitors">Visitantes Recorrentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="main-controls" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Main Entrance</span>
                  <Badge variant={doorStatus === "locked" ? "destructive" : "default"}>
                    {doorStatus === "locked" ? "Locked" : "Unlocked"}
                  </Badge>
                </CardTitle>
                <CardDescription>Control the main entrance door</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-6">
                  <Button
                    size="lg" 
                    variant={doorStatus === "locked" ? "outline" : "destructive"}
                    className="flex items-center gap-2 h-16 px-8 rounded-full transition-all shadow-md hover:shadow-lg"
                    onClick={toggleDoor}
                  >
                    {doorStatus === "locked" ? (
                      <>
                        <Unlock className="h-6 w-6" />
                        <span className="font-medium">Unlock Door</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-6 w-6" />
                        <span className="font-medium">Lock Door</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>System Status</span>
                    <span className="font-medium flex items-center gap-1">
                      <span className={`h-2 w-2 rounded-full ${systemStatus === "online" ? "bg-green-500" : "bg-red-500"}`}></span>
                      {systemStatus === "online" ? "Online" : "Offline"}
                    </span>
                  </div>
                  <Progress value={systemStatus === "online" ? 100 : 0} className={systemStatus === "online" ? "bg-green-200" : "bg-red-200"} />
                </div>
              </CardContent>
            </Card>

            <RecentAccessList accessData={recentAccess} />
          </div>
        </TabsContent>
        
        <TabsContent value="visitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="mr-2 h-5 w-5" />
                Visitantes Únicos
              </CardTitle>
              <CardDescription>
                Todos os visitantes que já entraram no prédio
              </CardDescription>
              <div className="pt-2">
                <Input
                  placeholder="Buscar por nome, documento ou apartamento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Carregando dados de visitantes...</p>
                </div>
              ) : filteredVisitors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "Nenhum visitante encontrado com os termos pesquisados." : "Nenhum visitante registrado."}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Documento</TableHead>
                        <TableHead>Apto. Visitado</TableHead>
                        <TableHead className="text-center">Qntd. Visitas</TableHead>
                        <TableHead>Última Entrada</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVisitors.map((visitor) => (
                        <TableRow key={visitor.id}>
                          <TableCell className="font-medium">{visitor.name}</TableCell>
                          <TableCell>{visitor.rg}</TableCell>
                          <TableCell>{visitor.visitingApartment}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={visitor.visitCount > 3 ? "default" : "outline"}>
                              {visitor.visitCount}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(visitor.lastEntrance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

"use client";

import { EntranceHistory } from "@/components/entrance-registry/EntranceHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  ArrowLeft,
  Ban 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getAccessLogs } from "@/lib/supabase-api";
import { supabase } from "@/utils/server";
import Link from "next/link";

// Interface para registros de entrada
interface EntryRecord {
  id: number;
  name: string;
  cpf: string;
  apartment: string;
  entryTime: string;
  photo?: string;
  authorizedBy?: string;
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<EntryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalToday: 0,
    lastHourEntries: 0
  });

  // Buscar dados do Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await getAccessLogs(100);
        
        if (error) {
          throw new Error(`Erro ao carregar dados: ${error.message}`);
        }
        
        if (data) {
          // Converter dados do Supabase
          const formattedEntries = data.map(log => {
            const visitor = log.visitors;
            let photoUrl;

            // Verificar se visitor existe e tem foto
            if (visitor && visitor.photo) {
              try {
                // Verificar formato da foto (base64 ou caminho)
                if (visitor.photo.startsWith('data:') || visitor.photo.startsWith('mock_photos')) {
                  photoUrl = visitor.photo;
                } else {
                  // Se não for base64, é um caminho de arquivo
                  photoUrl = supabase.storage.from('photos').getPublicUrl(visitor.photo).data.publicUrl;
                  console.log(`[Dashboard] URL da foto: ${photoUrl}`);
                }
              } catch (e) {
                console.warn("Erro ao processar URL da foto no dashboard:", e);
              }
            }

            return {
              id: log.id,
              name: visitor?.name || 'Desconhecido',
              cpf: visitor?.cpf || 'Não informado',
              apartment: log.going_to_ap || log.apartment || 'Não informado',
              entryTime: log.entry_time ? new Date(log.entry_time).toLocaleString() : 
                        (log.lastAccess ? new Date(log.lastAccess).toLocaleString() : new Date().toLocaleString()),
              photo: photoUrl,
              authorizedBy: log.auth_by || log.authBy || 'Não informado'
            };
          });
          
          setEntries(formattedEntries);
          
          // Calcular estatísticas
          calculateStats(formattedEntries);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Falha ao carregar dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calcular estatísticas do dashboard
  const calculateStats = (entries: EntryRecord[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    // Contar entradas de hoje
    const todayEntries = entries.filter(entry => {
      const entryDate = new Date(entry.entryTime);
      return entryDate >= today;
    });
    
    // Contar entradas da última hora
    const lastHourEntries = entries.filter(entry => {
      const entryDateTime = new Date(entry.entryTime);
      return entryDateTime >= oneHourAgo;
    });
    
    setStats({
      totalToday: todayEntries.length,
      lastHourEntries: lastHourEntries.length
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" passHref>
          <Button
            variant="ghost"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Dashboard de Controle de Acesso</h1>
      </div>
      
      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Entradas Hoje</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalToday}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas na Última Hora</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lastHourEntries}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com diferentes visualizações */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Logs de Entrada</TabsTrigger>
          <TabsTrigger value="bans">Banimentos</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Entradas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Carregando dados...</p>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                <EntranceHistory entries={entries} limitEntries={false} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bans">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Banimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link href="/dashboard/manage-bans" passHref>
                  <Button className="w-full">
                    <Ban className="h-4 w-4 mr-2" />
                    Gerenciar Visitantes Banidos
                  </Button>
                </Link>
                <p className="text-muted-foreground text-sm">
                  Nesta seção você pode banir ou remover banimentos de visitantes.
                  Visitantes banidos não poderão ter acesso ao condomínio.
                </p>
              </div>
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
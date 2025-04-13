"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MainHeader } from "@/components/layout/MainHeader";
import { BuildingRegistry } from "@/components/entrance-registry/BuildingRegistry";
import { EntranceHistory } from "@/components/entrance-registry/EntranceHistory";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAccessLogs } from "@/lib/supabase-api";
import { supabase } from "@/utils/server";
import Link from "next/link";
import { EntranceForm } from "@/components/entrance-registry/EntranceForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { checkSupabaseConnection } from "@/utils/server";
import { ensurePhotosBucket } from "@/utils/ensure-storage";

// Define tipos
interface EntryRecord {
  id: number;
  name: string;
  cpf: string;
  apartment: string;
  entryTime: string;
  photo?: string;
  authorizedBy?: string;
}

export default function HomePage() {
  const [entries, setEntries] = useState<EntryRecord[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<EntryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);

  // Inicialização do Supabase e verificação do bucket de storage
  useEffect(() => {
    const initializeApp = async () => {
      // Verificar a conexão com o Supabase
      const isConnected = await checkSupabaseConnection();
      console.log('Status da conexão com o Supabase:', isConnected ? 'Conectado' : 'Desconectado');
      
      if (isConnected) {
        // Garantir que o bucket de fotos exista
        const bucketReady = await ensurePhotosBucket();
        console.log('Bucket de fotos:', bucketReady ? 'Pronto' : 'Não disponível');
      }
      
      setInitialized(true);
    };
    
    initializeApp();
  }, []);

  // Carregar dados do Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await getAccessLogs(100);
        
        if (error) {
          console.error("Erro na resposta da API:", error);
          throw new Error(`Erro ao carregar dados: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          console.log("Nenhum dado de acesso encontrado ou usando dados mockados");
        }
        
        if (data) {
          // Converter dados do Supabase ou mockados
          const formattedEntries = data.map(log => {
            // Verificação segura para garantir que os dados existam
            const visitor = log.visitors || {};
            let photoUrl = undefined;
            
            // Verificando se log contém valores válidos
            if (!log || typeof log !== 'object') {
              console.warn('Registro de acesso inválido:', log);
              return {
                id: Math.random(), // ID temporário para entrada inválida
                name: 'Erro no registro',
                cpf: 'Inválido',
                apartment: 'N/A',
                entryTime: new Date().toLocaleString(),
                photo: undefined,
                authorizedBy: 'Desconhecido'
              };
            }
            
            // Verificar se visitor existe e tem foto
            if (visitor && visitor.photo) {
              try {
                // Verificar formato da foto (base64 ou caminho)
                if (visitor.photo.startsWith('data:') || visitor.photo.startsWith('mock_photos')) {
                  photoUrl = visitor.photo;
                } else {
                  // Se não for base64, é um caminho de arquivo
                  photoUrl = supabase.storage.from('photos').getPublicUrl(visitor.photo).data.publicUrl;
                }
              } catch (e) {
                console.warn("Erro ao processar URL da foto:", e);
              }
            }
            
            return {
              id: log.id || Math.random(), // Garante um ID mesmo se for undefined
              name: visitor?.name || 'Desconhecido',
              cpf: visitor?.cpf || 'Não informado',
              apartment: log.going_to_ap || 'Não informado',
              entryTime: log.lastAccess ? new Date(log.lastAccess).toLocaleString() : new Date().toLocaleString(),
              photo: photoUrl,
              authorizedBy: log.authBy || 'Não informado'
            };
          });
          
          formattedEntries.sort((a, b) => {
            return new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime();
          });
          
          setEntries(formattedEntries);
          setFilteredEntries(formattedEntries);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Falha ao carregar dados. Por favor, tente novamente.');
        toast({
          title: "Erro",
          description: "Não foi possível conectar ao banco de dados.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Filtrar entradas com base na pesquisa
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEntries(entries);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase().trim();
    const filtered = entries.filter(
      entry => 
        entry.name.toLowerCase().includes(query) || 
        entry.cpf.toLowerCase().includes(query) ||
        entry.apartment.toLowerCase().includes(query)
    );
    
    setFilteredEntries(filtered);
  }, [searchQuery, entries]);

  // Registrar nova entrada
  const handleNewEntry = (entry: EntryRecord) => {
    setEntries([entry, ...entries]);
    setFilteredEntries([entry, ...filteredEntries]);
    
    toast({
      title: "Entrada registrada",
      description: `${entry.name} entrou no prédio com sucesso.`,
    });
  };

  // Limpar busca
  const clearSearch = () => {
    setSearchQuery("");
    setFilteredEntries(entries);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <MainHeader />
      <main className="container mx-auto py-6 px-4 md:px-6 space-y-8">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold">Controle de Acesso ao Prédio</CardTitle>
            <CardDescription>
              Sistema de registro de entrada de visitantes
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <BuildingRegistry onNewEntry={handleNewEntry} />
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <p>Carregando dados...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-40">
                <p className="text-red-500">{error}</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-lg font-medium mb-1">Nenhum resultado encontrado</p>
                <p className="text-sm text-muted-foreground max-w-md">
                  Não foi possível encontrar entradas correspondentes a "{searchQuery}". 
                  Tente outro termo de busca.
                </p>
                <Link href="/dashboard">
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={clearSearch}
                  >
                    Mostrar todos os registros
                  </Button>
                </Link>
              </div>
            ) : (
              <EntranceHistory entries={filteredEntries} limitEntries={!isSearching} />
            )}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Sistema de Controle de Acesso - Powered By Effic AI & H Performance
            </span>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
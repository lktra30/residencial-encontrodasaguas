import { useState, useEffect } from "react";
import { EntranceForm } from "./EntranceForm";
import { QuickEntryDialog } from "./QuickEntryDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getVisitors } from "@/lib/supabase-api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/utils/server";

// Tipos para os dados - adaptados conforme schema.prisma
interface Visitor {
  id: number | string;
  name: string;
  rg: string; // Mapeado para cpf no schema
  visitingApartment?: string; // Valor derivado do último AccessLog
  visitCount?: number; // Valor calculado
  lastEntrance?: string; // Valor derivado
  photo?: string;
}

// Lista de apartamentos disponíveis no prédio
// Como não temos uma tabela de residentes, usamos uma lista simples de apartamentos
const AVAILABLE_APARTMENTS = [
  "101", "102", "103", "104",
  "201", "202", "203", "204",
  "301", "302", "303", "304",
  "401", "402", "403", "404"
];

// Tipo para um registro de entrada - adaptado conforme schema.prisma
interface EntryRecord {
  id: number | string;
  name: string;
  document: string; // CPF do visitante
  apartment: string; // Apartamento para onde vai (going_to_ap no schema)
  entryTime: string;
  photo?: string; // Caminho da foto
  authorizedBy?: string; // Quem autorizou (authBy no schema)
  visitCount?: number;
  colaborador?: string;
}

interface BuildingRegistryProps {
  onNewEntry?: (entry: {
    id: number;
    name: string;
    cpf: string;
    apartment: string;
    entryTime: string;
    photo?: string;
    authorizedBy?: string;
    visitCount?: number;
    colaborador?: string;
  }) => void;
}

export function BuildingRegistry({ onNewEntry }: BuildingRegistryProps) {
  const [entries, setEntries] = useState<EntryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [quickEntryDialogOpen, setQuickEntryDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const { toast } = useToast();

  // Buscar dados iniciais (apenas visitantes, conforme schema)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Buscar dados de visitantes
        const { data: visitorsData, error: visitorsError } = await getVisitors();
        
        if (visitorsError || !visitorsData) {
          throw new Error('Falha ao buscar dados de visitantes');
        }
        
        // Mapear os dados conforme necessário
        const mappedVisitors = visitorsData.map((visitor: any) => {
          // Processar a URL da foto corretamente
          let photoUrl = visitor.photo_path || visitor.photo;
          
          if (photoUrl) {
            if (photoUrl.startsWith('data:')) {
              // É uma foto base64, não precisa processar
            } else if (photoUrl.startsWith('mock_photos')) {
              // É uma foto mockada
            } else if (photoUrl.startsWith('visitor_photos/')) {
              // É um caminho no storage do Supabase
              photoUrl = supabase.storage.from('photos').getPublicUrl(photoUrl).data.publicUrl;
            } else {
              // Tentar considerar como caminho de storage
              try {
                photoUrl = supabase.storage.from('photos').getPublicUrl(photoUrl).data.publicUrl;
              } catch (error) {
                console.warn(`Erro ao processar URL da foto ${photoUrl}:`, error);
              }
            }
          }
          
          return {
            id: visitor.id,
            name: visitor.name,
            rg: visitor.cpf, // Mapeando cpf para rg conforme a interface
            visitingApartment: visitor.visitingApartment || '',
            visitCount: visitor.visitCount || 0,
            lastEntrance: visitor.lastEntrance || visitor.registry_time,
            photo: photoUrl
          };
        });
        
        setVisitors(mappedVisitors);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados de visitantes.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Filtrar visitantes com base na busca
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVisitors([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase().trim();
    
    const filtered = visitors.filter(visitor => 
      visitor.name.toLowerCase().includes(query) || 
      visitor.rg.toLowerCase().includes(query)
    );
    
    setFilteredVisitors(filtered);
  }, [searchQuery, visitors]);

  const handleNewEntry = (entry: EntryRecord) => {
    // Adiciona o novo registro ao início da lista
    setEntries([entry, ...entries]);
    // Chamar o callback do componente pai se existir
    if (onNewEntry) {
      // Adaptar o formato do objeto para o esperado em page.tsx
      onNewEntry({
        id: typeof entry.id === 'string' ? parseInt(entry.id) : entry.id,
        name: entry.name,
        cpf: entry.document,
        apartment: entry.apartment,
        entryTime: entry.entryTime,
        photo: entry.photo,
        authorizedBy: entry.authorizedBy,
        visitCount: entry.visitCount,
        colaborador: entry.colaborador
      });
    }
  };

  const handleQuickEntry = (visitorData: Visitor) => {
    setSelectedVisitor(visitorData);
    setQuickEntryDialogOpen(true);
  };

  const handleQuickEntryConfirm = (data: { 
    apartment: string; 
    authorizedByName: string;
    colaborador?: string;
  }) => {
    if (!selectedVisitor) return;

    const newEntry: EntryRecord = {
      id: Date.now(), // ID temporário apenas para a interface
      name: selectedVisitor.name,
      document: selectedVisitor.rg,
      apartment: data.apartment,
      entryTime: new Date().toLocaleString(),
      authorizedBy: data.authorizedByName,
      visitCount: (selectedVisitor.visitCount || 0) + 1,
      photo: selectedVisitor.photo,
      colaborador: data.colaborador
    };

    // Adicionar à lista de entries
    setEntries(prev => [newEntry, ...prev]);
    
    // Callback para o componente pai
    if (onNewEntry) {
      onNewEntry({
        id: typeof newEntry.id === 'string' ? parseInt(newEntry.id) : newEntry.id,
        name: newEntry.name,
        cpf: newEntry.document,
        apartment: newEntry.apartment,
        entryTime: newEntry.entryTime,
        photo: newEntry.photo,
        authorizedBy: newEntry.authorizedBy,
        visitCount: newEntry.visitCount,
        colaborador: newEntry.colaborador
      });
    }

    // Notificação de sucesso
    toast({
      title: "Entrada registrada com sucesso!",
      description: `${selectedVisitor.name} registrado(a) para o apartamento ${data.apartment}${data.colaborador ? `, colaborador: ${data.colaborador}` : ''}.`,
    });

    // Limpar seleção
    setSelectedVisitor(null);
  };

  const handlePhotoClick = (photo: string | undefined) => {
    if (!photo) return;
    
    setExpandedPhoto(photo);
    setPhotoDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Barra de busca de visitantes existentes */}
      <Card>
        <CardHeader>
          <CardTitle>Registrar Entrada</CardTitle>
          <CardDescription>
            Verifique se o visitante já está cadastrado no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="search"
                placeholder="Buscar visitante pelo nome ou documento..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isSearching && (
              <div className="mt-4">
                {isLoading ? (
                  <div className="text-center py-4">Carregando...</div>
                ) : filteredVisitors.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Nenhum visitante encontrado com o termo "{searchQuery}".
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      {filteredVisitors.length} visitante(s) encontrado(s)
                    </div>
                    {filteredVisitors.map((visitor) => (
                      <div 
                        key={visitor.id.toString()} 
                        className="flex items-center justify-between p-3 border rounded-md hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="cursor-pointer" onClick={() => handlePhotoClick(visitor.photo)}>
                            <AvatarImage src={visitor.photo} alt={visitor.name} />
                            <AvatarFallback>{visitor.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{visitor.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Documento: {visitor.rg} • Última visita: {visitor.lastEntrance ? new Date(visitor.lastEntrance).toLocaleDateString() : 'Não registrado'}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleQuickEntry(visitor)}
                          size="sm"
                          className="gap-1"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Entrada
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Formulário de registro para novos visitantes */}
      <EntranceForm onNewEntry={handleNewEntry} />

      {/* Diálogo para entrada rápida de visitante existente */}
      {selectedVisitor && (
        <QuickEntryDialog
          open={quickEntryDialogOpen}
          onOpenChange={setQuickEntryDialogOpen}
          visitor={{
            id: selectedVisitor.id,
            name: selectedVisitor.name,
            document: selectedVisitor.rg,
            photo: selectedVisitor.photo
          }}
          onConfirm={handleQuickEntryConfirm}
        />
      )}

      {/* Diálogo para exibir foto expandida */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0 rounded-full p-2 bg-background/80"
              onClick={() => setPhotoDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            {expandedPhoto && (
              <div className="flex items-center justify-center">
                <img 
                  src={expandedPhoto} 
                  alt="Foto ampliada" 
                  className="max-h-[70vh] object-contain rounded-md" 
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

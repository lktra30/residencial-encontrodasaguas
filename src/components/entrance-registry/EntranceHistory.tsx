import { useState, useMemo, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowRight } from "lucide-react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAccessLogs } from "@/lib/supabase-api";
import { supabase } from "@/utils/server";

interface EntryRecord {
  id: number;
  name: string;
  cpf: string;
  apartment: string;
  entryTime: string;
  photo?: string;
  authorizedBy?: string;
  colaborador?: string;
}

interface EntranceHistoryProps {
  entries?: EntryRecord[];
  limitEntries?: boolean;
}

export function EntranceHistory({ entries = [], limitEntries = false }: EntranceHistoryProps) {
  const [loadedEntries, setLoadedEntries] = useState<EntryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  // Estado para armazenar o termo de busca
  const [searchTerm, setSearchTerm] = useState("");
  // Estado para armazenar o filtro de apartamento (input manual)
  const [apartmentInputFilter, setApartmentInputFilter] = useState("");
  // Estado para armazenar a data selecionada
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  // Estado para armazenar a foto selecionada
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Carregar entradas do Supabase se não forem fornecidas como prop
  useEffect(() => {
    const loadEntriesFromSupabase = async () => {
      if (entries.length === 0) {
        setLoading(true);
        try {
          // Buscar todos os registros de acesso sem limite rígido se não for limitEntries
          const { data, error } = await getAccessLogs(limitEntries ? 10 : 500);
          if (error) {
            console.error('Erro ao carregar histórico:', error);
            return;
          }
          
          if (data) {
            console.log(`Carregados ${data.length} registros de acesso`);
            // Converter dados do Supabase para o formato esperado pelo componente
            const formattedEntries = data.map(log => {
              if (!log || typeof log !== 'object') {
                console.warn('Registro de acesso inválido:', log);
                return {
                  id: Math.random(),
                  name: 'Erro no registro',
                  cpf: 'Inválido',
                  apartment: 'N/A',
                  entryTime: new Date().toLocaleString(),
                  photo: undefined,
                  authorizedBy: 'Desconhecido',
                  colaborador: ''
                };
              }
              
              const visitor = log.visitors || {};
              let photoUrl;
              
              try {
                if (visitor && visitor.photo) {
                  // Verificar formato da foto (base64, mock ou storage)
                  if (visitor.photo.startsWith('data:')) {
                    // É uma foto base64
                    photoUrl = visitor.photo;
                  } else if (visitor.photo.startsWith('mock_photos')) {
                    // É uma foto mockada
                    photoUrl = visitor.photo;
                  } else {
                    // Assumir que é um caminho no storage do Supabase (sem pastas)
                    photoUrl = supabase.storage.from('photos').getPublicUrl(visitor.photo).data.publicUrl;
                    console.log(`[DEBUG] URL da foto do storage: ${photoUrl}`);
                  }
                }
              } catch (error) {
                console.error('Erro ao processar URL da foto:', error, 'Photo path:', visitor.photo);
              }
              
              // Certifique-se de usar o valor do campo colaborador
              const colaboradorValue = log.colaborador || '';
              console.log(`[DEBUG] Valor do campo colaborador para o log ${log.id}: ${colaboradorValue}`);
              
              return {
                id: log.id || parseInt(String(Math.random() * 10000)),
                name: visitor?.name || 'Desconhecido',
                cpf: visitor?.cpf || 'Não informado',
                apartment: log.going_to_ap || 'Não informado',
                entryTime: log.lastAccess ? new Date(log.lastAccess).toLocaleString() : new Date().toLocaleString(),
                photo: photoUrl,
                authorizedBy: log.authBy || 'Não informado',
                colaborador: colaboradorValue
              };
            });
            
            setLoadedEntries(formattedEntries);
          }
        } catch (err) {
          console.error('Erro ao carregar entradas:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadEntriesFromSupabase();
  }, [entries, limitEntries]);

  // Combinar entradas fornecidas como prop com entradas carregadas do Supabase
  const allEntries = useMemo(() => {
    // Ordenar por data (mais recente primeiro)
    const entriesData = entries.length > 0 ? entries : loadedEntries;
    return entriesData.sort((a, b) => {
      // Converter para objetos Date e comparar
      try {
        const dateA = parseEntryDate(a.entryTime);
        const dateB = parseEntryDate(b.entryTime);
        return dateB.getTime() - dateA.getTime();
      } catch (e) {
        return 0;
      }
    });
  }, [entries, loadedEntries]);

  // Obter lista única de apartamentos para o filtro
  const uniqueApartments = useMemo(() => 
    Array.from(new Set(allEntries.map(entry => entry.apartment))).sort(), 
    [allEntries]
  );

  // Função para converter a string de data para objeto Date
  const parseEntryDate = (entryTime: string) => {
    try {
      // Verificar se a string já é uma data válida no formato padrão
      const dateObj = new Date(entryTime);
      if (!isNaN(dateObj.getTime())) {
        return dateObj;
      }
      
      // Tentar diferentes formatos de data brasileiro (DD/MM/YYYY)
      if (entryTime.includes('/')) {
        const [datePart] = entryTime.split(' '); // Separar data e hora
        const [day, month, year] = datePart.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      
      // Se não der certo, retorna a data atual
      return new Date();
    } catch (e) {
      console.error('Erro ao converter data:', entryTime, e);
      return new Date();
    }
  };

  // Função para filtrar as entradas com base nos critérios de busca
  const filteredEntries = useMemo(() => {
    if (loading) return [];
    
    const filtered = allEntries.filter(entry => {
      // Filtro por termo de busca (nome ou CPF)
      const matchesSearch = 
        entry.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        entry.cpf.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por input manual de apartamento
      const matchesApartmentInput = !apartmentInputFilter || 
        entry.apartment.toLowerCase().includes(apartmentInputFilter.toLowerCase());
      
      // Filtro por data
      let matchesDate = true;
      if (selectedDate) {
        const entryDate = parseEntryDate(entry.entryTime);
        // Comparar apenas ano, mês e dia (ignorando horas)
        matchesDate = 
          entryDate.getFullYear() === selectedDate.getFullYear() &&
          entryDate.getMonth() === selectedDate.getMonth() &&
          entryDate.getDate() === selectedDate.getDate();
      }
      
      return matchesSearch && matchesApartmentInput && matchesDate;
    });

    // Se limitEntries for true, retorna apenas as primeiras 10 entradas
    return limitEntries ? filtered.slice(0, 10) : filtered;
  }, [allEntries, searchTerm, apartmentInputFilter, selectedDate, limitEntries, loading]);

  // Função para limpar os filtros
  const clearFilters = () => {
    setSearchTerm("");
    setApartmentInputFilter("");
    setSelectedDate(undefined);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Entradas</CardTitle>
        <CardDescription>
          {limitEntries 
            ? "Últimas 10 entradas registradas" 
            : "Registro de todas as pessoas que entraram no prédio"}
        </CardDescription>
        
        <div className="space-y-4 mt-4">
          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome ou CPF..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Input de busca específico para apartamento */}
          <div className="flex-1 relative">
            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filtrar por número do apartamento..."
              className="pl-8"
              value={apartmentInputFilter}
              onChange={(e) => setApartmentInputFilter(e.target.value)}
            />
          </div>

          {/* Filtro de data */}
          <div className="flex-1 relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Filtrar por data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Botão para limpar filtros */}
          <Button 
            variant={searchTerm || apartmentInputFilter || selectedDate ? "default" : "outline"}
            className={cn(
              "shrink-0 transition-all",
              (searchTerm || apartmentInputFilter || selectedDate) && "bg-primary text-primary-foreground font-medium"
            )}
            onClick={clearFilters}
            disabled={!searchTerm && !apartmentInputFilter && !selectedDate}
          >
            {searchTerm || apartmentInputFilter || selectedDate 
              ? `Limpar filtros (${[
                  searchTerm && "texto",
                  apartmentInputFilter && "apartamento", 
                  selectedDate && "data"
                ].filter(Boolean).length})`
              : "Limpar filtros"
            }
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Foto</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Apartamento</TableHead>
                  <TableHead>Horário de Entrada</TableHead>
                  <TableHead>Liberado Por</TableHead>
                  <TableHead>Colaborador</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      Carregando histórico...
                    </TableCell>
                  </TableRow>
                ) : filteredEntries.length > 0 ? (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {entry.photo ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="hover:opacity-80 transition-opacity">
                                <img
                                  src={entry.photo}
                                  alt={`Foto de ${entry.name}`}
                                  className="w-12 h-12 rounded-full object-cover cursor-pointer"
                                />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md flex items-center justify-center p-0">
                              <DialogTitle className="sr-only">Foto de {entry.name}</DialogTitle>
                              <img
                                src={entry.photo}
                                alt={`Foto de ${entry.name}`}
                                className="w-full h-full object-contain max-h-[80vh]"
                              />
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">Sem foto</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell>{entry.cpf}</TableCell>
                      <TableCell>{entry.apartment}</TableCell>
                      <TableCell>{entry.entryTime}</TableCell>
                      <TableCell>{entry.authorizedBy || <span className="text-muted-foreground italic">Não informado</span>}</TableCell>
                      <TableCell>{entry.colaborador ? entry.colaborador : <span className="text-muted-foreground italic">Nenhum</span>}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      Nenhuma entrada encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {limitEntries && (
            <div className="flex justify-end">
              <Link href="/dashboard" passHref>
                <Button className="gap-2">
                  Ver histórico completo <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

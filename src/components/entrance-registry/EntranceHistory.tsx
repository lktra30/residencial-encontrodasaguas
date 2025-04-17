import { useState, useMemo, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowRight, RefreshCcw } from "lucide-react";
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
  // Estado para controlar se já carregamos os dados para evitar chamadas repetidas
  const [dataLoaded, setDataLoaded] = useState(false);

  // Guardar dados em localStorage para persistência entre recarregamentos
  const saveToLocalStorage = useCallback((data: EntryRecord[]) => {
    try {
      // Temporariamente desativado para depuração
      // localStorage.setItem('entranceHistoryData', JSON.stringify(data));
      console.log('[DEBUG] Salvamento em localStorage desativado para depuração:', data.length, 'registros');
    } catch (error) {
      console.error('[DEBUG] Erro ao salvar dados em localStorage:', error);
    }
  }, []);

  // Função para atualizar os dados forçadamente
  const refreshData = useCallback(async () => {
    console.log('[DEBUG] Atualizando dados do histórico manualmente');
    setLoading(true);
    
    try {
      // Buscar dados diretamente do Supabase
      const { data, error } = await getAccessLogs(limitEntries ? 10 : 500);
      
      if (error) {
        console.error('[DEBUG] Erro ao atualizar dados do Supabase:', error);
        return;
      }
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.log('[DEBUG] Nenhum dado retornado na atualização');
        return;
      }
      
      console.log(`[DEBUG] Dados brutos recebidos na atualização: ${data.length} registros`);
      
      // Transformar dados mantendo a mesma abordagem simplificada
      const transformedEntries = data.map(log => {
        // Extrair valor do colaborador com tratamento mínimo
        let colaboradorValue = "";
        if (log.colaborador !== undefined && log.colaborador !== null) {
          if (typeof log.colaborador === 'string') {
            if (log.colaborador !== "null" && log.colaborador !== "undefined") {
              colaboradorValue = log.colaborador.trim();
            }
          } else {
            colaboradorValue = String(log.colaborador).trim();
          }
        }
        
        console.log(`[DEBUG] Refresh - Valor do colaborador: "${colaboradorValue}" (original: "${log.colaborador}")`);
        
        const visitor = (log as any).visitors || {};
        let photoUrl;
        
        try {
          if (visitor && visitor.photo) {
            if (visitor.photo.startsWith('data:')) {
              photoUrl = visitor.photo;
            } else if (visitor.photo.startsWith('mock_photos')) {
              photoUrl = visitor.photo;
            } else {
              photoUrl = supabase.storage.from('photos').getPublicUrl(visitor.photo).data.publicUrl;
            }
          }
        } catch (photoError) {
          console.error('[DEBUG] Erro ao processar URL da foto:', photoError);
        }
        
        // Criar objeto com dados mínimos
        return {
          id: log.id,
          name: visitor?.name || 'Desconhecido',
          cpf: visitor?.cpf || 'Não informado',
          apartment: log.going_to_ap || 'Não informado',
          entryTime: log.lastAccess ? new Date(log.lastAccess).toLocaleString() : new Date().toLocaleString(),
          photo: photoUrl,
          authorizedBy: log.authBy || 'Não informado',
          colaborador: colaboradorValue
        };
      });
      
      // Atualizar estado diretamente
      setLoadedEntries(transformedEntries);
    } catch (err) {
      console.error('[DEBUG] Erro inesperado na atualização:', err);
    } finally {
      setLoading(false);
    }
  }, [limitEntries]);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    try {
      // Temporariamente desativado para depuração
      /*
      const savedData = localStorage.getItem('entranceHistoryData');
      if (savedData) {
        const parsedData = JSON.parse(savedData) as EntryRecord[];
        console.log('[DEBUG] Dados carregados do localStorage:', parsedData.length, 'registros');
        setLoadedEntries(parsedData);
        setDataLoaded(true);
      }
      */
      console.log('[DEBUG] Carregamento do localStorage desativado para depuração');
    } catch (error) {
      console.error('[DEBUG] Erro ao carregar dados do localStorage:', error);
    }
  }, []);

  // REDEFINIÇÃO: Usar uma abordagem diferente para lidar com os dados do Supabase
  // Carregar entradas do Supabase se não forem fornecidas como prop e não carregadas do localStorage
  useEffect(() => {
    console.log('[DEBUG] useEffect para carregar dados do Supabase foi acionado');
    
    async function fetchData() {
      setLoading(true);
      console.log('[DEBUG] Iniciando busca direta no Supabase');
      
      try {
        // Buscar dados diretamente do Supabase
        const { data, error } = await getAccessLogs(limitEntries ? 10 : 500);
        
        if (error) {
          console.error('[DEBUG] Erro ao buscar dados do Supabase:', error);
          return;
        }
        
        if (!data || !Array.isArray(data) || data.length === 0) {
          console.log('[DEBUG] Nenhum dado retornado do Supabase');
          setLoadedEntries([]);
          return;
        }
        
        console.log(`[DEBUG] Dados brutos recebidos do Supabase: ${data.length} registros`);
        
        // Transformar dados para o formato necessário, focando em preservar o valor do colaborador
        const transformedEntries = data.map(log => {
          // Fazer log detalhado de cada objeto recebido
          console.log(`[DEBUG] Log bruto do Supabase para ID ${log.id}:`, JSON.stringify({
            id: log.id,
            colaborador: log.colaborador,
            colaboradorType: typeof log.colaborador
          }));
          
          // Extrair valor do colaborador com tratamento mínimo
          let colaboradorValue = "";
          if (log.colaborador !== undefined && log.colaborador !== null) {
            if (typeof log.colaborador === 'string') {
              if (log.colaborador !== "null" && log.colaborador !== "undefined") {
                colaboradorValue = log.colaborador.trim();
              }
            } else {
              colaboradorValue = String(log.colaborador).trim();
            }
          }
          
          console.log(`[DEBUG] Valor do colaborador após processamento básico: "${colaboradorValue}"`);
          
          const visitor = (log as any).visitors || {};
          let photoUrl;
          
          try {
            if (visitor && visitor.photo) {
              if (visitor.photo.startsWith('data:')) {
                photoUrl = visitor.photo;
              } else if (visitor.photo.startsWith('mock_photos')) {
                photoUrl = visitor.photo;
              } else {
                photoUrl = supabase.storage.from('photos').getPublicUrl(visitor.photo).data.publicUrl;
              }
            }
          } catch (photoError) {
            console.error('[DEBUG] Erro ao processar URL da foto:', photoError);
          }
          
          // Criar objeto com dados mínimos
          return {
            id: log.id,
            name: visitor?.name || 'Desconhecido',
            cpf: visitor?.cpf || 'Não informado',
            apartment: log.going_to_ap || 'Não informado',
            entryTime: log.lastAccess ? new Date(log.lastAccess).toLocaleString() : new Date().toLocaleString(),
            photo: photoUrl,
            authorizedBy: log.authBy || 'Não informado',
            colaborador: colaboradorValue // Usar o valor processado
          };
        });
        
        console.log('[DEBUG] Entradas processadas finais:', transformedEntries.map(e => ({
          id: e.id, 
          colaborador: e.colaborador,
          colaboradorType: typeof e.colaborador
        })));
        
        // Salvar diretamente no estado
        setLoadedEntries(transformedEntries);
      } catch (err) {
        console.error('[DEBUG] Erro inesperado ao buscar dados:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [limitEntries]);

  // Efeito para atualizar o localStorage quando novas entradas são recebidas como props
  useEffect(() => {
    if (entries.length > 0) {
      console.log('[DEBUG] Recebidas novas entradas via props:', entries.length, 'registros');
      
      // Verificar e corrigir o campo colaborador nas novas entradas
      const correctedEntries = entries.map(entry => {
        let colaboradorValue = entry.colaborador || '';
        
        // Verificar se o valor é "null" como string
        if (colaboradorValue === 'null' || colaboradorValue === 'undefined') {
          colaboradorValue = '';
        }
        
        return {
          ...entry,
          colaborador: colaboradorValue
        };
      });
      
      // Mesclar com entradas existentes evitando duplicações
      const existingIds = loadedEntries.map(e => e.id);
      const newEntries = correctedEntries.filter(e => !existingIds.includes(e.id));
      
      if (newEntries.length > 0) {
        const mergedEntries = [...newEntries, ...loadedEntries];
        console.log('[DEBUG] Novas entradas mescladas, total:', mergedEntries.length);
        
        setLoadedEntries(mergedEntries);
        saveToLocalStorage(mergedEntries);
      }
    }
  }, [entries, loadedEntries, saveToLocalStorage]);

  // Combinar entradas fornecidas como prop com entradas carregadas do Supabase
  const allEntries = useMemo(() => {
    // Ordenar por data (mais recente primeiro)
    const entriesData = entries.length > 0 ? entries : loadedEntries;
    
    console.log('[DEBUG] AllEntries - Dados de entrada:', entriesData.map(e => ({id: e.id, colaborador: e.colaborador})));
    
    // Garantir que o campo colaborador esteja corretamente processado antes da renderização
    const processedEntries = entriesData.map(entry => {
      // CORREÇÃO: Processar o campo colaborador para garantir que seja renderizado corretamente
      let colaboradorValue = "";
      
      // Verificar se temos um valor válido
      if (entry.colaborador !== undefined && 
          entry.colaborador !== null && 
          entry.colaborador !== "undefined" && 
          entry.colaborador !== "null" &&
          String(entry.colaborador).trim() !== "") {
        colaboradorValue = String(entry.colaborador).trim();
      }
      
      console.log(`[DEBUG] Processando entrada para renderização - ID: ${entry.id}, colaborador original: "${entry.colaborador}", colaborador final: "${colaboradorValue}"`);
      
      return {
        ...entry,
        colaborador: colaboradorValue
      };
    });
    
    console.log('[DEBUG] AllEntries - Entradas processadas:', processedEntries.map(e => ({id: e.id, colaborador: e.colaborador})));
    
    return processedEntries.sort((a, b) => {
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

    // Log para depuração dos valores de colaborador antes da renderização final
    const result = limitEntries ? filtered.slice(0, 10) : filtered;
    console.log('[DEBUG] Entradas filtradas prontas para renderização:', 
      result.map(e => ({id: e.id, colaborador: e.colaborador}))
    );
    
    // Se limitEntries for true, retorna apenas as primeiras 10 entradas
    return result;
  }, [allEntries, searchTerm, apartmentInputFilter, selectedDate, limitEntries, loading]);

  // Função para limpar os filtros
  const clearFilters = () => {
    setSearchTerm("");
    setApartmentInputFilter("");
    setSelectedDate(undefined);
  };

  // Adicionar um intervalo para atualizar os dados periodicamente (a cada 30 segundos)
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshData();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [refreshData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Histórico de Entradas</CardTitle>
            <CardDescription>
              {limitEntries 
                ? "Últimas 10 entradas registradas" 
                : "Registro de todas as pessoas que entraram no prédio"}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Recarregar Dados
          </Button>
        </div>
        
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
                      <TableCell>
                        {/* CORREÇÃO DIRETA: Acessar diretamente os dados para debug e exibição */}
                        {(() => {
                          // Log para debug do valor exato recebido para renderização
                          console.log(`[DEBUG] Renderizando colaborador para ID ${entry.id}:`, {
                            rawValue: entry.colaborador,
                            type: typeof entry.colaborador
                          });
                          
                          // Renderização condicional baseada no valor real
                          if (entry.colaborador && entry.colaborador !== "" && 
                              entry.colaborador !== "undefined" && entry.colaborador !== "null") {
                            return (
                              <span className="font-medium text-green-600" data-testid="colaborador-value">
                                {entry.colaborador}
                              </span>
                            );
                          } else {
                            return (
                              <span className="text-muted-foreground italic" data-testid="colaborador-empty">
                                Nenhum
                              </span>
                            );
                          }
                        })()}
                      </TableCell>
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

import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Filter, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EntryRecord {
  id: number;
  name: string;
  document: string;
  apartment: string;
  entryTime: string;
  photo?: string;
}

interface EntranceHistoryProps {
  entries: EntryRecord[];
  limitEntries?: boolean;
}

export function EntranceHistory({ entries, limitEntries = false }: EntranceHistoryProps) {
  const navigate = useNavigate();
  // Estado para armazenar o termo de busca
  const [searchTerm, setSearchTerm] = useState("");
  // Estado para armazenar o filtro de apartamento (seleção)
  const [apartmentFilter, setApartmentFilter] = useState("all");
  // Estado para armazenar o filtro de apartamento (input manual)
  const [apartmentInputFilter, setApartmentInputFilter] = useState("");
  // Estado para armazenar a data selecionada
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  // Estado para armazenar a foto selecionada
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Obter lista única de apartamentos para o filtro
  const uniqueApartments = useMemo(() => 
    Array.from(new Set(entries.map(entry => entry.apartment))).sort(), 
    [entries]
  );
  
  // Formatar opções de apartamento para o combobox
  const apartmentOptions = useMemo(() => [
    { value: "all", label: "Todos os apartamentos" },
    ...uniqueApartments.map(apt => ({
      value: apt,
      label: `Apartamento ${apt}`
    }))
  ], [uniqueApartments]);

  // Função para converter a string de data para objeto Date
  const parseEntryDate = (entryTime: string) => {
    const [datePart] = entryTime.split(" - ");
    const [day, month, year] = datePart.split("/");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  // Função para filtrar as entradas com base nos critérios de busca
  const filteredEntries = useMemo(() => {
    const filtered = entries.filter(entry => {
      // Filtro por termo de busca (nome ou documento)
      const matchesSearch = 
        entry.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        entry.document.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por seleção de apartamento do dropdown
      const matchesApartmentDropdown = apartmentFilter === "all" || entry.apartment === apartmentFilter;
      
      // Filtro por input manual de apartamento
      const matchesApartmentInput = !apartmentInputFilter || 
        entry.apartment.toLowerCase().includes(apartmentInputFilter.toLowerCase());
      
      // Filtro por data
      const matchesDate = !selectedDate || (
        selectedDate && entry.entryTime && (
          parseEntryDate(entry.entryTime).toDateString() === selectedDate.toDateString()
        )
      );
      
      return matchesSearch && matchesApartmentDropdown && matchesApartmentInput && matchesDate;
    });

    // Se limitEntries for true, retorna apenas as primeiras 10 entradas
    return limitEntries ? filtered.slice(0, 10) : filtered;
  }, [entries, searchTerm, apartmentFilter, apartmentInputFilter, selectedDate, limitEntries]);

  // Função para limpar os filtros
  const clearFilters = () => {
    setSearchTerm("");
    setApartmentFilter("all");
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
              placeholder="Buscar por nome ou documento..."
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
          <div className="flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Filtrar por data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Botão para limpar filtros */}
          <Button 
            variant="outline" 
            className="shrink-0" 
            onClick={clearFilters}
            disabled={searchTerm === "" && apartmentFilter === "all" && !apartmentInputFilter && !selectedDate}
          >
            Limpar filtros
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
                  <TableHead>Documento</TableHead>
                  <TableHead>Apartamento</TableHead>
                  <TableHead>Horário de Entrada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length > 0 ? (
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
                      <TableCell>{entry.document}</TableCell>
                      <TableCell>{entry.apartment}</TableCell>
                      <TableCell>{entry.entryTime}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      Nenhuma entrada encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {limitEntries && (
            <div className="flex justify-end">
              <Button
                className="gap-2"
                onClick={() => navigate("/dashboard")}
              >
                Ver Mais
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Filter } from "lucide-react";
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

interface EntryRecord {
  id: number;
  name: string;
  document: string;
  apartment: string;
  entryTime: string;
}

interface EntranceHistoryProps {
  entries: EntryRecord[];
}

export function EntranceHistory({ entries }: EntranceHistoryProps) {
  // Estado para armazenar o termo de busca
  const [searchTerm, setSearchTerm] = useState("");
  // Estado para armazenar o filtro de apartamento (seleção)
  const [apartmentFilter, setApartmentFilter] = useState("all");
  // Estado para armazenar o filtro de apartamento (input manual)
  const [apartmentInputFilter, setApartmentInputFilter] = useState("");
  // Estado para armazenar a data selecionada
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

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

  // Função para filtrar as entradas com base nos critérios de busca
  const filteredEntries = useMemo(() => entries.filter(entry => {
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
        new Date(entry.entryTime.split(" - ")[0].split("/").reverse().join("-")).getDate() === selectedDate.getDate() &&
        new Date(entry.entryTime.split(" - ")[0].split("/").reverse().join("-")).getMonth() === selectedDate.getMonth() &&
        new Date(entry.entryTime.split(" - ")[0].split("/").reverse().join("-")).getFullYear() === selectedDate.getFullYear()
      )
    );
    
    return matchesSearch && matchesApartmentDropdown && matchesApartmentInput && matchesDate;
  }), [entries, searchTerm, apartmentFilter, apartmentInputFilter, selectedDate]);

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
        <CardDescription>Registro de todas as pessoas que entraram no prédio</CardDescription>
        
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

          {/* Linha de filtros adicionais */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Filtro de apartamento com dropdown */}
            <div className="flex-1">
              <Select 
                value={apartmentFilter} 
                onValueChange={setApartmentFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filtrar por apartamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os apartamentos</SelectItem>
                  {uniqueApartments.map((apt) => (
                    <SelectItem key={apt} value={apt}>
                      Apartamento {apt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
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
                    <TableCell className="font-medium">{entry.name}</TableCell>
                    <TableCell>{entry.document}</TableCell>
                    <TableCell>{entry.apartment}</TableCell>
                    <TableCell>{entry.entryTime}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    Nenhuma entrada encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

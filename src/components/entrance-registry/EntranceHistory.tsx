
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

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
  // Estado para armazenar o filtro de apartamento
  const [apartmentFilter, setApartmentFilter] = useState("all");
  // Estado para armazenar a data selecionada
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  // Estado para controlar o popover do apartamento
  const [openApartmentPopover, setOpenApartmentPopover] = useState(false);

  // Obter lista única de apartamentos para o filtro
  const uniqueApartments = Array.from(new Set(entries.map(entry => entry.apartment))).sort();

  // Função para filtrar as entradas com base nos critérios de busca
  const filteredEntries = entries.filter(entry => {
    // Filtro por termo de busca (nome ou documento)
    const matchesSearch = 
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      entry.document.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por apartamento
    const matchesApartment = apartmentFilter === "all" || entry.apartment === apartmentFilter;
    
    // Filtro por data
    const entryDate = new Date(entry.entryTime.split(" - ")[0].split("/").reverse().join("-"));
    const matchesDate = !selectedDate || (
      entryDate.getDate() === selectedDate.getDate() &&
      entryDate.getMonth() === selectedDate.getMonth() &&
      entryDate.getFullYear() === selectedDate.getFullYear()
    );
    
    return matchesSearch && matchesApartment && matchesDate;
  });

  // Função para limpar os filtros
  const clearFilters = () => {
    setSearchTerm("");
    setApartmentFilter("all");
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
            {/* Filtro de apartamento com pesquisa */}
            <div className="flex-1">
              <Popover open={openApartmentPopover} onOpenChange={setOpenApartmentPopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openApartmentPopover}
                    className="w-full justify-start"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    {apartmentFilter === "all" 
                      ? "Todos os apartamentos" 
                      : `Apartamento ${apartmentFilter}`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar apartamento..." />
                    <CommandEmpty>Nenhum apartamento encontrado.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          setApartmentFilter("all");
                          setOpenApartmentPopover(false);
                        }}
                      >
                        Todos os apartamentos
                      </CommandItem>
                      {uniqueApartments.map((apt) => (
                        <CommandItem
                          key={apt}
                          value={apt}
                          onSelect={() => {
                            setApartmentFilter(apt);
                            setOpenApartmentPopover(false);
                          }}
                        >
                          Apartamento {apt}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
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
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Botão para limpar filtros */}
            <Button 
              variant="outline" 
              className="shrink-0" 
              onClick={clearFilters}
              disabled={searchTerm === "" && apartmentFilter === "all" && !selectedDate}
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

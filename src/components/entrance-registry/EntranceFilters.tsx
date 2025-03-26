
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

interface EntranceFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  apartmentFilter: string;
  setApartmentFilter: (value: string) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  uniqueApartments: string[];
  clearFilters: () => void;
}

export function EntranceFilters({
  searchTerm,
  setSearchTerm,
  apartmentFilter,
  setApartmentFilter,
  selectedDate,
  setSelectedDate,
  uniqueApartments,
  clearFilters
}: EntranceFiltersProps) {
  const [openApartmentPopover, setOpenApartmentPopover] = useState(false);

  return (
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
  );
}


import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EntranceFilters } from "./EntranceFilters";
import { EntranceTable } from "./EntranceTable";
import { EntryRecord } from "./types";

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

  // Obter lista única de apartamentos para o filtro
  const uniqueApartments = Array.from(new Set(entries.map(entry => entry.apartment))).sort();

  // Função para filtrar as entradas com base nos critérios de busca
  const filteredEntries = entries.filter(entry => {
    // Filtro por termo de busca (nome ou documento)
    const matchesSearch = 
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      entry.document.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por apartamento (agora usando 'all' em vez de string vazia)
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
        
        <EntranceFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          apartmentFilter={apartmentFilter}
          setApartmentFilter={setApartmentFilter}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          uniqueApartments={uniqueApartments}
          clearFilters={clearFilters}
        />
      </CardHeader>
      <CardContent>
        <EntranceTable entries={filteredEntries} />
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { EntranceForm } from "./EntranceForm";
import { EntranceHistory } from "./EntranceHistory";

// Tipo para um registro de entrada
interface EntryRecord {
  id: number;
  name: string;
  document: string;
  apartment: string;
  entryTime: string;
}

// Alguns dados iniciais de exemplo
const initialEntries: EntryRecord[] = [
  {
    id: 1,
    name: "Maria Silva",
    document: "123.456.789-00",
    apartment: "A-101",
    entryTime: "10/05/2023 - 08:30",
  },
  {
    id: 2,
    name: "João Pereira",
    document: "987.654.321-00",
    apartment: "B-202",
    entryTime: "10/05/2023 - 09:15",
  },
  {
    id: 3,
    name: "Ana Santos",
    document: "456.789.123-00",
    apartment: "B-303",
    entryTime: "10/05/2023 - 10:45",
  },
];

export function BuildingRegistry() {
  const [entries, setEntries] = useState<EntryRecord[]>(initialEntries);

  const handleNewEntry = (entry: EntryRecord) => {
    // Adiciona o novo registro ao início da lista
    setEntries([entry, ...entries]);
  };

  return (
    <div className="space-y-8">
      <EntranceForm onNewEntry={handleNewEntry} />
      <EntranceHistory entries={entries} limitEntries={true} />
    </div>
  );
}

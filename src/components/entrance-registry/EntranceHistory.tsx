
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Entradas</CardTitle>
        <CardDescription>Registro de todas as pessoas que entraram no prédio</CardDescription>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar no histórico..."
            className="pl-8"
          />
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
              {entries.length > 0 ? (
                entries.map((entry) => (
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
                    Nenhuma entrada registrada ainda
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

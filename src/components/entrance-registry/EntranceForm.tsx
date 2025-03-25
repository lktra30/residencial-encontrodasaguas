import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
interface FormValues {
  name: string;
  document: string;
  apartment: string;
}
interface EntranceFormProps {
  onNewEntry: (entry: {
    id: number;
    name: string;
    document: string;
    apartment: string;
    entryTime: string;
  }) => void;
}
export function EntranceForm({
  onNewEntry
}: EntranceFormProps) {
  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      document: "",
      apartment: ""
    }
  });
  const onSubmit = (data: FormValues) => {
    // Create new entry with current time
    const newEntry = {
      id: Date.now(),
      name: data.name,
      document: data.document,
      apartment: data.apartment,
      entryTime: new Date().toLocaleString()
    };

    // Call the callback to add to history
    onNewEntry(newEntry);

    // Reset form
    form.reset();

    // Show success toast
    toast({
      title: "Entrada registrada com sucesso",
      description: `${data.name} registrado para o apartamento ${data.apartment}`
    });
  };
  return <Card>
      <CardHeader>
        <CardTitle>Registrar Entrada</CardTitle>
        <CardDescription>Cadastre uma nova pessoa que está entrando no prédio</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({
            field
          }) => <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />
            
            <FormField control={form.control} name="document" render={({
            field
          }) => <FormItem>
                  <FormLabel>Documento (CPF)</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o número do documento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />
            
            <FormField control={form.control} name="apartment" render={({
            field
          }) => <FormItem>
                  <FormLabel>Bloco e Apartamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Número do apartamento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />
            
            <Button type="submit" className="w-full">Registrar Entrada</Button>
          </form>
        </Form>
      </CardContent>
    </Card>;
}
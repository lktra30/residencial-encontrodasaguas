import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PhotoCapture } from "./PhotoCapture";

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
    photo?: string;
  }) => void;
}

export function EntranceForm({ onNewEntry }: EntranceFormProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [resetCamera, setResetCamera] = useState(false);
  
  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      document: "",
      apartment: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    // Create new entry with current time
    const newEntry = {
      id: Date.now(),
      name: data.name,
      document: data.document,
      apartment: data.apartment,
      entryTime: new Date().toLocaleString(),
      photo: photo || undefined,
    };

    // Call the callback to add to history
    onNewEntry(newEntry);

    // Reset form and photo
    form.reset();
    setPhoto(null);
    
    // Alternar o valor de resetCamera para disparar o efeito
    setResetCamera(!resetCamera);

    // Show success toast
    toast({
      title: "Entrada registrada com sucesso",
      description: `${data.name} registrado para o apartamento ${data.apartment}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Entrada</CardTitle>
        <CardDescription>Cadastre uma nova pessoa que está entrando no prédio</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documento (RG/CPF)</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o número do documento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="apartment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apartamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o número do apartamento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Foto</Label>
              <PhotoCapture 
                onPhotoCapture={setPhoto} 
                resetTrigger={resetCamera}
              />
            </div>

            <Button type="submit" className="w-full">
              Registrar Entrada
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

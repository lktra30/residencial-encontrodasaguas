import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PhotoCapture } from "./PhotoCapture";
import { getVisitorByCpf, createVisitor, createAccessLog, uploadVisitorPhoto, checkIfCpfIsBanned } from "@/lib/supabase-api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Definindo o schema de validação com Zod
const formSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  cpf: z.string().min(11, { message: "CPF deve ter 11 dígitos" }),
  apartment: z.string().min(1, { message: "Apartamento é obrigatório" }),
  authorizedBy: z.string().min(1, { message: "Nome do morador é obrigatório" }),
  colaborador: z.string().optional(),
});

// Definindo os tipos para o formulário
type FormValues = z.infer<typeof formSchema>;

// Tipo do parâmetro de entrada - usando document ao invés de cpf para compatibilidade
interface EntryRecord {
  id: number | string;
  name: string;
  document: string; // Campo compatível com a interface EntryRecord no BuildingRegistry
  apartment: string;
  entryTime: string;
  photo?: string;
  authorizedBy?: string;
  colaborador?: string;
}

interface EntranceFormProps {
  onNewEntry: (entry: EntryRecord) => void;
}

export function EntranceForm({ onNewEntry }: EntranceFormProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [resetCamera, setResetCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visitorFound, setVisitorFound] = useState(false);
  const [photoRequired, setPhotoRequired] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cpf: "",
      apartment: "",
      authorizedBy: "",
      colaborador: "",
    },
  });

  // Busca visitante pelo CPF quando o campo perder o foco
  const handleCpfBlur = async () => {
    const cpf = form.getValues('cpf');
    if (!cpf || cpf.length < 11) return;

    setIsLoading(true);
    try {
      // Verificar se o visitante está banido
      const { data: bannedData } = await checkIfCpfIsBanned(cpf);
      
      if (bannedData) {
        setIsBanned(true);
        setBanReason(bannedData.reason || "Motivo não especificado");
        toast({
          title: "Visitante banido",
          description: `Este visitante está na lista de banidos. Motivo: ${bannedData.reason || "Não especificado"}`,
          variant: "destructive"
        });
      } else {
        setIsBanned(false);
        setBanReason(null);
      }

      // Verificar se o visitante existe
      const { data: visitor, error } = await getVisitorByCpf(cpf);
      
      if (visitor) {
        form.setValue('name', visitor.name);
        setVisitorFound(true);
        // Se o visitante já existe e tem foto, não obrigamos nova foto
        setPhotoRequired(false);
        
        if (!isBanned) {
          toast({
            title: "Visitante encontrado",
            description: `${visitor.name} já está cadastrado no sistema.`,
          });
        }
      } else {
        setVisitorFound(false);
        // Se é um novo visitante, exigimos foto
        setPhotoRequired(true);
      }
    } catch (err) {
      console.error('Erro ao buscar visitante:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    // Verificar se o visitante está banido
    if (isBanned) {
      toast({
        title: "Entrada não permitida",
        description: `Este visitante está banido. Motivo: ${banReason || "Não especificado"}`,
        variant: "destructive"
      });
      return;
    }

    // Realizar uma nova verificação de banimento antes de prosseguir
    try {
      const { data: bannedData } = await checkIfCpfIsBanned(data.cpf);
      if (bannedData) {
        setIsBanned(true);
        setBanReason(bannedData.reason || "Motivo não especificado");
        toast({
          title: "Entrada não permitida",
          description: `Este visitante está banido. Motivo: ${bannedData.reason || "Não especificado"}`,
          variant: "destructive"
        });
        return;
      }
    } catch (err) {
      console.error('Erro ao verificar banimento:', err);
    }

    // Verificar se a foto é obrigatória e não foi fornecida
    if (photoRequired && !photoFile && !visitorFound) {
      toast({
        title: "Foto obrigatória",
        description: "É necessário capturar uma foto para novos visitantes.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Upload da foto se existir
      let photoPath = '';
      let photoUrl: string | null = null;
      
      if (photoFile) {
        console.log("[DEBUG] Processando foto...");
        try {
          const uploadResult = await uploadVisitorPhoto(photoFile);
          console.log("[DEBUG] Resultado do upload:", uploadResult);
          
          if (uploadResult && typeof uploadResult === 'object') {
            // Verificar se há erro no resultado
            if ('error' in uploadResult && uploadResult.error) {
              console.error("[DEBUG] Erro ao processar foto:", uploadResult.error);
              toast({
                title: "Aviso - Problema com a foto",
                description: "Continuando com foto em formato base64.",
                variant: "destructive"
              });
            }
            
            // Verificar se há caminho e URL no resultado
            if ('path' in uploadResult && typeof uploadResult.path === 'string') {
              photoPath = uploadResult.path;
              photoUrl = 'url' in uploadResult && typeof uploadResult.url === 'string' 
                ? uploadResult.url 
                : null;
              console.log("[DEBUG] Foto processada com sucesso:", { path: photoPath, url: photoUrl?.substring(0, 50) + '...' });
            }
          }
        } catch (photoError) {
          console.error("[DEBUG] Erro ao processar foto:", photoError);
          toast({
            title: "Problema com a foto",
            description: "Continuando sem foto.",
            variant: "destructive"
          });
        }
      }

      // Verificar se o visitante já existe
      console.log("[DEBUG] Verificando visitante pelo CPF:", data.cpf);
      const { data: existingVisitor, error: visitorError } = await getVisitorByCpf(data.cpf);
      
      if (visitorError) {
        console.log("[DEBUG] Erro ao buscar visitante:", visitorError);
      }
      
      let visitorId;
      
      if (existingVisitor) {
        // Usar o visitante existente
        console.log("[DEBUG] Visitante encontrado:", existingVisitor);
        visitorId = existingVisitor.id;
      } else {
        // Criar novo visitante
        console.log("[DEBUG] Criando novo visitante...");
        
        // Validar que temos um valor válido para foto
        if (!photoPath) {
          console.warn("[DEBUG] photoPath está vazio, usando valor padrão");
          photoPath = `default_${Date.now()}`;
        }
        
        const newVisitorData = {
          name: data.name,
          cpf: data.cpf,
          photo: photoPath
        };
        console.log("[DEBUG] Dados do novo visitante:", newVisitorData);
        
        const { data: newVisitor, error } = await createVisitor(newVisitorData);
        
        if (error) {
          console.error("[DEBUG] Erro detalhado ao criar visitante:", error);
          throw new Error(`Erro ao criar visitante: ${typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error)}`);
        }
        
        console.log("[DEBUG] Resposta da criação do visitante:", newVisitor);
        
        if (newVisitor && Array.isArray(newVisitor) && newVisitor.length > 0) {
          visitorId = newVisitor[0].id;
          console.log("[DEBUG] Visitante criado com ID:", visitorId);
        } else {
          throw new Error("Falha ao criar visitante: nenhum ID retornado");
        }
      }
      
      if (!visitorId) {
        throw new Error("Não foi possível obter o ID do visitante");
      }

      // Registrar entrada no log de acesso
      console.log("[DEBUG] Registrando entrada no log com visitor ID:", visitorId);
      
      // Não precisamos mais passar o photoPath para createAccessLog, 
      // pois pegamos a foto diretamente do visitante no backend
      const accessLogData = {
        visitorId: visitorId,
        going_to_ap: data.apartment,
        authBy: data.authorizedBy || "Portaria",
        lastAccess: new Date().toISOString(),
        colaborador: data.colaborador && data.colaborador.trim() !== '' ? data.colaborador.trim() : "" 
      };
      console.log("[DEBUG] Dados do log de acesso:", accessLogData);
      console.log("[DEBUG] Valor do campo colaborador:", data.colaborador);
      console.log("[DEBUG] Valor do campo colaborador processado:", accessLogData.colaborador);
      
      const { data: accessLog, error } = await createAccessLog(accessLogData);
      
      if (error) {
        console.error("[DEBUG] Erro detalhado ao registrar entrada:", error);
        throw new Error(`Erro ao registrar entrada: ${typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error)}`);
      }

      console.log("[DEBUG] Resposta da criação do log:", accessLog);

      // Criar objeto para enviar ao componente pai
      if (accessLog && Array.isArray(accessLog) && accessLog.length > 0) {
        // Garantir que o valor do colaborador seja tratado corretamente
        const colaboradorValue = data.colaborador && data.colaborador.trim() !== '' ? 
          data.colaborador.trim() : "";
        
        console.log("[DEBUG] Valor final do colaborador para novo registro:", colaboradorValue === "" ? '""' : colaboradorValue);
        
        const newEntry: EntryRecord = {
          id: accessLog[0].id,
          name: data.name,
          document: data.cpf, // Usando document ao invés de cpf para compatibilidade
          apartment: data.apartment,
          entryTime: new Date().toLocaleString(),
          photo: photoUrl || undefined,
          authorizedBy: data.authorizedBy,
          colaborador: colaboradorValue
        };

        // Chamar callback para adicionar ao histórico
        onNewEntry(newEntry);
      } else {
        console.log("[DEBUG] Log de acesso criado, mas sem dados retornados");
      }

      // Resetar formulário e foto
      form.reset();
      setPhotoFile(null);
      setVisitorFound(false);
      setPhotoRequired(false);
      setPhotoPreviewUrl(null);
      
      // Resetar câmera
      setResetCamera(!resetCamera);

      // Mostrar mensagem de sucesso
      toast({
        title: "Entrada registrada com sucesso",
        description: `${data.name} registrado para o apartamento ${data.apartment}${data.authorizedBy ? `, autorizado por ${data.authorizedBy}` : ''}${data.colaborador ? `, colaborador: ${data.colaborador}` : ''}`,
      });
    } catch (err) {
      console.error('[DEBUG] Erro ao registrar entrada:', err);
      toast({
        title: "Erro ao registrar entrada",
        description: err instanceof Error ? err.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para processar a captura da foto
  const handlePhotoCapture = (file: File) => {
    setPhotoFile(file);
    // Criar URL para preview da imagem
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreviewUrl(previewUrl);
  };

  // Limpar URL do objeto quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const handlePhotoClick = () => {
    if (photoPreviewUrl) {
      setPhotoDialogOpen(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Cadastro</CardTitle>
        <CardDescription>Cadastre uma nova pessoa que está entrando no condomínio</CardDescription>
      </CardHeader>
      <CardContent>
        {isBanned && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Visitante banido</AlertTitle>
            <AlertDescription>
              Este visitante está na lista de banidos. Entrada não permitida.<br/>
              Motivo: {banReason || "Não especificado"}
            </AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF ou RG<span className="text-red-500">*</span></FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        placeholder="Digite o CPF ou RG" 
                        {...field} 
                        onBlur={handleCpfBlur}
                        required
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Digite o nome completo" 
                      {...field} 
                      className={visitorFound ? "border-green-500" : ""}
                      required
                    />
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
                  <FormLabel>Bloco e Apartamento <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Bloco e Número do apartamento" 
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="authorizedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autorizado Por <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome de quem autorizou" 
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="colaborador"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colaborador</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome do colaborador" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Informe o nome do colaborador que está liberando o(s) visitante(s)
                  </p>
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <Label>Foto {!visitorFound && <span className="text-red-500">*</span>}</Label>
              <PhotoCapture 
                onPhotoCapture={handlePhotoCapture} 
                resetTrigger={resetCamera}
              />
              {photoRequired && !photoFile && !visitorFound && (
                <p className="text-sm text-red-500">
                  Foto é obrigatória para novos visitantes
                </p>
              )}
              {photoFile && (
                <div>
                  <p className="text-sm text-green-500 mb-2">
                    Foto capturada com sucesso
                  </p>
                  {photoPreviewUrl && (
                    <div 
                      className="w-24 h-24 rounded-md overflow-hidden cursor-pointer border-2 border-primary hover:opacity-90 transition-opacity"
                      onClick={handlePhotoClick}
                    >
                      <img 
                        src={photoPreviewUrl} 
                        alt="Preview da foto" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Processando..." : "Registrar Entrada"}
            </Button>
          </form>
        </Form>
      </CardContent>

      {/* Diálogo para exibir foto expandida */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Foto do Visitante</DialogTitle>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0 rounded-full p-2 bg-background/80"
              onClick={() => setPhotoDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            {photoPreviewUrl && (
              <div className="flex items-center justify-center">
                <img 
                  src={photoPreviewUrl} 
                  alt="Foto ampliada" 
                  className="max-h-[70vh] object-contain rounded-md" 
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createAccessLog, checkIfCpfIsBanned } from "@/lib/supabase-api"; // Importando as funções
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Interface do visitante adaptada para o schema.prisma
interface Visitor {
  id: number | string;
  name: string;
  document: string;
  photo?: string;
}

interface QuickEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitor: Visitor;
  availableApartments?: string[]; // Tornando opcional
  onConfirm: (data: { 
    apartment: string; 
    authorizedByName: string;
    colaborador?: string;
  }) => void;
}

export function QuickEntryDialog({ 
  open, 
  onOpenChange, 
  visitor, 
  onConfirm 
}: QuickEntryDialogProps) {
  const [apartment, setApartment] = useState("");
  const [authorizedBy, setAuthorizedBy] = useState("");
  const [colaborador, setColaborador] = useState("");
  const [errors, setErrors] = useState({ apartment: false, authorizedBy: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Verificar banimento quando o diálogo for aberto
  useEffect(() => {
    if (open && visitor.document) {
      checkBanStatus(visitor.document);
    }
  }, [open, visitor]);
  
  const checkBanStatus = async (document: string) => {
    try {
      const { data: bannedData } = await checkIfCpfIsBanned(document);
      
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
    } catch (err) {
      console.error('Erro ao verificar banimento:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se o visitante está banido
    if (isBanned) {
      toast({
        title: "Entrada não permitida",
        description: `Este visitante está banido. Motivo: ${banReason || "Não especificado"}`,
        variant: "destructive"
      });
      return;
    }
    
    // Validação reforçada
    const newErrors = {
      apartment: !apartment.trim(),
      authorizedBy: !authorizedBy.trim()
    };
    
    setErrors(newErrors);
    
    if (newErrors.apartment || newErrors.authorizedBy) {
      toast({
        title: "Preencha todos os campos",
        description: "Número do apartamento e morador que autorizou são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Verificar novamente se o visitante está banido
      const { data: bannedData } = await checkIfCpfIsBanned(visitor.document);
      if (bannedData) {
        setIsBanned(true);
        setBanReason(bannedData.reason || "Motivo não especificado");
        toast({
          title: "Entrada não permitida",
          description: `Este visitante está banido. Motivo: ${bannedData.reason || "Não especificado"}`,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Registrar no banco de dados
      const accessLogData = {
        visitorId: visitor.id.toString(),
        going_to_ap: apartment,
        authBy: authorizedBy,
        lastAccess: new Date().toISOString(),
        colaborador: colaborador || null
      };
      
      console.log("[DEBUG] Dados para registro de acesso rápido:", accessLogData);
      
      const { data, error } = await createAccessLog(accessLogData);
      
      if (error) {
        console.error("[DEBUG] Erro ao registrar entrada rápida:", error);
        throw new Error(`Erro ao registrar entrada: ${typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error)}`);
      }
      
      console.log("[DEBUG] Registro de acesso rápido criado:", data);
      
      // Chamar o callback com os dados
      onConfirm({
        apartment,
        authorizedByName: authorizedBy,
        colaborador: colaborador
      });

      // Reset form
      setApartment("");
      setAuthorizedBy("");
      setColaborador("");
      setErrors({ apartment: false, authorizedBy: false });
      onOpenChange(false);
      
    } catch (err) {
      console.error('[DEBUG] Erro ao registrar entrada rápida:', err);
      toast({
        title: "Erro ao registrar entrada",
        description: err instanceof Error ? err.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Entrada de Visitante</DialogTitle>
          <DialogDescription>
            Registrar entrada rápida para {visitor.name}
          </DialogDescription>
        </DialogHeader>
        
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
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                {visitor.photo ? (
                  <img src={visitor.photo} alt={visitor.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    {visitor.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium">{visitor.name}</h4>
                <p className="text-sm text-muted-foreground">Documento: {visitor.document}</p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="apartment">Apartamento que está visitando <span className="text-red-500">*</span></Label>
              <Input
                id="apartment"
                value={apartment}
                onChange={(e) => {
                  setApartment(e.target.value);
                  setErrors(prev => ({ ...prev, apartment: false }));
                }}
                placeholder="Ex: 101"
                required
                className={errors.apartment ? "border-red-500" : ""}
              />
              {errors.apartment && (
                <p className="text-sm text-red-500">Apartamento é obrigatório</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="resident">Morador que Liberou <span className="text-red-500">*</span></Label>
              <Input
                id="resident"
                value={authorizedBy}
                onChange={(e) => {
                  setAuthorizedBy(e.target.value);
                  setErrors(prev => ({ ...prev, authorizedBy: false }));
                }}
                placeholder="Digite o nome do morador que autorizou"
                required
                className={errors.authorizedBy ? "border-red-500" : ""}
              />
              {errors.authorizedBy && (
                <p className="text-sm text-red-500">Nome do morador é obrigatório</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="colaborador">Colaborador</Label>
              <Input
                id="colaborador"
                value={colaborador}
                onChange={(e) => setColaborador(e.target.value)}
                placeholder="Nome do colaborador"
              />
              <p className="text-xs text-muted-foreground">
                Informe o nome do colaborador que está liberando o visitante, se houver
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || isBanned}>
              {isLoading ? "Processando..." : "Confirmar Entrada"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
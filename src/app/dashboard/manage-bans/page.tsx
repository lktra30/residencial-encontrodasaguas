"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { getVisitors, updateVisitor, getVisitorByCpf } from "@/lib/supabase-api";
import Link from "next/link";
import { ArrowLeft, Ban, UserCheck, Search } from "lucide-react";

// Tipo para visitantes
interface Visitor {
  id: string;
  name: string;
  cpf: string;
  photo?: string;
  isBanned?: boolean;
  banReason?: string;
}

export default function ManageBansPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [cpfToBan, setCpfToBan] = useState("");
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banDialogMode, setBanDialogMode] = useState<"ban" | "unban">("ban");

  // Carregar visitantes
  useEffect(() => {
    const loadVisitors = async () => {
      setLoading(true);
      try {
        const { data, error } = await getVisitors();
        if (error) throw error;
        
        if (data) {
          setVisitors(data as Visitor[]);
          setFilteredVisitors(data as Visitor[]);
        }
      } catch (error) {
        console.error("Erro ao carregar visitantes:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de visitantes.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadVisitors();
  }, []);

  // Filtrar visitantes com base na pesquisa
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVisitors(visitors);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = visitors.filter(
        visitor => 
          visitor.name.toLowerCase().includes(query) || 
          visitor.cpf.toLowerCase().includes(query)
      );
      setFilteredVisitors(filtered);
    }
  }, [searchQuery, visitors]);

  // Abrir diálogo para banir um visitante por CPF
  const handleOpenBanByCpfDialog = () => {
    setBanDialogMode("ban");
    setCpfToBan("");
    setBanReason("");
    setSelectedVisitor(null);
    setBanDialogOpen(true);
  };

  // Abrir diálogo para banir um visitante existente
  const handleBanVisitor = (visitor: Visitor) => {
    setBanDialogMode("ban");
    setSelectedVisitor(visitor);
    setBanReason(visitor.banReason || "");
    setBanDialogOpen(true);
  };

  // Abrir diálogo para desbanir um visitante
  const handleUnbanVisitor = (visitor: Visitor) => {
    setBanDialogMode("unban");
    setSelectedVisitor(visitor);
    setBanDialogOpen(true);
  };

  // Buscar visitante pelo CPF
  const handleSearchVisitorByCpf = async () => {
    if (!cpfToBan || cpfToBan.length < 11) {
      toast({
        title: "CPF inválido",
        description: "Por favor, digite um CPF válido.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await getVisitorByCpf(cpfToBan);
      
      if (error) throw error;
      
      if (data) {
        setSelectedVisitor(data as Visitor);
        toast({
          title: "Visitante encontrado",
          description: `${data.name} foi encontrado.`
        });
      } else {
        toast({
          title: "Visitante não encontrado",
          description: "Nenhum visitante encontrado com este CPF."
        });
      }
    } catch (error) {
      console.error("Erro ao buscar visitante:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao buscar visitante pelo CPF.",
        variant: "destructive"
      });
    }
  };

  // Função para banir ou desbanir visitante
  const handleConfirmBanAction = async () => {
    try {
      if (banDialogMode === "ban") {
        // Banir visitante
        if (!selectedVisitor && cpfToBan) {
          // Tentando banir por CPF sem visitante selecionado
          const { data, error } = await getVisitorByCpf(cpfToBan);
          if (error) throw error;
          
          if (!data) {
            toast({
              title: "Erro",
              description: "Visitante não encontrado.",
              variant: "destructive"
            });
            return;
          }
          
          setSelectedVisitor(data as Visitor);
        }
        
        if (!selectedVisitor) {
          toast({
            title: "Erro",
            description: "Nenhum visitante selecionado para banir.",
            variant: "destructive"
          });
          return;
        }
        
        if (!banReason.trim()) {
          toast({
            title: "Motivo obrigatório",
            description: "Por favor, informe o motivo do banimento.",
            variant: "destructive"
          });
          return;
        }
        
        const { error } = await updateVisitor(selectedVisitor.id, {
          isBanned: true,
          banReason: banReason.trim()
        });
        
        if (error) throw error;
        
        // Atualizar lista de visitantes
        setVisitors(prevVisitors => 
          prevVisitors.map(v => 
            v.id === selectedVisitor.id 
              ? { ...v, isBanned: true, banReason: banReason.trim() } 
              : v
          )
        );
        
        toast({
          title: "Visitante banido",
          description: `${selectedVisitor.name} foi banido com sucesso.`
        });
      } else {
        // Desbanir visitante
        if (!selectedVisitor) {
          toast({
            title: "Erro",
            description: "Nenhum visitante selecionado para remover banimento.",
            variant: "destructive"
          });
          return;
        }
        
        const { error } = await updateVisitor(selectedVisitor.id, {
          isBanned: false,
          banReason: undefined
        });
        
        if (error) throw error;
        
        // Atualizar lista de visitantes
        setVisitors(prevVisitors => 
          prevVisitors.map(v => 
            v.id === selectedVisitor.id 
              ? { ...v, isBanned: false, banReason: undefined } 
              : v
          )
        );
        
        toast({
          title: "Banimento removido",
          description: `${selectedVisitor.name} não está mais banido.`
        });
      }
      
      // Fechar diálogo
      setBanDialogOpen(false);
      setSelectedVisitor(null);
      setCpfToBan("");
      setBanReason("");
    } catch (error) {
      console.error("Erro ao processar banimento:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar a solicitação.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" passHref>
          <Button
            variant="ghost"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Gerenciar Banimentos</h1>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Visitantes</CardTitle>
            <Button onClick={handleOpenBanByCpfDialog}>
              <Ban className="h-4 w-4 mr-2" />
              Bloquear por CPF/RG 
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome ou CPF..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="py-8 text-center">Carregando visitantes...</div>
          ) : filteredVisitors.length === 0 ? (
            <div className="py-8 text-center">Nenhum visitante encontrado.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Motivo do Bloqueio</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisitors.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell className="font-medium">{visitor.name}</TableCell>
                    <TableCell>{visitor.cpf}</TableCell>
                    <TableCell>
                      {visitor.isBanned ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Banido
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Liberado
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{visitor.isBanned ? visitor.banReason : "-"}</TableCell>
                    <TableCell className="text-right">
                      {visitor.isBanned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnbanVisitor(visitor)}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Desbanir
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBanVisitor(visitor)}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Banir
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Diálogo para banir/desbanir visitante */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {banDialogMode === "ban" 
                ? "Banir Visitante" 
                : "Remover Banimento"}
            </DialogTitle>
            <DialogDescription>
              {banDialogMode === "ban"
                ? "O visitante banido não poderá entrar no condomínio."
                : "Esta ação permitirá que o visitante volte a ter acesso ao condomínio."}
            </DialogDescription>
          </DialogHeader>
          
          {banDialogMode === "ban" && !selectedVisitor && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF do Visitante</Label>
                <div className="flex space-x-2">
                  <Input
                    id="cpf"
                    placeholder="Digite o CPF"
                    value={cpfToBan}
                    onChange={(e) => setCpfToBan(e.target.value)}
                  />
                  <Button onClick={handleSearchVisitorByCpf}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {selectedVisitor && (
            <div className="py-2">
              <p><strong>Nome:</strong> {selectedVisitor.name}</p>
              <p><strong>CPF:</strong> {selectedVisitor.cpf}</p>
            </div>
          )}
          
          {banDialogMode === "ban" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo do Banimento</Label>
              <Textarea
                id="reason"
                placeholder="Informe o motivo do banimento"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBanDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant={banDialogMode === "ban" ? "destructive" : "default"}
              onClick={handleConfirmBanAction}
              disabled={banDialogMode === "ban" && !selectedVisitor}
            >
              {banDialogMode === "ban" ? "Banir Visitante" : "Remover Banimento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
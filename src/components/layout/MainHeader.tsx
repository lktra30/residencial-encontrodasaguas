"use client";

import { useState } from "react";
import { Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { deleteCookie } from 'cookies-next';

export function MainHeader() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = () => {
    // Remover token de autenticação (usando cookies ou localStorage)
    localStorage.removeItem("isLoggedIn");
    deleteCookie('isLoggedIn');
    
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
    
    // Redirecionar para a página de login
    router.push("/login");
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          <span className="font-semibold">Residencial Encontro das Águas</span>
        </div>
        
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

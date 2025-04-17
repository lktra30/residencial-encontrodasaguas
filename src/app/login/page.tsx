"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { userCredentials } from "@/data/credentials";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { setCookie } from "cookies-next";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Verificação simples com as credenciais pré-definidas
    if (username === userCredentials.username && password === userCredentials.password) {
      // Simulando um tempo de carregamento
      setTimeout(() => {
        toast({
          title: "Login realizado com sucesso",
          description: "Redirecionando para o dashboard...",
        });
        
        // Armazenar estado de autenticação em cookie para o middleware
        setCookie('isLoggedIn', 'true', {
          maxAge: 60 * 60 * 24, // 1 dia
          path: '/',
        });
        
        // Também manter no localStorage para redundância
        localStorage.setItem("isLoggedIn", "true");
        
        // Redirecionar para a página principal
        router.push("/");
      }, 1000);
    } else {
      setLoading(false);
      setError("Credenciais inválidas. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Controle de Acesso
          </CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 font-medium">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Sistema de Controle de Acesso
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 
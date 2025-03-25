
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MainHeader } from "@/components/layout/MainHeader";
import { Toaster } from "@/components/ui/toaster";
import { BuildingRegistry } from "@/components/entrance-registry/BuildingRegistry";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <MainHeader />
      <main className="container mx-auto py-6 px-4 md:px-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold">Controle de Acesso ao Prédio</CardTitle>
            <CardDescription>
              Sistema de registro de entrada de visitantes e moradores
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <BuildingRegistry />
          </CardContent>
          <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sistema de Controle de Acesso
          </CardFooter>
        </Card>
      </main>
      <Toaster />
    </div>
  );
};

export default Index;

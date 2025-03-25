
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Dashboard from "@/components/dashboard/Dashboard";
import AccessLogs from "@/components/access-logs/AccessLogs";
import AccessCards from "@/components/access-cards/AccessCards";
import Settings from "@/components/settings/Settings";
import { MainHeader } from "@/components/layout/MainHeader";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background">
      <MainHeader />
      <main className="container mx-auto py-6 px-4 md:px-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold">Building Entrance Control System</CardTitle>
            <CardDescription>
              Manage access, view logs, and configure settings for your building entrance control system
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="access-logs">Access Logs</TabsTrigger>
                <TabsTrigger value="access-cards">Access Cards</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="dashboard">
                <Dashboard />
              </TabsContent>
              <TabsContent value="access-logs">
                <AccessLogs />
              </TabsContent>
              <TabsContent value="access-cards">
                <AccessCards />
              </TabsContent>
              <TabsContent value="settings">
                <Settings />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Building Entrance Control System
          </CardFooter>
        </Card>
      </main>
      <Toaster />
    </div>
  );
};

export default Index;

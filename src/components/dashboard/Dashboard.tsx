
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, Users, Clock, Info, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { AccessStatCard } from "./AccessStatCard";
import { RecentAccessList } from "./RecentAccessList";

// Mock data
const recentAccessData = [
  { id: 1, name: "John Smith", accessTime: "Just now", status: "granted", cardId: "A12345" },
  { id: 2, name: "Maria Garcia", accessTime: "5 minutes ago", status: "granted", cardId: "B67890" },
  { id: 3, name: "Unknown", accessTime: "20 minutes ago", status: "denied", cardId: "Unknown" },
  { id: 4, name: "Alex Johnson", accessTime: "1 hour ago", status: "granted", cardId: "C24680" },
  { id: 5, name: "Sarah Williams", accessTime: "2 hours ago", status: "granted", cardId: "D13579" },
];

const Dashboard = () => {
  const [doorStatus, setDoorStatus] = useState("locked");
  const [occupancy, setOccupancy] = useState(37);
  const [recentAccess, setRecentAccess] = useState(recentAccessData);
  const [systemStatus, setSystemStatus] = useState("online");
  const [accessStats, setAccessStats] = useState({
    today: 42,
    pending: 3,
    denied: 8,
    capacity: 150
  });

  const toggleDoor = () => {
    const newStatus = doorStatus === "locked" ? "unlocked" : "locked";
    setDoorStatus(newStatus);
    
    toast({
      title: `Door ${newStatus}`,
      description: `Main entrance has been ${newStatus}`,
      variant: newStatus === "unlocked" ? "default" : "destructive",
    });
    
    // Auto lock after 10 seconds if unlocked
    if (newStatus === "unlocked") {
      setTimeout(() => {
        setDoorStatus("locked");
        toast({
          title: "Door auto-locked",
          description: "Main entrance has been automatically locked",
          variant: "destructive",
        });
      }, 10000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AccessStatCard 
          title="Today's Access"
          value={accessStats.today}
          icon={Users}
          description="Total access events today"
        />
        <AccessStatCard 
          title="Pending Requests"
          value={accessStats.pending}
          icon={Clock}
          description="Awaiting approval"
          variant="warning"
        />
        <AccessStatCard 
          title="Access Denied"
          value={accessStats.denied}
          icon={AlertTriangle}
          description="Unauthorized attempts"
          variant="danger"
        />
        <AccessStatCard 
          title="Building Capacity"
          value={`${occupancy}/${accessStats.capacity}`}
          icon={Info}
          description="Current occupancy"
          progress={Math.round((occupancy / accessStats.capacity) * 100)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Main Entrance</span>
              <Badge variant={doorStatus === "locked" ? "destructive" : "default"}>
                {doorStatus === "locked" ? "Locked" : "Unlocked"}
              </Badge>
            </CardTitle>
            <CardDescription>Control the main entrance door</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-6">
              <Button
                size="lg" 
                variant={doorStatus === "locked" ? "outline" : "destructive"}
                className="flex items-center gap-2 h-16 px-8 rounded-full transition-all shadow-md hover:shadow-lg"
                onClick={toggleDoor}
              >
                {doorStatus === "locked" ? (
                  <>
                    <Unlock className="h-6 w-6" />
                    <span className="font-medium">Unlock Door</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-6 w-6" />
                    <span className="font-medium">Lock Door</span>
                  </>
                )}
              </Button>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>System Status</span>
                <span className="font-medium flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${systemStatus === "online" ? "bg-green-500" : "bg-red-500"}`}></span>
                  {systemStatus === "online" ? "Online" : "Offline"}
                </span>
              </div>
              <Progress value={systemStatus === "online" ? 100 : 0} className={systemStatus === "online" ? "bg-green-200" : "bg-red-200"} />
            </div>
          </CardContent>
        </Card>

        <RecentAccessList accessData={recentAccess} />
      </div>
    </div>
  );
};

export default Dashboard;

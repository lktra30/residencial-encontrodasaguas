import { useState } from "react";
import { Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
export function MainHeader() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([{
    id: 1,
    message: "Unauthorized access attempt",
    time: "10 minutes ago",
    read: false
  }, {
    id: 2,
    message: "New access card registered",
    time: "1 hour ago",
    read: false
  }, {
    id: 3,
    message: "System maintenance scheduled",
    time: "2 hours ago",
    read: true
  }]);
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({
      ...n,
      read: true
    })));
    toast({
      title: "Notifications",
      description: "All notifications marked as read"
    });
    setNotificationsOpen(false);
  };
  const unreadCount = notifications.filter(n => !n.read).length;
  return <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V9L14 3h-4z" />
            <path d="M14 3v6h6" />
            <path d="M12 18v-6" />
            <path d="M8 15h8" />
          </svg>
          <span className="font-semibold">Controle de Acesso Residencial Encontro das Águas</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {unreadCount}
                  </Badge>}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Notifications</DialogTitle>
                <DialogDescription>
                  Recent system notifications and alerts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-[300px] overflow-auto py-2">
                {notifications.map(notification => <div key={notification.id} className={`p-3 rounded-md ${notification.read ? 'bg-muted/50' : 'bg-muted'}`}>
                    <div className="font-medium">{notification.message}</div>
                    <div className="text-sm text-muted-foreground">{notification.time}</div>
                  </div>)}
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>;
}
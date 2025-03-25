
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Clock, Bell, Shield, Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  const handleSaveGeneral = () => {
    toast({
      title: "Settings Saved",
      description: "Your general settings have been updated successfully",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved",
    });
  };

  const handleSaveSecurity = () => {
    toast({
      title: "Security Settings Updated",
      description: "Your security settings have been updated successfully",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          System Settings
        </CardTitle>
        <CardDescription>
          Configure your entrance control system settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Building Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Update your building and system information
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buildingName">Building Name</Label>
                    <Input id="buildingName" defaultValue="Main Office Building" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" defaultValue="123 Main Street, City" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input id="contactPerson" defaultValue="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input id="contactEmail" type="email" defaultValue="john.doe@example.com" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Operating Hours
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Set when your building is open and accessible
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openingTime">Opening Time</Label>
                    <Input id="openingTime" type="time" defaultValue="08:00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closingTime">Closing Time</Label>
                    <Input id="closingTime" type="time" defaultValue="18:00" />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox id={day} defaultChecked />
                      <Label htmlFor={day}>{day}</Label>
                    </div>
                  ))}
                  {["Saturday", "Sunday"].map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox id={day} />
                      <Label htmlFor={day}>{day}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button onClick={handleSaveGeneral}>Save General Settings</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configure how and when you receive system notifications
                </p>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Email Notifications</h4>
                
                <div className="space-y-2">
                  {[
                    { id: "unauthorizedAccess", label: "Unauthorized access attempts" },
                    { id: "newCardRegistration", label: "New card registrations" },
                    { id: "cardDeactivation", label: "Card deactivations" },
                    { id: "systemMaintenance", label: "System maintenance alerts" },
                    { id: "dailyReports", label: "Daily access reports" }
                  ].map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox id={item.id} defaultChecked={["unauthorizedAccess", "systemMaintenance"].includes(item.id)} />
                      <Label htmlFor={item.id}>{item.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Notification Recipients</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="primaryEmail">Primary Email</Label>
                  <Input id="primaryEmail" type="email" defaultValue="admin@example.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondaryEmail">Secondary Email</Label>
                  <Input id="secondaryEmail" type="email" defaultValue="security@example.com" />
                </div>
              </div>
              
              <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="security">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configure security settings for your entrance control system
                </p>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Access Control</h4>
                
                <div className="space-y-2">
                  {[
                    { id: "autoLock", label: "Auto-lock doors after opening", description: "Automatically lock doors 30 seconds after being opened" },
                    { id: "multiFactorAuth", label: "Require multi-factor authentication for admin access", description: "Add an extra layer of security for administrative functions" },
                    { id: "loggingEnabled", label: "Enable comprehensive access logging", description: "Keep detailed logs of all access attempts" },
                    { id: "visitorsEscorted", label: "Require visitors to be escorted", description: "Visitor cards will trigger alerts if used without staff present" }
                  ].map((item) => (
                    <div key={item.id} className="flex items-start space-x-2">
                      <Checkbox id={item.id} defaultChecked={["autoLock", "loggingEnabled"].includes(item.id)} className="mt-1" />
                      <div>
                        <Label htmlFor={item.id}>{item.label}</Label>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Emergency Settings</h4>
                
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox id="emergencyUnlock" defaultChecked className="mt-1" />
                    <div>
                      <Label htmlFor="emergencyUnlock">Automatic emergency unlock</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically unlock all doors in case of fire alarm or emergency
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox id="emergencyNotifications" defaultChecked className="mt-1" />
                    <div>
                      <Label htmlFor="emergencyNotifications">Send emergency notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Alert all administrators in case of emergency events
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSaveSecurity}>Save Security Settings</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Settings;

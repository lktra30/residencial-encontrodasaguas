
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, CreditCard } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Mock data for access cards
const initialAccessCards = [
  { id: 1, cardId: "A12345", owner: "John Smith", status: "active", level: "Admin", issuedDate: "2023-01-15" },
  { id: 2, cardId: "B67890", owner: "Maria Garcia", status: "active", level: "Employee", issuedDate: "2023-02-20" },
  { id: 3, cardId: "C24680", owner: "Alex Johnson", status: "active", level: "Employee", issuedDate: "2023-03-05" },
  { id: 4, cardId: "D13579", owner: "Sarah Williams", status: "active", level: "Visitor", issuedDate: "2023-04-10" },
  { id: 5, cardId: "E11223", owner: "Robert Brown", status: "inactive", level: "Employee", issuedDate: "2023-05-15" },
];

const AccessCards = () => {
  const [accessCards, setAccessCards] = useState(initialAccessCards);
  const [newCardDialog, setNewCardDialog] = useState(false);
  const [formData, setFormData] = useState({
    cardId: "",
    owner: "",
    level: "Employee",
    status: "active"
  });

  const handleAddCard = () => {
    if (!formData.cardId || !formData.owner) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newCard = {
      id: accessCards.length + 1,
      cardId: formData.cardId,
      owner: formData.owner,
      status: formData.status,
      level: formData.level,
      issuedDate: new Date().toISOString().split('T')[0]
    };

    setAccessCards([...accessCards, newCard]);
    setNewCardDialog(false);
    
    toast({
      title: "Card Added",
      description: `Access card ${formData.cardId} has been created successfully`
    });

    // Reset form
    setFormData({
      cardId: "",
      owner: "",
      level: "Employee",
      status: "active"
    });
  };

  const handleToggleCardStatus = (id: number) => {
    setAccessCards(accessCards.map(card => {
      if (card.id === id) {
        const newStatus = card.status === "active" ? "inactive" : "active";
        
        toast({
          title: `Card ${newStatus === "active" ? "Activated" : "Deactivated"}`,
          description: `Card ${card.cardId} is now ${newStatus}`,
          variant: newStatus === "active" ? "default" : "destructive"
        });
        
        return { ...card, status: newStatus };
      }
      return card;
    }));
  };

  const handleDeleteCard = (id: number) => {
    const cardToDelete = accessCards.find(card => card.id === id);
    
    setAccessCards(accessCards.filter(card => card.id !== id));
    
    toast({
      title: "Card Deleted",
      description: `Access card ${cardToDelete?.cardId} has been deleted`,
      variant: "destructive"
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Access Cards</CardTitle>
          <CardDescription>Manage building access cards</CardDescription>
        </div>
        <Dialog open={newCardDialog} onOpenChange={setNewCardDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add New Card
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Access Card</DialogTitle>
              <DialogDescription>
                Create a new access card for building entry
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="cardId">Card ID</Label>
                <Input 
                  id="cardId" 
                  placeholder="Enter card ID" 
                  value={formData.cardId}
                  onChange={(e) => setFormData({...formData, cardId: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="owner">Owner Name</Label>
                <Input 
                  id="owner" 
                  placeholder="Enter owner name" 
                  value={formData.owner}
                  onChange={(e) => setFormData({...formData, owner: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="level">Access Level</Label>
                <select
                  id="level"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                >
                  <option value="Admin">Admin</option>
                  <option value="Employee">Employee</option>
                  <option value="Visitor">Visitor</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewCardDialog(false)}>Cancel</Button>
              <Button onClick={handleAddCard}>Create Card</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card ID</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issued Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessCards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    {card.cardId}
                  </TableCell>
                  <TableCell>{card.owner}</TableCell>
                  <TableCell>
                    <Badge variant={card.level === "Admin" ? "default" : card.level === "Visitor" ? "outline" : "secondary"}>
                      {card.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={card.status === "active" ? "default" : "destructive"}>
                      {card.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{card.issuedDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleToggleCardStatus(card.id)}>
                        {card.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(card.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessCards;

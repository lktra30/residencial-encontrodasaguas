
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, CheckCircle2, XCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data for access logs
const mockAccessLogs = [
  { id: 1, name: "John Smith", cardId: "A12345", timestamp: "2023-06-15 08:30:25", status: "granted", location: "Main Entrance" },
  { id: 2, name: "Maria Garcia", cardId: "B67890", timestamp: "2023-06-15 09:15:10", status: "granted", location: "Main Entrance" },
  { id: 3, name: "Unknown", cardId: "Unknown", timestamp: "2023-06-15 10:22:43", status: "denied", location: "Side Door" },
  { id: 4, name: "Alex Johnson", cardId: "C24680", timestamp: "2023-06-15 11:05:37", status: "granted", location: "Main Entrance" },
  { id: 5, name: "Sarah Williams", cardId: "D13579", timestamp: "2023-06-15 12:30:02", status: "granted", location: "Garage" },
  { id: 6, name: "Robert Brown", cardId: "E11223", timestamp: "2023-06-15 13:47:19", status: "granted", location: "Main Entrance" },
  { id: 7, name: "Lisa Martinez", cardId: "F45678", timestamp: "2023-06-15 14:22:51", status: "denied", location: "Side Door" },
  { id: 8, name: "David Wilson", cardId: "G98765", timestamp: "2023-06-15 15:10:33", status: "granted", location: "Main Entrance" },
  { id: 9, name: "Jennifer Lee", cardId: "H24680", timestamp: "2023-06-15 16:05:29", status: "granted", location: "Garage" },
  { id: 10, name: "Michael Taylor", cardId: "I13579", timestamp: "2023-06-15 17:30:47", status: "granted", location: "Main Entrance" },
];

const AccessLogs = () => {
  const [logs, setLogs] = useState(mockAccessLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const handleSearch = () => {
    let filteredLogs = mockAccessLogs;
    
    // Apply search term
    if (searchTerm) {
      filteredLogs = filteredLogs.filter(log => 
        log.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.cardId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filteredLogs = filteredLogs.filter(log => log.status === statusFilter);
    }
    
    // Apply location filter
    if (locationFilter !== "all") {
      filteredLogs = filteredLogs.filter(log => log.location === locationFilter);
    }
    
    setLogs(filteredLogs);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Access Logs</CardTitle>
        <CardDescription>Review all entrance access events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex flex-1 gap-2">
            <Input 
              placeholder="Search by name or card ID" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="granted">Granted</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Main Entrance">Main Entrance</SelectItem>
                <SelectItem value="Side Door">Side Door</SelectItem>
                <SelectItem value="Garage">Garage</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Card ID</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.name}</TableCell>
                    <TableCell>{log.cardId}</TableCell>
                    <TableCell>{log.timestamp}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {log.status === "granted" ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <Badge variant="default">Granted</Badge>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <Badge variant="destructive">Denied</Badge>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{log.location}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No access logs found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessLogs;

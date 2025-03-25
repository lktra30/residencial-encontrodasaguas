
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

interface AccessEvent {
  id: number;
  name: string;
  accessTime: string;
  status: "granted" | "denied";
  cardId: string;
}

interface RecentAccessListProps {
  accessData: AccessEvent[];
}

export function RecentAccessList({ accessData }: RecentAccessListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Access</CardTitle>
        <CardDescription>Latest entrance activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accessData.map((event) => (
            <div key={event.id} className="flex items-center gap-3 border-b pb-3 last:border-0">
              <div className={`flex-shrink-0 ${event.status === "granted" ? "text-green-500" : "text-red-500"}`}>
                {event.status === "granted" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              </div>
              <div className="flex-grow">
                <div className="font-medium">{event.name}</div>
                <div className="text-sm text-muted-foreground">Card ID: {event.cardId}</div>
              </div>
              <div className="text-sm text-muted-foreground">{event.accessTime}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

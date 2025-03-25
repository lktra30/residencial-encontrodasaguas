
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";

interface AccessStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  variant?: "default" | "warning" | "danger";
  progress?: number;
}

export function AccessStatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  variant = "default",
  progress 
}: AccessStatCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "warning":
        return "text-amber-600 bg-amber-50";
      case "danger":
        return "text-red-600 bg-red-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${getVariantClasses()}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription>{description}</CardDescription>
        {progress !== undefined && (
          <Progress value={progress} className="h-1 mt-2" />
        )}
      </CardContent>
    </Card>
  );
}

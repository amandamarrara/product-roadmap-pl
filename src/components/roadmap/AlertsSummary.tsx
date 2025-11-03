import { Bell, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AlertsPanel } from "./AlertsPanel";
import type { DateAlert } from "@/hooks/useDateAlerts";

interface AlertsSummaryProps {
  alerts: DateAlert[];
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalCount: number;
}

export function AlertsSummary({ 
  alerts, 
  criticalCount, 
  highCount, 
  mediumCount, 
  lowCount, 
  totalCount 
}: AlertsSummaryProps) {
  const hasUrgentAlerts = criticalCount > 0 || highCount > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant={hasUrgentAlerts ? "destructive" : "outline"} 
          size="sm" 
          className="relative"
        >
          {hasUrgentAlerts ? (
            <AlertTriangle className="h-4 w-4 mr-2" />
          ) : (
            <Bell className="h-4 w-4 mr-2" />
          )}
          Alertas
          {totalCount > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 h-5 px-1.5 text-xs"
            >
              {totalCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[400px] p-0" 
        align="end"
        side="bottom"
      >
        <AlertsPanel 
          alerts={alerts}
          criticalCount={criticalCount}
          highCount={highCount}
          mediumCount={mediumCount}
          lowCount={lowCount}
        />
      </PopoverContent>
    </Popover>
  );
}

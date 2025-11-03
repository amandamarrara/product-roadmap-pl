import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    <TooltipProvider>
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-4 w-4" />
                {totalCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={`absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px] ${
                      hasUrgentAlerts ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400' : ''
                    }`}
                  >
                    {totalCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">
              {totalCount > 0 ? `${totalCount} alerta${totalCount > 1 ? 's' : ''}` : 'Nenhum alerta'}
            </p>
          </TooltipContent>
        </Tooltip>
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
    </TooltipProvider>
  );
}

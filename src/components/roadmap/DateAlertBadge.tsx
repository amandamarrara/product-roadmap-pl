import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateAlertBadgeProps {
  daysUntil: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  className?: string;
  showIcon?: boolean;
}

export function DateAlertBadge({ daysUntil, urgency, className, showIcon = true }: DateAlertBadgeProps) {
  const getUrgencyColor = () => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-300/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-300/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-300/30';
      case 'low':
        return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-300/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getDaysText = () => {
    if (daysUntil === 0) return "Hoje";
    if (daysUntil === 1) return "Amanhã";
    if (daysUntil < 0) return `Venceu há ${Math.abs(daysUntil)} dias`;
    return `Em ${daysUntil} dias`;
  };

  const icon = urgency === 'critical' ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />;

  return (
    <Badge 
      variant="outline"
      className={cn(getUrgencyColor(), "gap-1 text-xs px-2 py-0.5", className)}
    >
      {showIcon && icon}
      {getDaysText()}
    </Badge>
  );
}

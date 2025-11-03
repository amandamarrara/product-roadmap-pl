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
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'high':
        return 'bg-orange-500 text-white hover:bg-orange-600';
      case 'medium':
        return 'bg-yellow-500 text-white hover:bg-yellow-600';
      case 'low':
        return 'bg-green-500 text-white hover:bg-green-600';
      default:
        return 'bg-gray-500 text-white';
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
      className={cn(getUrgencyColor(), "gap-1", className)}
    >
      {showIcon && icon}
      {getDaysText()}
    </Badge>
  );
}

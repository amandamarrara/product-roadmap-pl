import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Flag, Package, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateAlertBadge } from "./DateAlertBadge";
import type { DateAlert } from "@/hooks/useDateAlerts";
import { cn } from "@/lib/utils";

interface AlertsPanelProps {
  alerts: DateAlert[];
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export function AlertsPanel({ 
  alerts, 
  criticalCount, 
  highCount, 
  mediumCount, 
  lowCount 
}: AlertsPanelProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return <Flag className="h-4 w-4" />;
      case 'delivery':
        return <Package className="h-4 w-4" />;
      case 'sub-delivery':
        return <Package className="h-3.5 w-3.5" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'Marco';
      case 'delivery':
        return 'Entrega';
      case 'sub-delivery':
        return 'Sub-entrega';
      default:
        return type;
    }
  };

  const filterAlertsByUrgency = (urgency?: string) => {
    if (!urgency) return alerts;
    return alerts.filter(a => a.urgency === urgency);
  };

  const renderAlertCard = (alert: DateAlert) => (
    <Card 
      key={alert.id} 
      className={cn(
        "mb-2 hover:shadow-md transition-shadow border-l-4",
        alert.urgency === 'critical' && "border-l-red-500",
        alert.urgency === 'high' && "border-l-orange-500",
        alert.urgency === 'medium' && "border-l-yellow-500",
        alert.urgency === 'low' && "border-l-green-500"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getTypeIcon(alert.type)}
              <Badge variant="outline" className="text-xs">
                {getTypeLabel(alert.type)}
              </Badge>
            </div>
            <h4 className="font-medium text-sm mb-1 truncate">{alert.title}</h4>
            {alert.parentDelivery && (
              <p className="text-xs text-muted-foreground truncate">
                Entrega: {alert.parentDelivery}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{format(alert.date, "dd/MM/yyyy", { locale: ptBR })}</span>
            </div>
          </div>
          <DateAlertBadge 
            daysUntil={alert.daysUntil} 
            urgency={alert.urgency}
            showIcon={false}
          />
        </div>
      </CardContent>
    </Card>
  );

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-center text-sm">
          Nenhum alerta próximo
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[400px]">
      {/* Header */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Alertas de Prazos</h3>
          <div className="flex gap-1 text-xs text-muted-foreground">
            {criticalCount > 0 && (
              <span className="text-red-600 dark:text-red-400">{criticalCount}</span>
            )}
            {highCount > 0 && (
              <span className="text-orange-600 dark:text-orange-400">+{highCount}</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
          <TabsTrigger 
            value="all" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs px-3 py-2"
          >
            Todos ({alerts.length})
          </TabsTrigger>
          <TabsTrigger 
            value="critical" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs px-3 py-2"
          >
            Crítico ({criticalCount})
          </TabsTrigger>
          <TabsTrigger 
            value="high" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs px-3 py-2"
          >
            Alto ({highCount})
          </TabsTrigger>
          <TabsTrigger 
            value="medium" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs px-3 py-2"
          >
            Médio ({mediumCount})
          </TabsTrigger>
          <TabsTrigger 
            value="low" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs px-3 py-2"
          >
            Baixo ({lowCount})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="flex-1 m-0">
          <ScrollArea className="h-[280px]">
            <div className="p-3 space-y-2">
              {alerts.map(renderAlertCard)}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="critical" className="flex-1 m-0">
          <ScrollArea className="h-[280px]">
            <div className="p-3 space-y-2">
                {filterAlertsByUrgency('critical').length > 0 ? (
                  filterAlertsByUrgency('critical').map(renderAlertCard)
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    Nenhum alerta crítico
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="high" className="flex-1 m-0">
            <ScrollArea className="h-[280px]">
              <div className="p-3 space-y-2">
                {filterAlertsByUrgency('high').length > 0 ? (
                  filterAlertsByUrgency('high').map(renderAlertCard)
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    Nenhum alerta urgente
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="medium" className="flex-1 m-0">
            <ScrollArea className="h-[280px]">
              <div className="p-3 space-y-2">
                {filterAlertsByUrgency('medium').length > 0 ? (
                  filterAlertsByUrgency('medium').map(renderAlertCard)
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    Nenhum alerta médio
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="low" className="flex-1 m-0">
            <ScrollArea className="h-[280px]">
              <div className="p-3 space-y-2">
                {filterAlertsByUrgency('low').length > 0 ? (
                  filterAlertsByUrgency('low').map(renderAlertCard)
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    Nenhum alerta futuro
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    );
}

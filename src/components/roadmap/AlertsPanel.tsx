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
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-center">
            Nenhum alerta próximo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertas de Prazos
        </CardTitle>
        <div className="flex gap-2 flex-wrap mt-2">
          {criticalCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {criticalCount} crítico{criticalCount > 1 ? 's' : ''}
            </Badge>
          )}
          {highCount > 0 && (
            <Badge className="bg-orange-500 text-white text-xs">
              {highCount} urgente{highCount > 1 ? 's' : ''}
            </Badge>
          )}
          {mediumCount > 0 && (
            <Badge className="bg-yellow-500 text-white text-xs">
              {mediumCount} próximo{mediumCount > 1 ? 's' : ''}
            </Badge>
          )}
          {lowCount > 0 && (
            <Badge className="bg-green-500 text-white text-xs">
              {lowCount} futuro{lowCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="text-xs">
              Todos
            </TabsTrigger>
            <TabsTrigger value="critical" className="text-xs">
              Crítico
            </TabsTrigger>
            <TabsTrigger value="high" className="text-xs">
              Alto
            </TabsTrigger>
            <TabsTrigger value="medium" className="text-xs">
              Médio
            </TabsTrigger>
            <TabsTrigger value="low" className="text-xs">
              Baixo
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] mt-4">
            <TabsContent value="all" className="mt-0">
              {alerts.map(renderAlertCard)}
            </TabsContent>
            
            <TabsContent value="critical" className="mt-0">
              {filterAlertsByUrgency('critical').length > 0 ? (
                filterAlertsByUrgency('critical').map(renderAlertCard)
              ) : (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  Nenhum alerta crítico
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="high" className="mt-0">
              {filterAlertsByUrgency('high').length > 0 ? (
                filterAlertsByUrgency('high').map(renderAlertCard)
              ) : (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  Nenhum alerta urgente
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="medium" className="mt-0">
              {filterAlertsByUrgency('medium').length > 0 ? (
                filterAlertsByUrgency('medium').map(renderAlertCard)
              ) : (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  Nenhum alerta médio
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="low" className="mt-0">
              {filterAlertsByUrgency('low').length > 0 ? (
                filterAlertsByUrgency('low').map(renderAlertCard)
              ) : (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  Nenhum alerta futuro
                </p>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Users } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, isSameWeek, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Delivery } from "@/types/roadmap";
import { cn } from "@/lib/utils";
interface RoadmapTimelineProps {
  deliveries: Delivery[];
}
export function RoadmapTimeline({
  deliveries
}: RoadmapTimelineProps) {
  if (deliveries.length === 0) {
    return <Card className="shadow-card border-0">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-medium">Timeline vazia</h3>
            <p className="text-muted-foreground">Adicione entregas para visualizar o roadmap</p>
          </div>
        </CardContent>
      </Card>;
  }

  // Calculate timeline bounds
  const allDates = deliveries.flatMap(d => [d.startDate, d.endDate]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  const timelineStart = startOfWeek(minDate, {
    locale: ptBR
  });
  const timelineEnd = endOfWeek(maxDate, {
    locale: ptBR
  });
  const weeks = eachWeekOfInterval({
    start: timelineStart,
    end: timelineEnd
  });
  const totalDays = differenceInDays(timelineEnd, timelineStart);
  const getDeliveryPosition = (delivery: Delivery) => {
    const startOffset = differenceInDays(delivery.startDate, timelineStart);
    const duration = differenceInDays(delivery.endDate, delivery.startDate) + 1;
    return {
      left: `${startOffset / totalDays * 100}%`,
      width: `${duration / totalDays * 100}%`
    };
  };
  const getDeliveryColor = (delivery: Delivery) => {
    return delivery.deliveryColor || '#3b82f6';
  };
  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'Simples';
      case 'medium':
        return 'Médio';
      case 'complex':
        return 'Complexo';
      case 'very-complex':
        return 'Muito Complexo';
      default:
        return complexity;
    }
  };
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'Baixa';
      case 'medium':
        return 'Média';
      case 'high':
        return 'Alta';
      case 'critical':
        return 'Crítica';
      default:
        return priority;
    }
  };
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'not-started':
        return 'Não Iniciada';
      case 'in-progress':
        return 'Em Progresso';
      case 'completed':
        return 'Concluída';
      case 'blocked':
        return 'Bloqueada';
      default:
        return status;
    }
  };
  return <TooltipProvider>
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Timeline do Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timeline Header */}
          <div className="relative">
            <div className="flex border-b pb-2">
              {weeks.map((week, index) => <div key={week.getTime()} className="flex-1 text-center text-sm text-muted-foreground" style={{
              minWidth: `${100 / weeks.length}%`
            }}>
                  {format(week, "dd MMM", {
                locale: ptBR
              })}
                </div>)}
            </div>
          </div>

          {/* Timeline Bars */}
          <div className="space-y-4">
            {deliveries.map((delivery, index) => {
            const position = getDeliveryPosition(delivery);
            const deliveryColor = getDeliveryColor(delivery);
            return <div key={delivery.id} className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        
                        
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{delivery.progress}%</div>
                      <div className="text-muted-foreground">
                        {format(delivery.startDate, "dd/MM", {
                      locale: ptBR
                    })} - {format(delivery.endDate, "dd/MM", {
                      locale: ptBR
                    })}
                      </div>
                    </div>
                  </div>

                  {/* Timeline Bar */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative h-8 bg-muted/20 rounded-lg overflow-hidden cursor-pointer">
                        <div className="absolute top-0 h-full rounded-lg flex items-center px-2 transition-all duration-300" style={{
                      ...position,
                      backgroundColor: deliveryColor
                    }}>
                          <div className="flex items-center gap-2 text-white text-xs font-medium truncate">
                            <span className="truncate">{delivery.title}</span>
                            {delivery.subDeliveries.length > 0 && <Badge variant="secondary" className="bg-white/20 text-white text-xs px-1">
                                <Users className="h-3 w-3 mr-1" />
                                {delivery.subDeliveries.length}
                              </Badge>}
                          </div>
                        </div>

                        {/* Progress Overlay */}
                        <div className="absolute top-0 h-full bg-white/20 rounded-lg" style={{
                      ...position,
                      width: `${parseFloat(position.width.replace('%', '')) * delivery.progress / 100}%`
                    }} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <div className="font-semibold">{delivery.title}</div>
                        {delivery.description && <div className="text-sm text-muted-foreground">{delivery.description}</div>}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><strong>Team:</strong> {delivery.team}</div>
                          <div><strong>Responsável:</strong> {delivery.responsible}</div>
                          <div><strong>Prioridade:</strong> {getPriorityLabel(delivery.priority)}</div>
                          <div><strong>Complexidade:</strong> {getComplexityLabel(delivery.complexity)}</div>
                          <div><strong>Status:</strong> {getStatusLabel(delivery.status)}</div>
                          <div><strong>Progresso:</strong> {delivery.progress}%</div>
                        </div>
                        <div className="text-sm">
                          <strong>Período:</strong> {format(delivery.startDate, "dd/MM/yyyy")} - {format(delivery.endDate, "dd/MM/yyyy")}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  {/* Sub-deliveries */}
                  {delivery.subDeliveries.length > 0 && <div className="mt-2 ml-4 space-y-1">
                      {delivery.subDeliveries.slice(0, 3).map(sub => {
                  const subPosition = getDeliveryPosition({
                    ...delivery,
                    startDate: sub.startDate,
                    endDate: sub.endDate
                  });
                  return <Tooltip key={sub.id}>
                            <TooltipTrigger asChild>
                              <div className="relative cursor-pointer">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                  <span className="truncate">{sub.title}</span>
                                  <span>{sub.progress}%</span>
                                </div>
                                <div className="relative h-2 bg-muted/20 rounded">
                                  <div className="absolute top-0 h-full rounded" style={{
                            ...subPosition,
                            backgroundColor: `${deliveryColor}60`
                          }} />
                                  <div className="absolute top-0 h-full rounded" style={{
                            ...subPosition,
                            backgroundColor: deliveryColor,
                            width: `${parseFloat(subPosition.width.replace('%', '')) * sub.progress / 100}%`
                          }} />
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <div className="font-medium">{sub.title}</div>
                                {sub.description && <div className="text-xs text-muted-foreground">{sub.description}</div>}
                                <div className="text-xs">
                                  <div><strong>Responsável:</strong> {sub.responsible}</div>
                                  <div><strong>Progresso:</strong> {sub.progress}%</div>
                                  <div><strong>Período:</strong> {format(sub.startDate, "dd/MM/yyyy")} - {format(sub.endDate, "dd/MM/yyyy")}</div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>;
                })}
                      {delivery.subDeliveries.length > 3 && <div className="text-xs text-muted-foreground">
                          +{delivery.subDeliveries.length - 3} mais sub-entregas
                        </div>}
                    </div>}
                </div>;
          })}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>;
}
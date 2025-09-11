import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Users, MapPin, ExternalLink } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, eachDayOfInterval, isSameWeek, differenceInDays, differenceInWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Delivery, Milestone } from "@/types/roadmap";
import { cn } from "@/lib/utils";
interface RoadmapTimelineProps {
  deliveries: Delivery[];
  milestones?: Milestone[];
}
export function RoadmapTimeline({
  deliveries,
  milestones = []
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

  // Calculate timeline bounds including all sub-deliveries
  const allDates = [
    ...deliveries.flatMap(d => [
      d.startDate, 
      d.endDate,
      ...d.subDeliveries.flatMap(sub => [sub.startDate, sub.endDate])
    ]),
    ...milestones.map(m => m.date)
  ].filter(date => date && !isNaN(date.getTime())); // Filter out invalid dates
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  
  const timelineStart = minDate;
  const timelineEnd = maxDate;
  const totalDays = differenceInDays(timelineEnd, timelineStart);
  
  // Determine granularity based on timeline length
  const useDaily = totalDays <= 60;
  
  // Generate date headers based on granularity
  const dateHeaders = useDaily 
    ? eachDayOfInterval({ start: timelineStart, end: timelineEnd })
    : eachWeekOfInterval({
        start: startOfWeek(timelineStart, { locale: ptBR }),
        end: endOfWeek(timelineEnd, { locale: ptBR })
      });
  
  const totalUnits = useDaily ? totalDays : differenceInWeeks(endOfWeek(timelineEnd, { locale: ptBR }), startOfWeek(timelineStart, { locale: ptBR }));
  const getDeliveryPosition = (delivery: Delivery) => {
    const startOffset = useDaily 
      ? differenceInDays(delivery.startDate, timelineStart)
      : differenceInWeeks(delivery.startDate, startOfWeek(timelineStart, { locale: ptBR }));
    const duration = useDaily
      ? differenceInDays(delivery.endDate, delivery.startDate) + 1
      : differenceInWeeks(delivery.endDate, delivery.startDate);
    
    return {
      left: `${startOffset / totalUnits * 100}%`,
      width: `${Math.max(duration / totalUnits * 100, 1)}%`
    };
  };

  const getSubDeliveryPosition = (startDate: Date, endDate: Date) => {
    const startOffset = useDaily 
      ? differenceInDays(startDate, timelineStart)
      : differenceInWeeks(startDate, startOfWeek(timelineStart, { locale: ptBR }));
    const duration = useDaily
      ? differenceInDays(endDate, startDate) + 1
      : differenceInWeeks(endDate, startDate);
    
    return {
      left: `${startOffset / totalUnits * 100}%`,
      width: `${Math.max(duration / totalUnits * 100, useDaily ? 2 : 1)}%`
    };
  };
  const getDeliveryColor = (delivery: Delivery) => {
    return delivery.deliveryColor || '#3b82f6';
  };

  const getMilestonePosition = (milestone: Milestone) => {
    const unitOffset = useDaily
      ? differenceInDays(milestone.date, timelineStart)
      : differenceInWeeks(milestone.date, startOfWeek(timelineStart, { locale: ptBR }));
    return `${unitOffset / totalUnits * 100}%`;
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
            <div className={`flex border-b pb-2 ${useDaily ? 'overflow-x-auto' : ''}`}>
              {dateHeaders.map((date, index) => (
                <div 
                  key={date.getTime()} 
                  className="text-center text-sm text-muted-foreground flex-shrink-0" 
                  style={{
                    minWidth: useDaily ? '60px' : `${100 / dateHeaders.length}%`,
                    width: useDaily ? '60px' : `${100 / dateHeaders.length}%`
                  }}
                >
                  {format(date, useDaily ? "dd/MM" : "dd MMM", {
                    locale: ptBR
                  })}
                </div>
              ))}
            </div>
            
            {/* Milestone indicators in header */}
            {milestones.map(milestone => (
              <Tooltip key={milestone.id}>
                <TooltipTrigger asChild>
                  <div
                    className="absolute top-0 h-6 w-1 cursor-pointer z-10"
                    style={{
                      left: getMilestonePosition(milestone),
                      backgroundColor: milestone.color || '#ef4444'
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <div className="font-medium">{milestone.title}</div>
                    <div className="text-xs">{format(milestone.date, "dd/MM/yyyy", { locale: ptBR })}</div>
                    {milestone.description && (
                      <p className="text-xs text-muted-foreground">{milestone.description}</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Timeline Bars */}
          <div className="space-y-4 relative">
            {/* Milestone vertical lines */}
            {milestones.map(milestone => (
              <div
                key={`line-${milestone.id}`}
                className="absolute top-0 bottom-0 w-0.5 pointer-events-none z-20"
                style={{
                  left: getMilestonePosition(milestone),
                  backgroundColor: milestone.color || '#ef4444',
                  opacity: 0.8
                }}
              />
            ))}
            
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
                        <p className="text-sm text-muted-foreground">{delivery.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {delivery.deliveryPhase && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {delivery.deliveryPhase}
                            </div>
                          )}
                          <div className="text-xs">
                            <span className="font-medium">Prioridade:</span> {getPriorityLabel(delivery.priority)}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">Complexidade:</span> {getComplexityLabel(delivery.complexity)}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">Status:</span> {getStatusLabel(delivery.status)}
                          </div>
                          {delivery.jiraLink && (
                            <a
                              href={delivery.jiraLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Ver Épico
                            </a>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-xs">
                            <span className="font-medium">Progresso:</span> {delivery.progress}%
                          </div>
                          <div className="flex-1 bg-muted rounded-full h-1">
                            <div
                              className="h-1 rounded-full bg-primary"
                              style={{ width: `${delivery.progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          <div><span className="font-medium">Início:</span> {format(delivery.startDate, "dd/MM/yyyy")}</div>
                          <div><span className="font-medium">Fim:</span> {format(delivery.endDate, "dd/MM/yyyy")}</div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  {/* Sub-deliveries */}
                  {delivery.subDeliveries.length > 0 && <div className="mt-2 ml-4 space-y-1">
                      {delivery.subDeliveries.slice(0, 3).map(sub => {
                  const subPosition = getSubDeliveryPosition(sub.startDate, sub.endDate);
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
                                <p className="text-xs text-muted-foreground">{sub.description}</p>
                                <div className="flex flex-wrap gap-2 text-xs">
                                  <span><strong>Time:</strong> {sub.team}</span>
                                  <span><strong>Responsável:</strong> {sub.responsible}</span>
                                  <span><strong>Status:</strong> {getStatusLabel(sub.status)}</span>
                                  <span><strong>Progresso:</strong> {sub.progress}%</span>
                                  <span><strong>Início:</strong> {format(sub.startDate, "dd/MM")}</span>
                                  <span><strong>Fim:</strong> {format(sub.endDate, "dd/MM")}</span>
                                  {sub.jiraLink && (
                                    <a
                                      href={sub.jiraLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-primary hover:underline"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      Tarefa
                                    </a>
                                  )}
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
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarDays, Users, Link, ChevronDown, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, isSameWeek, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Delivery } from "@/types/roadmap";
import { cn } from "@/lib/utils";
import { DeliveryForm } from "./DeliveryForm";

interface RoadmapTimelineProps {
  deliveries: Delivery[];
  onEditDelivery?: (delivery: Delivery) => void;
  allDeliveries?: Delivery[];
}

export function RoadmapTimeline({ deliveries, onEditDelivery, allDeliveries = [] }: RoadmapTimelineProps) {
  const [editingDelivery, setEditingDelivery] = useState<Delivery | undefined>();
  const [expandedDeliveries, setExpandedDeliveries] = useState<Set<string>>(new Set());

  if (deliveries.length === 0) {
    return (
      <Card className="shadow-card border-0">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-medium">Timeline vazia</h3>
            <p className="text-muted-foreground">Adicione entregas para visualizar o roadmap</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate timeline bounds
  const allDates = deliveries.flatMap(d => [d.startDate, d.endDate]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  
  const timelineStart = startOfWeek(minDate, { locale: ptBR });
  const timelineEnd = endOfWeek(maxDate, { locale: ptBR });
  const weeks = eachWeekOfInterval({ start: timelineStart, end: timelineEnd });
  
  const totalDays = differenceInDays(timelineEnd, timelineStart);

  const getDeliveryPosition = (delivery: Delivery) => {
    const startOffset = differenceInDays(delivery.startDate, timelineStart);
    const duration = differenceInDays(delivery.endDate, delivery.startDate) + 1;
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-roadmap-low';
      case 'medium': return 'bg-roadmap-medium';
      case 'high': return 'bg-roadmap-high';
      case 'critical': return 'bg-roadmap-critical';
      default: return 'bg-muted';
    }
  };

  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'Simples';
      case 'medium': return 'Médio';
      case 'complex': return 'Complexo';
      case 'very-complex': return 'Muito Complexo';
      default: return complexity;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return priority;
    }
  };

  const handleBarClick = (delivery: Delivery) => {
    if (onEditDelivery) {
      onEditDelivery(delivery);
    } else {
      setEditingDelivery(delivery);
    }
  };

  const handleSaveDelivery = (deliveryData: Omit<Delivery, 'id'>) => {
    // This would be handled by the parent component in a real app
    setEditingDelivery(undefined);
  };

  const handleCancelEdit = () => {
    setEditingDelivery(undefined);
  };

  const toggleExpanded = (deliveryId: string) => {
    setExpandedDeliveries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deliveryId)) {
        newSet.delete(deliveryId);
      } else {
        newSet.add(deliveryId);
      }
      return newSet;
    });
  };

  const getLinkedDeliveries = (delivery: Delivery) => {
    return allDeliveries.filter(d => delivery.linkedDeliveries?.includes(d.id));
  };

  return (
    <div className="space-y-6">
      {editingDelivery && (
        <DeliveryForm
          delivery={editingDelivery}
          allDeliveries={allDeliveries}
          onSave={handleSaveDelivery}
          onCancel={handleCancelEdit}
        />
      )}
      
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
              {weeks.map((week, index) => (
                <div 
                  key={week.getTime()}
                  className="flex-1 text-center text-sm text-muted-foreground"
                  style={{ minWidth: `${100 / weeks.length}%` }}
                >
                  {format(week, "dd MMM", { locale: ptBR })}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Bars */}
          <TooltipProvider>
            <div className="space-y-4">
              {deliveries.map((delivery, index) => {
                const position = getDeliveryPosition(delivery);
                const linkedDeliveries = getLinkedDeliveries(delivery);
                const isExpanded = expandedDeliveries.has(delivery.id);
                
                return (
                  <div key={delivery.id} className="relative">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{delivery.title}</h4>
                          {linkedDeliveries.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(delivery.id)}
                              className="h-6 w-6 p-0"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          {linkedDeliveries.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Link className="h-3 w-3 mr-1" />
                              {linkedDeliveries.length}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge 
                            variant="secondary" 
                            className="bg-background/50"
                          >
                            {delivery.team}
                          </Badge>
                          <span>{delivery.responsible}</span>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">{delivery.progress}%</div>
                        <div className="text-muted-foreground">
                          {format(delivery.startDate, "dd/MM", { locale: ptBR })} - {format(delivery.endDate, "dd/MM", { locale: ptBR })}
                        </div>
                      </div>
                    </div>

                    {/* Timeline Bar */}
                    <div className="relative h-8 bg-muted/20 rounded-lg overflow-hidden">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "absolute top-0 h-full rounded-lg flex items-center px-2 transition-all duration-300 cursor-pointer hover:opacity-80",
                              getPriorityColor(delivery.priority)
                            )}
                            style={position}
                            onClick={() => handleBarClick(delivery)}
                          >
                            <div className="flex items-center gap-2 text-white text-xs font-medium truncate">
                              <span className="truncate">{delivery.title}</span>
                              {delivery.subDeliveries.length > 0 && (
                                <Badge variant="secondary" className="bg-white/20 text-white text-xs px-1">
                                  <Users className="h-3 w-3 mr-1" />
                                  {delivery.subDeliveries.length}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent 
                          side="top" 
                          className="max-w-xs p-3 bg-popover border shadow-lg"
                        >
                          <div className="space-y-2">
                            <div className="font-semibold">{delivery.title}</div>
                            {delivery.description && (
                              <div className="text-sm text-muted-foreground">{delivery.description}</div>
                            )}
                            <div className="flex flex-wrap gap-1 text-xs">
                              <Badge variant="secondary">{delivery.responsible}</Badge>
                              <Badge variant="secondary">{delivery.team}</Badge>
                              <Badge variant="secondary">{getComplexityLabel(delivery.complexity)}</Badge>
                              <Badge variant="secondary">{getPriorityLabel(delivery.priority)}</Badge>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>

                      {/* Progress Overlay */}
                      <div
                        className="absolute top-0 h-full bg-white/20 rounded-lg pointer-events-none"
                        style={{
                          ...position,
                          width: `${(parseFloat(position.width.replace('%', '')) * delivery.progress) / 100}%`
                        }}
                      />
                    </div>

                    {/* Linked Deliveries */}
                    {isExpanded && linkedDeliveries.length > 0 && (
                      <div className="mt-3 ml-6 p-3 bg-muted/20 rounded-lg space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Entregas Vinculadas:
                        </div>
                        {linkedDeliveries.map((linked) => (
                          <div key={linked.id} className="flex items-center gap-2 text-sm">
                            <Link className="h-3 w-3 text-muted-foreground" />
                            <span className="flex-1">{linked.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {linked.team}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sub-deliveries */}
                    {delivery.subDeliveries.length > 0 && (
                      <div className="mt-2 ml-4 space-y-1">
                        {delivery.subDeliveries.slice(0, 3).map((sub) => {
                          const subPosition = getDeliveryPosition({
                            ...delivery,
                            startDate: sub.startDate,
                            endDate: sub.endDate
                          });
                          
                          return (
                            <div key={sub.id} className="relative">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <span className="truncate">{sub.title}</span>
                                <span>{sub.progress}%</span>
                              </div>
                              <div className="relative h-2 bg-muted/20 rounded">
                                <div
                                  className="absolute top-0 h-full bg-primary/60 rounded"
                                  style={subPosition}
                                />
                                <div
                                  className="absolute top-0 h-full bg-primary rounded"
                                  style={{
                                    ...subPosition,
                                    width: `${(parseFloat(subPosition.width.replace('%', '')) * sub.progress) / 100}%`
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                        {delivery.subDeliveries.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{delivery.subDeliveries.length - 3} mais sub-entregas
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TooltipProvider>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-roadmap-low rounded" />
              <span>Baixa</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-roadmap-medium rounded" />
              <span>Média</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-roadmap-high rounded" />
              <span>Alta</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-roadmap-critical rounded" />
              <span>Crítica</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
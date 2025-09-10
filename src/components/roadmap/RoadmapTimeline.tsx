import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarDays, Link, ChevronDown, ChevronRight, Calendar } from "lucide-react";
import { format, differenceInDays, addDays, startOfMonth, eachMonthOfInterval, min, max } from "date-fns";
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

  // Group deliveries: main deliveries with their linked tasks
  const mainDeliveries = deliveries.filter(delivery => 
    !allDeliveries.some(other => other.linkedDeliveries?.includes(delivery.id))
  );

  const deliveriesWithLinked = mainDeliveries.map(delivery => ({
    main: delivery,
    linked: allDeliveries.filter(d => delivery.linkedDeliveries?.includes(d.id))
  }));

  // Calculate dynamic timeline bounds
  const allDates = deliveries.flatMap(d => [d.startDate, d.endDate]);
  const timelineStart = allDates.length > 0 ? min(allDates) : new Date();
  const timelineEnd = allDates.length > 0 ? max(allDates) : addDays(new Date(), 90);
  
  // Add some padding to the timeline
  const paddedStart = addDays(timelineStart, -7);
  const paddedEnd = addDays(timelineEnd, 7);
  
  const totalDays = differenceInDays(paddedEnd, paddedStart);
  
  // Generate month markers for the timeline
  const months = eachMonthOfInterval({ start: paddedStart, end: paddedEnd });

  const getDeliveryPosition = (delivery: Delivery) => {
    const startOffset = differenceInDays(delivery.startDate, paddedStart);
    const duration = differenceInDays(delivery.endDate, delivery.startDate) + 1;
    
    return {
      left: `${Math.max(0, (startOffset / totalDays) * 100)}%`,
      width: `${Math.min(100, (duration / totalDays) * 100)}%`
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'in-progress': return 'bg-blue-600';
      case 'blocked': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
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

  const handleCardClick = (delivery: Delivery) => {
    if (onEditDelivery) {
      onEditDelivery(delivery);
    } else {
      setEditingDelivery(delivery);
    }
  };

  const handleSaveDelivery = (deliveryData: Omit<Delivery, 'id'>) => {
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
            <Calendar className="h-5 w-5" />
            Roadmap de Entregas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timeline Headers - Dynamic months */}
          <div className="relative border-b pb-4">
            <div className="flex gap-1 overflow-x-auto">
              {months.map((month) => {
                const monthStart = startOfMonth(month);
                const monthOffset = differenceInDays(monthStart, paddedStart);
                const monthPosition = (monthOffset / totalDays) * 100;
                
                return (
                  <div 
                    key={month.getTime()}
                    className="flex-shrink-0 text-center min-w-[80px]"
                    style={{ 
                      position: 'absolute',
                      left: `${monthPosition}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className="text-sm font-semibold text-foreground">
                      {format(month, "MMM yyyy", { locale: ptBR })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Month dividers */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {months.slice(1).map((month) => {
                const monthStart = startOfMonth(month);
                const monthOffset = differenceInDays(monthStart, paddedStart);
                const monthPosition = (monthOffset / totalDays) * 100;
                
                return (
                  <div
                    key={month.getTime()}
                    className="absolute top-0 bottom-0 w-px bg-border/50"
                    style={{ left: `${monthPosition}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Main Deliveries with Linked Tasks */}
          <TooltipProvider>
            <div className="space-y-8">
              {deliveriesWithLinked.map(({ main, linked }) => (
                <div key={main.id} className="space-y-4">
                  {/* Main Delivery Header */}
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground text-lg">{main.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {linked.length > 0 ? `${linked.length + 1} tarefas` : '1 tarefa'}
                    </Badge>
                    <Badge 
                      className={cn(
                        "text-white text-xs",
                        getPriorityColor(main.priority)
                      )}
                    >
                      {getPriorityLabel(main.priority)}
                    </Badge>
                  </div>

                  {/* Main Delivery Lane */}
                  <div className="relative min-h-[100px] bg-muted/10 rounded-lg p-4">
                    {/* Month background dividers */}
                    <div className="absolute top-0 left-4 right-4 bottom-0 pointer-events-none">
                      {months.slice(1).map((month) => {
                        const monthStart = startOfMonth(month);
                        const monthOffset = differenceInDays(monthStart, paddedStart);
                        const monthPosition = (monthOffset / totalDays) * 100;
                        
                        return (
                          <div
                            key={month.getTime()}
                            className="absolute top-0 bottom-0 w-px bg-border/30"
                            style={{ left: `${monthPosition}%` }}
                          />
                        );
                      })}
                    </div>

                    {/* Main Delivery Card */}
                    <div className="relative mb-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "absolute h-16 rounded-lg flex items-center px-4 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105",
                              getStatusColor(main.status),
                              "text-white shadow-lg border-2 border-white/20"
                            )}
                            style={getDeliveryPosition(main)}
                            onClick={() => handleCardClick(main)}
                          >
                            <div className="flex items-center justify-between w-full min-w-0">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="font-semibold text-base truncate">
                                  {main.title}
                                </span>
                                {linked.length > 0 && (
                                  <Badge variant="secondary" className="bg-white/30 text-white text-xs">
                                    <Link className="h-3 w-3 mr-1" />
                                    {linked.length}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm font-bold">
                                {main.progress}%
                              </div>
                            </div>

                            {/* Progress overlay */}
                            <div
                              className="absolute top-0 left-0 h-full bg-white/30 rounded-lg pointer-events-none"
                              style={{
                                width: `${main.progress}%`
                              }}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent 
                          side="top" 
                          className="max-w-sm p-4 bg-popover border shadow-lg"
                        >
                          <div className="space-y-3">
                            <div className="font-semibold text-base">{main.title}</div>
                            {main.description && (
                              <div className="text-sm text-muted-foreground leading-relaxed">
                                {main.description}
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="font-medium">Responsável:</span>
                                <div>{main.responsible}</div>
                              </div>
                              <div>
                                <span className="font-medium">Team:</span>
                                <div>{main.team}</div>
                              </div>
                              <div>
                                <span className="font-medium">Complexidade:</span>
                                <div>{getComplexityLabel(main.complexity)}</div>
                              </div>
                              <div>
                                <span className="font-medium">Status:</span>
                                <div className="capitalize">{main.status}</div>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(main.startDate, "dd/MM/yyyy", { locale: ptBR })} - {format(main.endDate, "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Linked Tasks */}
                    {linked.length > 0 && (
                      <div className="space-y-2 ml-6">
                        <div className="text-sm font-medium text-muted-foreground mb-2">
                          Tarefas Vinculadas:
                        </div>
                        {linked.map((task) => (
                          <div key={task.id} className="relative">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "absolute h-10 rounded-md flex items-center px-3 transition-all duration-300 cursor-pointer",
                                    getStatusColor(task.status),
                                    "text-white shadow-sm opacity-90 hover:opacity-100 border border-white/20"
                                  )}
                                  style={getDeliveryPosition(task)}
                                  onClick={() => handleCardClick(task)}
                                >
                                  <div className="flex items-center gap-2 w-full min-w-0">
                                    <Link className="h-3 w-3 flex-shrink-0" />
                                    <span className="text-sm font-medium truncate flex-1">
                                      {task.title}
                                    </span>
                                    <span className="text-xs font-medium">
                                      {task.progress}%
                                    </span>
                                  </div>

                                  {/* Progress overlay */}
                                  <div
                                    className="absolute top-0 left-0 h-full bg-white/20 rounded-md pointer-events-none"
                                    style={{
                                      width: `${task.progress}%`
                                    }}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                className="max-w-sm p-4 bg-popover border shadow-lg"
                              >
                                <div className="space-y-2">
                                  <div className="font-semibold">{task.title}</div>
                                  {task.description && (
                                    <div className="text-sm text-muted-foreground">
                                      {task.description}
                                    </div>
                                  )}
                                  <div className="text-xs text-muted-foreground">
                                    {format(task.startDate, "dd/MM/yyyy", { locale: ptBR })} - {format(task.endDate, "dd/MM/yyyy", { locale: ptBR })}
                                  </div>
                                  <div className="text-xs">
                                    <span className="font-medium">Responsável:</span> {task.responsible}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}
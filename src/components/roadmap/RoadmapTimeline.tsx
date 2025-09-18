import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Users, MapPin, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, eachDayOfInterval, isSameWeek, differenceInDays, differenceInWeeks, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Delivery, Milestone } from "@/types/roadmap";
import { cn } from "@/lib/utils";
import { useRef, useCallback, useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableDelivery } from './DraggableDelivery';
import { DroppablePhase } from './DroppablePhase';
import { SortablePhase } from './SortablePhase';
import { reorderDeliveries, moveDeliveryToPhase, groupDeliveriesByPhase, sortDeliveriesByStartDate, reorderPhases, isDragPhase, getPhaseFromDragId, type DragEndEvent } from '@/lib/dragUtils';
import { useUpdateDeliveryOrder } from '@/hooks/useRoadmaps';

interface RoadmapTimelineProps {
  deliveries: Delivery[];
  milestones?: Milestone[];
  groupByPhase?: boolean;
  roadmapId?: string;
}

export function RoadmapTimeline({
  deliveries,
  milestones = [],
  groupByPhase = false,
  roadmapId
}: RoadmapTimelineProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [localDeliveries, setLocalDeliveries] = useState<Delivery[]>(sortDeliveriesByStartDate(deliveries));
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [activePhase, setActivePhase] = useState<string | null>(null);
  
  // Update local deliveries when prop changes
  useEffect(() => {
    setLocalDeliveries(sortDeliveriesByStartDate(deliveries));
  }, [deliveries]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update delivery order mutation
  const updateDeliveryOrder = useUpdateDeliveryOrder();

  // Scroll synchronization - moved before early return to maintain hook order
  const syncScroll = useCallback((source: 'header' | 'body') => {
    if (source === 'header' && headerRef.current && bodyRef.current) {
      bodyRef.current.scrollLeft = headerRef.current.scrollLeft;
    } else if (source === 'body' && headerRef.current && bodyRef.current) {
      headerRef.current.scrollLeft = bodyRef.current.scrollLeft;
    }
  }, []);

  // Group deliveries by phase and sort them
  const groupedDeliveries = useMemo(() => {
    if (!groupByPhase) {
      return { ungrouped: sortDeliveriesByStartDate(localDeliveries) };
    }
    
    return groupDeliveriesByPhase(localDeliveries);
  }, [localDeliveries, groupByPhase]);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveDelivery(null);
      setActivePhase(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    // Check if dragging phases
    if (isDragPhase(activeId) && isDragPhase(overId)) {
      const activePhaseKey = getPhaseFromDragId(activeId);
      const overPhaseKey = getPhaseFromDragId(overId);
      
      if (activePhaseKey !== overPhaseKey) {
        const reorderedGrouped = reorderPhases(groupedDeliveries, activePhaseKey, overPhaseKey);
        // Flatten back to deliveries array with new phase order preserved
        const reorderedDeliveries = Object.values(reorderedGrouped).flat();
        setLocalDeliveries(reorderedDeliveries);
        
        // Update in database
        if (roadmapId) {
          updateDeliveryOrder.mutate({ roadmapId, deliveries: reorderedDeliveries });
        }
      }
    } 
    // Check if dragging delivery to a different phase
    else if (String(overId).startsWith('phase-') && !isDragPhase(activeId)) {
      const targetPhase = String(overId).replace('phase-', '');
      const updatedDeliveries = moveDeliveryToPhase(localDeliveries, activeId, targetPhase);
      setLocalDeliveries(updatedDeliveries);
      
      // Update in database
      if (roadmapId) {
        updateDeliveryOrder.mutate({ roadmapId, deliveries: updatedDeliveries });
      }
    } 
    // Regular delivery reordering
    else if (activeId !== overId && !isDragPhase(activeId)) {
      const updatedDeliveries = reorderDeliveries(localDeliveries, activeId, overId);
      setLocalDeliveries(updatedDeliveries);
      
      // Update in database
      if (roadmapId) {
        updateDeliveryOrder.mutate({ roadmapId, deliveries: updatedDeliveries });
      }
    }
    
    setActiveDelivery(null);
    setActivePhase(null);
  }, [localDeliveries, groupedDeliveries, roadmapId, updateDeliveryOrder]);

  // Handle drag start
  const handleDragStart = useCallback((event: any) => {
    const activeId = event.active.id;
    
    if (isDragPhase(activeId)) {
      const phase = getPhaseFromDragId(activeId);
      setActivePhase(phase);
      setActiveDelivery(null);
    } else {
      const delivery = localDeliveries.find(d => d.id === String(activeId));
      setActiveDelivery(delivery || null);
      setActivePhase(null);
    }
  }, [localDeliveries]);

  // Toggle phase expansion
  const togglePhase = (phase: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phase)) {
      newExpanded.delete(phase);
    } else {
      newExpanded.add(phase);
    }
    setExpandedPhases(newExpanded);
  };

  // Initialize all phases as expanded on first render
  useState(() => {
    if (groupByPhase) {
      const phases = Object.keys(groupedDeliveries);
      setExpandedPhases(new Set(phases));
    }
  });

  if (localDeliveries.length === 0) {
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
    ...localDeliveries.flatMap(d => [
      d.startDate, 
      d.endDate,
      ...d.subDeliveries.flatMap(sub => [sub.startDate, sub.endDate])
    ]),
    ...milestones.map(m => m.date)
  ].filter(date => date && !isNaN(date.getTime())); // Filter out invalid dates
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  
  // Normalize dates to avoid timezone issues
  const timelineStart = startOfDay(minDate);
  const timelineEnd = startOfDay(maxDate);
  const totalDays = differenceInDays(timelineEnd, timelineStart);
  
  // Determine granularity based on timeline length
  const useDaily = totalDays <= 60;
  
  // Generate date headers based on granularity
  const dateHeaders = useDaily 
    ? eachDayOfInterval({ start: timelineStart, end: timelineEnd }).map(d => startOfDay(d))
    : eachWeekOfInterval({
        start: startOfWeek(timelineStart, { locale: ptBR }),
        end: endOfWeek(timelineEnd, { locale: ptBR })
      }).map(d => startOfDay(d));
  
  const totalUnits = Math.max(dateHeaders.length - 1, 1);
  
  // Timeline constants
  const CELL_WIDTH = 60;
  const trackWidthStyle = useDaily ? { width: `${dateHeaders.length * CELL_WIDTH}px` } : { width: '100%' };
  
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
    const normalizedMilestoneDate = startOfDay(milestone.date);
    
    if (useDaily) {
      const dayOffset = differenceInDays(normalizedMilestoneDate, timelineStart);
      return `${Math.max(0, Math.min(dayOffset / (dateHeaders.length - 1) * 100, 100))}%`;
    } else {
      // For weekly view, calculate exact day position and convert to fractional week position
      const dayOffset = differenceInDays(normalizedMilestoneDate, timelineStart);
      const weekOffset = dayOffset / 7;
      return `${Math.max(0, Math.min(weekOffset / (dateHeaders.length - 1) * 100, 100))}%`;
    }
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

  const renderDeliveryBar = (delivery: Delivery) => {
    const position = getDeliveryPosition(delivery);
    const deliveryColor = getDeliveryColor(delivery);
    
    return (
      <DraggableDelivery key={delivery.id} delivery={delivery}>
        <div className="relative">
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
              <div className="relative h-8 bg-muted/20 rounded-lg overflow-hidden cursor-pointer z-20">
                <div className="absolute top-0 h-full rounded-lg flex items-center px-2 transition-all duration-300 z-20" style={{
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
              {delivery.subDeliveries
                .sort((a, b) => {
                  // Handle sub-deliveries without start date (put them at the end)
                  if (!a.startDate && !b.startDate) return a.title.localeCompare(b.title);
                  if (!a.startDate) return 1;
                  if (!b.startDate) return -1;
                  
                  // Sort by start date (ascending)
                  const dateComparison = a.startDate.getTime() - b.startDate.getTime();
                  if (dateComparison !== 0) return dateComparison;
                  
                  // If same date, sort alphabetically by title
                  return a.title.localeCompare(b.title);
                })
                .slice(0, 3).map(sub => {
          const subPosition = getSubDeliveryPosition(sub.startDate, sub.endDate);
          return <Tooltip key={sub.id}>
                    <TooltipTrigger asChild>
                      <div className="relative cursor-pointer">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <span className="truncate">{sub.title}</span>
                          <span>{sub.progress}%</span>
                        </div>
                        <div className="relative h-2 bg-muted/20 rounded z-20">
                          <div className="absolute top-0 h-full rounded z-20" style={{
                    ...subPosition,
                    backgroundColor: `${deliveryColor}60`
                  }} />
                          <div className="absolute top-0 h-full rounded z-20" style={{
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
                  +{delivery.subDeliveries.length - 3} outras sub-entregas
                </div>}
            </div>}
        </div>
      </DraggableDelivery>
    );
  };

  return <TooltipProvider>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-4 w-4" />
              Timeline do Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timeline Header */}
            <div className="relative">
              <div 
                ref={headerRef}
                className={`sticky top-0 bg-background z-30 shadow-sm ${useDaily ? 'overflow-x-auto' : ''}`}
                onScroll={() => syncScroll('header')}
              >
                <div className="relative border-b pb-2" style={trackWidthStyle}>
                  <div className="flex">
                    {dateHeaders.map((date, index) => (
                      <div 
                        key={date.getTime()} 
                        className="text-center text-sm text-muted-foreground flex-shrink-0" 
                        style={{
                          minWidth: useDaily ? `${CELL_WIDTH}px` : `${100 / dateHeaders.length}%`,
                          width: useDaily ? `${CELL_WIDTH}px` : `${100 / dateHeaders.length}%`
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
                            backgroundColor: milestone.color || '#ef4444',
                            transform: 'translateX(-0.5px)'
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
              </div>
            </div>

            {/* Timeline Bars */}
            <div 
              ref={bodyRef}
              className={`space-y-4 ${useDaily ? 'overflow-x-auto' : ''} pl-8`}
              onScroll={() => syncScroll('body')}
            >
              <div className="relative space-y-4" style={trackWidthStyle}>
                {/* Milestone vertical lines */}
                {milestones.map(milestone => (
                  <div
                  key={`line-${milestone.id}`}
                  className="absolute top-0 bottom-0 w-0.5 pointer-events-none z-10"
                  style={{
                    left: getMilestonePosition(milestone),
                    backgroundColor: milestone.color || '#ef4444',
                    opacity: 0.8,
                    transform: 'translateX(-0.5px)'
                  }}
                />
              ))}
            
                {/* Render deliveries */}
                {groupByPhase ? (
                  // Grouped by phase with drag and drop for both phases and deliveries
                  <SortableContext 
                    items={Object.keys(groupedDeliveries).map(phase => `phase-${phase}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {Object.entries(groupedDeliveries).map(([phase, phaseDeliveries]) => (
                      <SortablePhase
                        key={phase}
                        phase={phase}
                        deliveries={phaseDeliveries}
                        isExpanded={expandedPhases.has(phase)}
                        onToggle={togglePhase}
                      >
                        {phaseDeliveries.map(renderDeliveryBar)}
                      </SortablePhase>
                    ))}
                  </SortableContext>
                ) : (
                  // Not grouped - show all deliveries with drag and drop
                  localDeliveries.map(renderDeliveryBar)
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <DragOverlay>
          {activeDelivery ? (
            <DraggableDelivery delivery={activeDelivery} isDragOverlay>
              {renderDeliveryBar(activeDelivery)}
            </DraggableDelivery>
          ) : activePhase ? (
            <SortablePhase
              phase={activePhase}
              deliveries={groupedDeliveries[activePhase] || []}
              isExpanded={expandedPhases.has(activePhase)}
              onToggle={() => {}}
              isDragOverlay
            >
              {(groupedDeliveries[activePhase] || []).map(renderDeliveryBar)}
            </SortablePhase>
          ) : null}
        </DragOverlay>
      </DndContext>
    </TooltipProvider>;
}
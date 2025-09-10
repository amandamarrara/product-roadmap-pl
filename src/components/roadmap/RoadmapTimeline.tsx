import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarDays, Link, ChevronDown, ChevronRight, Calendar } from "lucide-react";
import { format, startOfYear, endOfYear, eachQuarterOfInterval, startOfQuarter, endOfQuarter, differenceInDays, getQuarter } from "date-fns";
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

  // Group deliveries by team/category
  const deliveriesByCategory = deliveries.reduce((acc, delivery) => {
    const category = delivery.team || 'Sem Categoria';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(delivery);
    return acc;
  }, {} as Record<string, Delivery[]>);

  // Calculate timeline bounds by quarters
  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date(currentYear, 0, 1));
  const yearEnd = endOfYear(new Date(currentYear, 11, 31));
  const quarters = eachQuarterOfInterval({ start: yearStart, end: yearEnd });
  
  const totalDays = differenceInDays(yearEnd, yearStart);

  const getDeliveryPosition = (delivery: Delivery) => {
    const startOffset = differenceInDays(delivery.startDate, yearStart);
    const duration = differenceInDays(delivery.endDate, delivery.startDate) + 1;
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    };
  };

  const getCategoryColor = (teamName: string) => {
    const normalizedName = teamName.toLowerCase();
    if (normalizedName.includes('frontend') || normalizedName.includes('front')) return 'bg-category-frontend';
    if (normalizedName.includes('backend') || normalizedName.includes('back')) return 'bg-category-backend';
    if (normalizedName.includes('mobile') || normalizedName.includes('app')) return 'bg-category-mobile';
    if (normalizedName.includes('devops') || normalizedName.includes('infra')) return 'bg-category-devops';
    if (normalizedName.includes('design') || normalizedName.includes('ux')) return 'bg-category-design';
    if (normalizedName.includes('qa') || normalizedName.includes('test')) return 'bg-category-qa';
    if (normalizedName.includes('data') || normalizedName.includes('analy')) return 'bg-category-data';
    return 'bg-category-default';
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
            Roadmap por Categorias - {currentYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quarter Headers */}
          <div className="relative border-b pb-4">
            <div className="grid grid-cols-4 gap-1">
              {quarters.map((quarter, index) => (
                <div 
                  key={quarter.getTime()}
                  className="text-center"
                >
                  <div className="text-lg font-semibold text-foreground mb-1">
                    Q{index + 1} {currentYear}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(startOfQuarter(quarter), "MMM", { locale: ptBR })} - {format(endOfQuarter(quarter), "MMM", { locale: ptBR })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Quarter dividers */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {[25, 50, 75].map(position => (
                <div
                  key={position}
                  className="absolute top-0 bottom-0 w-px bg-border/50"
                  style={{ left: `${position}%` }}
                />
              ))}
            </div>
          </div>

          {/* Category Lanes */}
          <TooltipProvider>
            <div className="space-y-6">
              {Object.entries(deliveriesByCategory).map(([category, categoryDeliveries]) => (
                <div key={category} className="space-y-3">
                  {/* Category Header */}
                  <div className="flex items-center gap-3">
                    <div 
                      className={cn(
                        "w-4 h-4 rounded-full",
                        getCategoryColor(category)
                      )}
                    />
                    <h3 className="font-semibold text-foreground">{category}</h3>
                    <Badge variant="outline" className="text-xs">
                      {categoryDeliveries.length} {categoryDeliveries.length === 1 ? 'entrega' : 'entregas'}
                    </Badge>
                  </div>

                  {/* Category Lane */}
                  <div className="relative min-h-[80px] bg-muted/10 rounded-lg p-4">
                    {/* Quarter background dividers */}
                    <div className="absolute top-0 left-4 right-4 bottom-0 pointer-events-none">
                      {[25, 50, 75].map(position => (
                        <div
                          key={position}
                          className="absolute top-0 bottom-0 w-px bg-border/30"
                          style={{ left: `${position}%` }}
                        />
                      ))}
                    </div>

                    {/* Delivery Cards */}
                    {categoryDeliveries.map((delivery, index) => {
                      const position = getDeliveryPosition(delivery);
                      const linkedDeliveries = getLinkedDeliveries(delivery);
                      const isExpanded = expandedDeliveries.has(delivery.id);
                      
                      return (
                        <div 
                          key={delivery.id} 
                          className="relative mb-3 last:mb-0"
                          style={{ 
                            marginTop: index > 0 ? '8px' : '0'
                          }}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "absolute h-12 rounded-lg flex items-center px-3 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105",
                                  getCategoryColor(category),
                                  "text-white shadow-md"
                                )}
                                style={position}
                                onClick={() => handleCardClick(delivery)}
                              >
                                <div className="flex items-center justify-between w-full min-w-0">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="font-medium text-sm truncate">
                                      {delivery.title}
                                    </span>
                                    {linkedDeliveries.length > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleExpanded(delivery.id);
                                          }}
                                          className="h-6 w-6 p-0 text-white hover:bg-white/20"
                                        >
                                          {isExpanded ? (
                                            <ChevronDown className="h-3 w-3" />
                                          ) : (
                                            <ChevronRight className="h-3 w-3" />
                                          )}
                                        </Button>
                                        <Badge variant="secondary" className="bg-white/20 text-white text-xs px-1">
                                          <Link className="h-3 w-3 mr-1" />
                                          {linkedDeliveries.length}
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs font-medium">
                                    {delivery.progress}%
                                  </div>
                                </div>

                                {/* Progress overlay */}
                                <div
                                  className="absolute top-0 left-0 h-full bg-white/20 rounded-lg pointer-events-none"
                                  style={{
                                    width: `${delivery.progress}%`
                                  }}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="top" 
                              className="max-w-sm p-4 bg-popover border shadow-lg"
                            >
                              <div className="space-y-3">
                                <div className="font-semibold text-base">{delivery.title}</div>
                                {delivery.description && (
                                  <div className="text-sm text-muted-foreground leading-relaxed">
                                    {delivery.description}
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="font-medium">Responsável:</span>
                                    <div>{delivery.responsible}</div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Categoria:</span>
                                    <div>{delivery.team}</div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Complexidade:</span>
                                    <div>{getComplexityLabel(delivery.complexity)}</div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Prioridade:</span>
                                    <div>{getPriorityLabel(delivery.priority)}</div>
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(delivery.startDate, "dd/MM/yyyy", { locale: ptBR })} - {format(delivery.endDate, "dd/MM/yyyy", { locale: ptBR })}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>

                          {/* Linked Deliveries */}
                          {isExpanded && linkedDeliveries.length > 0 && (
                            <div className="mt-16 ml-6 space-y-2">
                              <div className="text-sm font-medium text-muted-foreground mb-2">
                                Entregas Vinculadas:
                              </div>
                              {linkedDeliveries.map((linked) => {
                                const linkedPosition = getDeliveryPosition(linked);
                                return (
                                  <div 
                                    key={linked.id} 
                                    className="relative"
                                  >
                                    <div
                                      className={cn(
                                        "absolute h-8 rounded-md flex items-center px-2 transition-all duration-300 cursor-pointer",
                                        getCategoryColor(linked.team),
                                        "text-white shadow-sm opacity-80 hover:opacity-100"
                                      )}
                                      style={linkedPosition}
                                      onClick={() => handleCardClick(linked)}
                                    >
                                      <div className="flex items-center gap-2 w-full">
                                        <Link className="h-3 w-3" />
                                        <span className="text-xs font-medium truncate">
                                          {linked.title}
                                        </span>
                                        <span className="text-xs ml-auto">
                                          {linked.progress}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </TooltipProvider>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <div className="text-sm font-medium text-muted-foreground mb-2 w-full">
              Categorias:
            </div>
            {Object.keys(deliveriesByCategory).map(category => (
              <div key={category} className="flex items-center gap-2 text-sm">
                <div className={cn("w-3 h-3 rounded-full", getCategoryColor(category))} />
                <span>{category}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
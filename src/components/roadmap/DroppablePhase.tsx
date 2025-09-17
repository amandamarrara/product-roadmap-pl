import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ChevronDown, ChevronRight, Users, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Delivery } from '@/types/roadmap';
import { cn } from '@/lib/utils';

interface DroppablePhaseProps {
  phase: string;
  deliveries: Delivery[];
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function DroppablePhase({ 
  phase, 
  deliveries, 
  isExpanded, 
  onToggle, 
  children 
}: DroppablePhaseProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `phase-${phase}`,
  });

  const totalDeliveries = deliveries.length;
  const completedDeliveries = deliveries.filter(d => d.status === 'completed').length;
  const avgProgress = totalDeliveries > 0 
    ? Math.round(deliveries.reduce((sum, d) => sum + d.progress, 0) / totalDeliveries)
    : 0;

  return (
    <div className="space-y-2">
      {/* Phase Header */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
        <Button
          variant="ghost" 
          size="sm"
          onClick={onToggle}
          className="flex items-center gap-2 h-auto p-0 hover:bg-transparent"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className="font-medium">{phase}</span>
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{completedDeliveries}/{totalDeliveries}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {avgProgress}%
          </Badge>
        </div>
      </div>

      {/* Droppable Area */}
      {isExpanded && (
        <div
          ref={setNodeRef}
          className={cn(
            "min-h-12 rounded-lg border-2 border-dashed transition-colors",
            isOver 
              ? "border-primary bg-primary/5" 
              : "border-transparent",
            totalDeliveries === 0 && "border-muted bg-muted/10"
          )}
        >
          <SortableContext 
            items={deliveries.map(d => d.id)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4 p-2">
              {children}
              {totalDeliveries === 0 && (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mr-2" />
                  <span>Arraste entregas para esta fase</span>
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      )}
    </div>
  );
}
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { DroppablePhase } from './DroppablePhase';
import type { Delivery } from '@/types/roadmap';
import { cn } from '@/lib/utils';

interface SortablePhaseProps {
  phase: string;
  deliveries: Delivery[];
  isExpanded: boolean;
  onToggle: (phase: string) => void;
  children: React.ReactNode;
  isDragOverlay?: boolean;
}

export function SortablePhase({ 
  phase, 
  deliveries, 
  isExpanded, 
  onToggle, 
  children, 
  isDragOverlay = false 
}: SortablePhaseProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `phase-${phase}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragOverlay) {
    return (
      <div className="transform rotate-1 opacity-95 shadow-xl">
        <DroppablePhase
          phase={phase}
          deliveries={deliveries}
          isExpanded={isExpanded}
          onToggle={() => onToggle(phase)}
        >
          {children}
        </DroppablePhase>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group mb-4",
        isDragging && "opacity-50 z-50"
      )}
    >
      {/* Phase Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20"
        title={`Arrastar fase: ${phase}`}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded bg-muted hover:bg-muted/80 border border-border">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      
      <DroppablePhase
        phase={phase}
        deliveries={deliveries}
        isExpanded={isExpanded}
        onToggle={() => onToggle(phase)}
      >
        {children}
      </DroppablePhase>
    </div>
  );
}
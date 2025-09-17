import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { Delivery } from '@/types/roadmap';
import { cn } from '@/lib/utils';

interface DraggableDeliveryProps {
  delivery: Delivery;
  children: React.ReactNode;
  isDragOverlay?: boolean;
}

export function DraggableDelivery({ delivery, children, isDragOverlay = false }: DraggableDeliveryProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: delivery.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragOverlay) {
    return (
      <div className="transform rotate-3 opacity-95">
        {children}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "opacity-50 z-50"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
      >
        <div className="flex items-center justify-center w-6 h-6 rounded bg-muted hover:bg-muted/80">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      {children}
    </div>
  );
}
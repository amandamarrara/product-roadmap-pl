import type { Delivery } from '@/types/roadmap';
import type { DragEndEvent as DndKitDragEndEvent } from '@dnd-kit/core';

export type DragEndEvent = DndKitDragEndEvent;

export function reorderDeliveries(
  deliveries: Delivery[],
  activeId: string | number,
  overId: string | number
): Delivery[] {
  const oldIndex = deliveries.findIndex(d => d.id === String(activeId));
  const newIndex = deliveries.findIndex(d => d.id === String(overId));
  
  if (oldIndex === -1 || newIndex === -1) return deliveries;
  
  const newDeliveries = [...deliveries];
  const [movedDelivery] = newDeliveries.splice(oldIndex, 1);
  newDeliveries.splice(newIndex, 0, movedDelivery);
  
  return newDeliveries;
}

export function moveDeliveryToPhase(
  deliveries: Delivery[],
  deliveryId: string | number,
  newPhase: string
): Delivery[] {
  return deliveries.map(delivery => 
    delivery.id === String(deliveryId)
      ? { ...delivery, deliveryPhase: newPhase === 'Sem Fase' ? undefined : newPhase }
      : delivery
  );
}

export function groupDeliveriesByPhase(deliveries: Delivery[]): { [key: string]: Delivery[] } {
  const grouped: { [key: string]: Delivery[] } = {};
  
  deliveries.forEach(delivery => {
    const phase = delivery.deliveryPhase || 'Sem Fase';
    if (!grouped[phase]) grouped[phase] = [];
    grouped[phase].push(delivery);
  });
  
  return grouped;
}

export function reorderPhases(
  groupedDeliveries: { [key: string]: Delivery[] },
  activePhase: string,
  overPhase: string
): { [key: string]: Delivery[] } {
  const phases = Object.keys(groupedDeliveries);
  const oldIndex = phases.indexOf(activePhase);
  const newIndex = phases.indexOf(overPhase);
  
  if (oldIndex === -1 || newIndex === -1) return groupedDeliveries;
  
  const newPhases = [...phases];
  const [movedPhase] = newPhases.splice(oldIndex, 1);
  newPhases.splice(newIndex, 0, movedPhase);
  
  // Rebuild grouped object in new order
  const reordered: { [key: string]: Delivery[] } = {};
  newPhases.forEach(phase => {
    reordered[phase] = groupedDeliveries[phase];
  });
  
  return reordered;
}
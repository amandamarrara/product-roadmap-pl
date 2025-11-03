import { useMemo } from 'react';
import { differenceInDays, startOfDay } from 'date-fns';
import type { Delivery, Milestone } from '@/types/roadmap';

export interface DateAlert {
  id: string;
  title: string;
  type: 'milestone' | 'delivery' | 'sub-delivery';
  date: Date;
  daysUntil: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  color?: string;
  parentDelivery?: string;
  status?: string;
}

export function useDateAlerts(deliveries: Delivery[], milestones: Milestone[] = []) {
  const alerts = useMemo(() => {
    const now = startOfDay(new Date());
    const allAlerts: DateAlert[] = [];

    // Process milestones
    milestones.forEach(milestone => {
      const daysUntil = differenceInDays(startOfDay(milestone.date), now);
      
      // Only include future milestones or those within 3 days past
      if (daysUntil >= -3) {
        allAlerts.push({
          id: milestone.id,
          title: milestone.title,
          type: 'milestone',
          date: milestone.date,
          daysUntil,
          urgency: getUrgency(daysUntil),
          color: milestone.color,
        });
      }
    });

    // Process deliveries
    deliveries.forEach(delivery => {
      // Skip completed deliveries
      if (delivery.status === 'completed') return;

      const daysUntil = differenceInDays(startOfDay(delivery.endDate), now);
      
      // Only include future deliveries or those within 3 days past
      if (daysUntil >= -3) {
        allAlerts.push({
          id: delivery.id,
          title: delivery.title,
          type: 'delivery',
          date: delivery.endDate,
          daysUntil,
          urgency: getUrgency(daysUntil),
          color: delivery.deliveryColor,
          status: delivery.status,
        });
      }

      // Process sub-deliveries
      delivery.subDeliveries.forEach(subDelivery => {
        // Skip completed sub-deliveries
        if (subDelivery.completed || subDelivery.status === 'completed') return;

        const subDaysUntil = differenceInDays(startOfDay(subDelivery.endDate), now);
        
        // Only include future sub-deliveries or those within 3 days past
        if (subDaysUntil >= -3) {
          allAlerts.push({
            id: subDelivery.id,
            title: subDelivery.title,
            type: 'sub-delivery',
            date: subDelivery.endDate,
            daysUntil: subDaysUntil,
            urgency: getUrgency(subDaysUntil),
            parentDelivery: delivery.title,
            status: subDelivery.status,
          });
        }
      });
    });

    // Sort by urgency first, then by days until
    return allAlerts.sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      return a.daysUntil - b.daysUntil;
    });
  }, [deliveries, milestones]);

  const criticalCount = alerts.filter(a => a.urgency === 'critical').length;
  const highCount = alerts.filter(a => a.urgency === 'high').length;
  const mediumCount = alerts.filter(a => a.urgency === 'medium').length;
  const lowCount = alerts.filter(a => a.urgency === 'low').length;

  return {
    alerts,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    totalCount: alerts.length,
  };
}

function getUrgency(daysUntil: number): 'critical' | 'high' | 'medium' | 'low' {
  if (daysUntil <= 3) return 'critical';
  if (daysUntil <= 7) return 'high';
  if (daysUntil <= 14) return 'medium';
  return 'low';
}

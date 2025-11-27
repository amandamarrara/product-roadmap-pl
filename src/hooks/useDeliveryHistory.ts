import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HistoryRecord {
  id: string;
  user_id: string;
  user_email: string | null;
  action: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

// Hook para buscar histórico de entregas
export function useDeliveryHistory(deliveryId: string | null) {
  return useQuery({
    queryKey: ['delivery-history', deliveryId],
    queryFn: async () => {
      if (!deliveryId) return [];
      
      const { data, error } = await supabase
        .from('delivery_history')
        .select('*')
        .eq('delivery_id', deliveryId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as HistoryRecord[];
    },
    enabled: !!deliveryId
  });
}

// Hook para buscar histórico de sub-entregas
export function useSubDeliveryHistory(subDeliveryId: string | null) {
  return useQuery({
    queryKey: ['sub-delivery-history', subDeliveryId],
    queryFn: async () => {
      if (!subDeliveryId) return [];
      
      const { data, error } = await supabase
        .from('sub_delivery_history')
        .select('*')
        .eq('sub_delivery_id', subDeliveryId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as HistoryRecord[];
    },
    enabled: !!subDeliveryId
  });
}

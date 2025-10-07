import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Delivery, SubDelivery } from '@/types/roadmap';

export function useUpdateDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roadmapId, delivery }: { roadmapId: string; delivery: Delivery }) => {
      console.log('Iniciando atualização da entrega:', { roadmapId, deliveryId: delivery.id });
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      console.log('Usuário autenticado:', user.user.id);

      // Update delivery
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .update({
          title: delivery.title,
          description: delivery.description,
          start_date: delivery.startDate.toISOString().split('T')[0],
          end_date: delivery.endDate.toISOString().split('T')[0],
          complexity: delivery.complexity,
          priority: delivery.priority,
          delivery_color: delivery.deliveryColor,
          delivery_phase: delivery.deliveryPhase,
          responsible: delivery.responsible,
          jira_link: delivery.jiraLink,
          status: delivery.status,
          progress: delivery.progress,
          user_id: user.user.id
        })
        .eq('id', delivery.id)
        .eq('roadmap_id', roadmapId);

      if (deliveryError) throw deliveryError;

      // Delete existing sub-deliveries
      await supabase
        .from('sub_deliveries')
        .delete()
        .eq('delivery_id', delivery.id);

      // Insert updated sub-deliveries
      if (delivery.subDeliveries.length > 0) {
        const { error: subDeliveriesError } = await supabase
          .from('sub_deliveries')
          .insert(
            delivery.subDeliveries.map(sub => ({
              id: sub.id,
              delivery_id: delivery.id,
              title: sub.title,
              description: sub.description,
              start_date: sub.startDate ? sub.startDate.toISOString().split('T')[0] : null,
              end_date: sub.endDate ? sub.endDate.toISOString().split('T')[0] : null,
              team: sub.team,
              responsible: sub.responsible,
              completed: sub.completed,
              progress: sub.progress,
              status: sub.status,
              jira_link: sub.jiraLink,
              user_id: user.user.id
            }))
          );

        if (subDeliveriesError) throw subDeliveriesError;
      }

      return delivery;
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      await queryClient.invalidateQueries({ queryKey: ['roadmap', variables.roadmapId] });
      await queryClient.refetchQueries({ queryKey: ['roadmap', variables.roadmapId] });
      toast.success('Entrega atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro detalhado ao atualizar entrega:', error);
      console.error('Error message:', error.message);
      console.error('Error details:', error);
      toast.error(`Erro ao atualizar entrega: ${error.message || 'Tente novamente.'}`);
    }
  });
}

export function useUpdateSubDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roadmapId, deliveryId, subDelivery }: { 
      roadmapId: string; 
      deliveryId: string; 
      subDelivery: SubDelivery;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('sub_deliveries')
        .update({
          title: subDelivery.title,
          description: subDelivery.description,
          start_date: subDelivery.startDate ? subDelivery.startDate.toISOString().split('T')[0] : null,
          end_date: subDelivery.endDate ? subDelivery.endDate.toISOString().split('T')[0] : null,
          team: subDelivery.team,
          responsible: subDelivery.responsible,
          completed: subDelivery.completed,
          progress: subDelivery.progress,
          status: subDelivery.status,
          jira_link: subDelivery.jiraLink,
          user_id: user.user.id
        })
        .eq('id', subDelivery.id)
        .eq('delivery_id', deliveryId);

      if (error) throw error;

      return subDelivery;
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      await queryClient.invalidateQueries({ queryKey: ['roadmap', variables.roadmapId] });
      await queryClient.refetchQueries({ queryKey: ['roadmap', variables.roadmapId] });
      toast.success('Sub-entrega atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating sub-delivery:', error);
      toast.error('Erro ao atualizar sub-entrega. Tente novamente.');
    }
  });
}

export function useDeleteDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roadmapId, deliveryId }: { roadmapId: string; deliveryId: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Delete sub-deliveries first (cascade should handle this, but being explicit)
      await supabase
        .from('sub_deliveries')
        .delete()
        .eq('delivery_id', deliveryId);

      // Delete delivery comments
      await supabase
        .from('delivery_comments')
        .delete()
        .eq('delivery_id', deliveryId);

      // Delete delivery
      const { error } = await supabase
        .from('deliveries')
        .delete()
        .eq('id', deliveryId)
        .eq('roadmap_id', roadmapId);

      if (error) throw error;

      return deliveryId;
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      await queryClient.invalidateQueries({ queryKey: ['roadmap', variables.roadmapId] });
      toast.success('Entrega excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting delivery:', error);
      toast.error('Erro ao excluir entrega. Tente novamente.');
    }
  });
}

export function useDeleteSubDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subDeliveryId }: { subDeliveryId: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Delete sub-delivery comments
      await supabase
        .from('delivery_comments')
        .delete()
        .eq('sub_delivery_id', subDeliveryId);

      // Delete sub-delivery
      const { error } = await supabase
        .from('sub_deliveries')
        .delete()
        .eq('id', subDeliveryId);

      if (error) throw error;

      return subDeliveryId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      toast.success('Sub-entrega excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting sub-delivery:', error);
      toast.error('Erro ao excluir sub-entrega. Tente novamente.');
    }
  });
}
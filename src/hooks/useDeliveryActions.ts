import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Delivery, SubDelivery } from '@/types/roadmap';

export function useCreateDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roadmapId, delivery }: { roadmapId: string; delivery: Omit<Delivery, 'id'> }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      console.log('➕ Creating new delivery:', delivery.title);

      // Insert delivery
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('deliveries')
        .insert({
          roadmap_id: roadmapId,
          user_id: user.user.id,
          title: delivery.title,
          description: delivery.description,
          start_date: delivery.startDate.toISOString().split('T')[0],
          end_date: delivery.endDate.toISOString().split('T')[0],
          actual_end_date: delivery.actualEndDate ? delivery.actualEndDate.toISOString().split('T')[0] : null,
          complexity: delivery.complexity,
          priority: delivery.priority,
          delivery_color: delivery.deliveryColor,
          delivery_phase: delivery.deliveryPhase,
          responsible: delivery.responsible,
          jira_link: delivery.jiraLink,
          status: delivery.status,
          progress: delivery.progress
        })
        .select()
        .single();

      if (deliveryError) throw deliveryError;
      
      console.log('✅ Delivery created:', deliveryData.id);

      // Insert sub-deliveries if any
      if (delivery.subDeliveries && delivery.subDeliveries.length > 0) {
        const { error: subDeliveriesError } = await supabase
          .from('sub_deliveries')
          .insert(
            delivery.subDeliveries.map(sub => ({
              delivery_id: deliveryData.id,
              title: sub.title,
              description: sub.description,
              start_date: sub.startDate ? sub.startDate.toISOString().split('T')[0] : null,
              end_date: sub.endDate ? sub.endDate.toISOString().split('T')[0] : null,
              actual_end_date: sub.actualEndDate ? sub.actualEndDate.toISOString().split('T')[0] : null,
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

      return deliveryData;
    },
    onSuccess: async (_data, variables) => {
      console.log('✅ New delivery saved successfully');
      
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      await queryClient.invalidateQueries({ queryKey: ['roadmap', variables.roadmapId] });
      
      // ✅ Wait for DB to process
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // ✅ Force refetch to ensure UI is updated
      await queryClient.refetchQueries({ queryKey: ['roadmap', variables.roadmapId] });
      
      toast.success('Entrega criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating delivery:', error);
      toast.error('Erro ao criar entrega. Tente novamente.');
    }
  });
}

export function useUpdateDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roadmapId, delivery }: { roadmapId: string; delivery: Delivery }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      console.log('🔄 Updating delivery:', {
        id: delivery.id,
        startDate: delivery.startDate.toISOString().split('T')[0],
        endDate: delivery.endDate.toISOString().split('T')[0],
        title: delivery.title
      });

      // Update delivery with .select() to confirm
      const { data: updatedDelivery, error: deliveryError } = await supabase
        .from('deliveries')
        .update({
          title: delivery.title,
          description: delivery.description,
          start_date: delivery.startDate.toISOString().split('T')[0],
          end_date: delivery.endDate.toISOString().split('T')[0],
          actual_end_date: delivery.actualEndDate ? delivery.actualEndDate.toISOString().split('T')[0] : null,
          complexity: delivery.complexity,
          priority: delivery.priority,
          delivery_color: delivery.deliveryColor,
          delivery_phase: delivery.deliveryPhase,
          responsible: delivery.responsible,
          jira_link: delivery.jiraLink,
          status: delivery.status,
          progress: delivery.progress
        })
        .eq('id', delivery.id)
        .eq('roadmap_id', roadmapId)
        .select()
        .single();

      if (deliveryError) throw deliveryError;
      
      if (!updatedDelivery) {
        throw new Error("Nenhuma entrega foi atualizada. Verifique as permissões.");
      }
      
      console.log('✅ Delivery updated successfully:', updatedDelivery);

      // Delete existing sub-deliveries
      await supabase
        .from('sub_deliveries')
        .delete()
        .eq('delivery_id', delivery.id);

      // Insert updated sub-deliveries
      if (delivery.subDeliveries.length > 0) {
        // Get original delivery user_id to maintain ownership
        const { data: originalDelivery } = await supabase
          .from('deliveries')
          .select('user_id')
          .eq('id', delivery.id)
          .single();

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
              actual_end_date: sub.actualEndDate ? sub.actualEndDate.toISOString().split('T')[0] : null,
              team: sub.team,
              responsible: sub.responsible,
              completed: sub.completed,
              progress: sub.progress,
              status: sub.status,
              jira_link: sub.jiraLink,
              user_id: originalDelivery?.user_id || user.user.id
            }))
          );

        if (subDeliveriesError) throw subDeliveriesError;
      }

      return delivery;
    },
    onSuccess: async (_data, variables) => {
      console.log('🔄 Invalidating queries and refetching...');
      await queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      await queryClient.invalidateQueries({ queryKey: ['roadmap', variables.roadmapId] });
      
      // Add small delay to ensure DB processed the update
      await new Promise(resolve => setTimeout(resolve, 100));
      await queryClient.refetchQueries({ queryKey: ['roadmap', variables.roadmapId] });
      
      console.log('✅ Queries refetched successfully');
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

      console.log('🔄 Updating sub-delivery:', {
        id: subDelivery.id,
        startDate: subDelivery.startDate ? subDelivery.startDate.toISOString().split('T')[0] : null,
        endDate: subDelivery.endDate ? subDelivery.endDate.toISOString().split('T')[0] : null,
        title: subDelivery.title
      });

      const { data: updated, error } = await supabase
        .from('sub_deliveries')
        .update({
          title: subDelivery.title,
          description: subDelivery.description,
          start_date: subDelivery.startDate ? subDelivery.startDate.toISOString().split('T')[0] : null,
          end_date: subDelivery.endDate ? subDelivery.endDate.toISOString().split('T')[0] : null,
          actual_end_date: subDelivery.actualEndDate ? subDelivery.actualEndDate.toISOString().split('T')[0] : null,
          team: subDelivery.team,
          responsible: subDelivery.responsible,
          completed: subDelivery.completed,
          progress: subDelivery.progress,
          status: subDelivery.status,
          jira_link: subDelivery.jiraLink
        })
        .eq('id', subDelivery.id)
        .eq('delivery_id', deliveryId)
        .select()
        .single();

      if (error) throw error;
      
      if (!updated) {
        throw new Error("Nenhuma sub-entrega foi atualizada. Verifique as permissões.");
      }
      
      console.log('✅ Sub-delivery updated successfully:', updated);

      return subDelivery;
    },
    onSuccess: async (_data, variables) => {
      console.log('🔄 Invalidating queries and refetching sub-delivery...');
      await queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      await queryClient.invalidateQueries({ queryKey: ['roadmap', variables.roadmapId] });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await queryClient.refetchQueries({ queryKey: ['roadmap', variables.roadmapId] });
      
      console.log('✅ Sub-delivery queries refetched successfully');
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
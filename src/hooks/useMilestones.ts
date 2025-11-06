import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Milestone } from "@/types/roadmap";
import { useToast } from "@/hooks/use-toast";
import { parseISO } from "date-fns";

export function useMilestones(roadmapId?: string) {
  return useQuery({
    queryKey: ["milestones", roadmapId],
    queryFn: async () => {
      if (!roadmapId) return [];
      
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("roadmap_id", roadmapId)
        .order("date", { ascending: true });

      if (error) throw error;

      return data.map(milestone => ({
        ...milestone,
        date: parseISO(milestone.date),
        endDate: milestone.end_date ? parseISO(milestone.end_date) : undefined,
        isPeriod: milestone.is_period || false,
      })) as Milestone[];
    },
    enabled: !!roadmapId
  });
}

export function useSaveMilestone() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ roadmapId, milestone }: { roadmapId: string; milestone: Omit<Milestone, 'id'> }) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Usuário não autenticado");
      }

      const milestoneData = {
        roadmap_id: roadmapId,
        user_id: user.id,
        title: milestone.title,
        description: milestone.description,
        date: milestone.date.toISOString().split('T')[0],
        end_date: milestone.endDate ? milestone.endDate.toISOString().split('T')[0] : null,
        is_period: milestone.isPeriod || false,
        color: milestone.color || '#ef4444',
      };

      console.log('🔄 Creating milestone:', milestoneData);

      const { data, error } = await supabase
        .from("milestones")
        .insert(milestoneData)
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Milestone created successfully:', data);
      
      // Validate that is_period and end_date were saved correctly
      if (milestone.isPeriod && !data.is_period) {
        console.error('⚠️ WARNING: is_period was not saved correctly!', {
          sent: milestone.isPeriod,
          received: data.is_period
        });
      }
      
      return data;
    },
    onSuccess: async (_, { roadmapId }) => {
      console.log('🔄 Invalidating milestone queries...');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["milestones", roadmapId] }),
        queryClient.invalidateQueries({ queryKey: ["roadmap", roadmapId] })
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["milestones", roadmapId] }),
        queryClient.refetchQueries({ queryKey: ["roadmap", roadmapId] })
      ]);
      
      console.log('✅ Milestone queries refetched');
      toast({
        title: "Marco criado",
        description: "Marco adicionado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error saving milestone:", error);
      toast({
        title: "Erro ao criar marco",
        description: "Não foi possível criar o marco. Tente novamente.",
        variant: "destructive",
      });
    }
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ roadmapId, milestone }: { roadmapId: string; milestone: Milestone }) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Usuário não autenticado");
      }

      const updateData = {
        title: milestone.title,
        description: milestone.description,
        date: milestone.date.toISOString().split('T')[0],
        end_date: milestone.endDate ? milestone.endDate.toISOString().split('T')[0] : null,
        is_period: milestone.isPeriod || false,
        color: milestone.color || '#ef4444',
      };

      console.log('🔄 Updating milestone:', {
        id: milestone.id,
        ...updateData
      });

      const { data, error } = await supabase
        .from("milestones")
        .update(updateData)
        .eq("id", milestone.id)
        .select()
        .single();

      if (error) throw error;
      
      if (!data) {
        throw new Error("Nenhum marco foi atualizado. Verifique as permissões.");
      }
      
      console.log('✅ Milestone updated successfully:', data);
      
      // Validate that is_period and end_date were saved correctly
      if (milestone.isPeriod && !data.is_period) {
        console.error('⚠️ WARNING: is_period was not saved correctly!', {
          sent: milestone.isPeriod,
          received: data.is_period
        });
      }
      
      return data;
    },
    onSuccess: async (_, { roadmapId }) => {
      console.log('🔄 Invalidating milestone queries after update...');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["milestones", roadmapId] }),
        queryClient.invalidateQueries({ queryKey: ["roadmap", roadmapId] })
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["milestones", roadmapId] }),
        queryClient.refetchQueries({ queryKey: ["roadmap", roadmapId] })
      ]);
      
      console.log('✅ Milestone update queries refetched');
      toast({
        title: "Marco atualizado",
        description: "Marco atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error updating milestone:", error);
      toast({
        title: "Erro ao atualizar marco",
        description: "Não foi possível atualizar o marco. Tente novamente.",
        variant: "destructive",
      });
    }
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ roadmapId, milestoneId }: { roadmapId: string; milestoneId: string }) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase
        .from("milestones")
        .delete()
        .eq("id", milestoneId);

      if (error) throw error;
    },
    onSuccess: async (_, { roadmapId }) => {
      console.log('🔄 Invalidating milestone queries after delete...');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["milestones", roadmapId] }),
        queryClient.invalidateQueries({ queryKey: ["roadmap", roadmapId] })
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["milestones", roadmapId] }),
        queryClient.refetchQueries({ queryKey: ["roadmap", roadmapId] })
      ]);
      
      console.log('✅ Milestone delete queries refetched');
      toast({
        title: "Marco excluído",
        description: "Marco excluído com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error deleting milestone:", error);
      toast({
        title: "Erro ao excluir marco",
        description: "Não foi possível excluir o marco. Tente novamente.",
        variant: "destructive",
      });
    }
  });
}
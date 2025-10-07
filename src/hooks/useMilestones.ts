import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Milestone } from "@/types/roadmap";
import { useToast } from "@/hooks/use-toast";

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
        date: new Date(milestone.date),
        endDate: milestone.end_date ? new Date(milestone.end_date) : undefined,
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

      const { data, error } = await supabase
        .from("milestones")
        .insert({
          roadmap_id: roadmapId,
          user_id: user.id,
          title: milestone.title,
          description: milestone.description,
          date: milestone.date.toISOString().split('T')[0],
          end_date: milestone.endDate ? milestone.endDate.toISOString().split('T')[0] : null,
          is_period: milestone.isPeriod || false,
          color: milestone.color || '#ef4444',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { roadmapId }) => {
      queryClient.invalidateQueries({ queryKey: ["milestones", roadmapId] });
      queryClient.invalidateQueries({ queryKey: ["roadmap", roadmapId] });
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

      const { data, error } = await supabase
        .from("milestones")
        .update({
          title: milestone.title,
          description: milestone.description,
          date: milestone.date.toISOString().split('T')[0],
          end_date: milestone.endDate ? milestone.endDate.toISOString().split('T')[0] : null,
          is_period: milestone.isPeriod || false,
          color: milestone.color || '#ef4444',
        })
        .eq("id", milestone.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { roadmapId }) => {
      queryClient.invalidateQueries({ queryKey: ["milestones", roadmapId] });
      queryClient.invalidateQueries({ queryKey: ["roadmap", roadmapId] });
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
        .eq("id", milestoneId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: (_, { roadmapId }) => {
      queryClient.invalidateQueries({ queryKey: ["milestones", roadmapId] });
      queryClient.invalidateQueries({ queryKey: ["roadmap", roadmapId] });
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
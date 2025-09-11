import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Roadmap, Delivery, SubDelivery } from "@/types/roadmap";
import { useToast } from "@/hooks/use-toast";

export function useRoadmaps() {
  return useQuery({
    queryKey: ["roadmaps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roadmaps")
        .select(`
          *,
          deliveries:deliveries(
            *,
            sub_deliveries:sub_deliveries(*)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map(roadmap => ({
        ...roadmap,
        createdAt: new Date(roadmap.created_at),
        updatedAt: new Date(roadmap.updated_at),
        deliveries: roadmap.deliveries.map((delivery: any) => ({
          ...delivery,
          startDate: delivery.start_date ? new Date(delivery.start_date) : new Date(),
          endDate: delivery.end_date ? new Date(delivery.end_date) : new Date(),
          subDeliveries: delivery.sub_deliveries.map((sub: any) => ({
            ...sub,
            startDate: sub.start_date ? new Date(sub.start_date) : new Date(),
            endDate: sub.end_date ? new Date(sub.end_date) : new Date(),
          }))
        }))
      })) as Roadmap[];
    }
  });
}

export function useRoadmap(id: string) {
  return useQuery({
    queryKey: ["roadmap", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roadmaps")
        .select(`
          *,
          deliveries:deliveries(
            *,
            sub_deliveries:sub_deliveries(*)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      return {
        ...data,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        deliveries: data.deliveries.map((delivery: any) => ({
          ...delivery,
          startDate: delivery.start_date ? new Date(delivery.start_date) : new Date(),
          endDate: delivery.end_date ? new Date(delivery.end_date) : new Date(),
          subDeliveries: delivery.sub_deliveries.map((sub: any) => ({
            ...sub,
            startDate: sub.start_date ? new Date(sub.start_date) : new Date(),
            endDate: sub.end_date ? new Date(sub.end_date) : new Date(),
          }))
        }))
      } as Roadmap;
    },
    enabled: !!id
  });
}

export function useSaveRoadmap() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (roadmap: Partial<Roadmap> & { deliveries: Delivery[] }) => {
      // Save or update roadmap
      let roadmapData;
      if (roadmap.id) {
        const { data, error } = await supabase
          .from("roadmaps")
          .update({
            title: roadmap.title,
            subtitle: roadmap.subtitle,
            description: roadmap.description,
          })
          .eq("id", roadmap.id)
          .select()
          .single();
        
        if (error) throw error;
        roadmapData = data;
      } else {
        const { data, error } = await supabase
          .from("roadmaps")
          .insert({
            title: roadmap.title,
            subtitle: roadmap.subtitle,
            description: roadmap.description,
          })
          .select()
          .single();
        
        if (error) throw error;
        roadmapData = data;
      }

      // Delete existing deliveries if updating
      if (roadmap.id) {
        await supabase
          .from("deliveries")
          .delete()
          .eq("roadmap_id", roadmap.id);
      }

      // Save deliveries
      for (const delivery of roadmap.deliveries) {
        const { data: deliveryData, error: deliveryError } = await supabase
          .from("deliveries")
          .insert({
            roadmap_id: roadmapData.id,
            title: delivery.title,
            description: delivery.description,
            start_date: delivery.startDate?.toISOString().split('T')[0],
            end_date: delivery.endDate?.toISOString().split('T')[0],
            complexity: delivery.complexity,
            priority: delivery.priority,
            delivery_color: delivery.deliveryColor,
            delivery_phase: delivery.deliveryPhase,
            jira_link: delivery.jiraLink,
            progress: delivery.progress,
            status: delivery.status,
          })
          .select()
          .single();

        if (deliveryError) throw deliveryError;

        // Save sub-deliveries
        for (const subDelivery of delivery.subDeliveries) {
          const { error: subError } = await supabase
            .from("sub_deliveries")
            .insert({
              delivery_id: deliveryData.id,
              title: subDelivery.title,
              description: subDelivery.description,
              start_date: subDelivery.startDate?.toISOString().split('T')[0],
              end_date: subDelivery.endDate?.toISOString().split('T')[0],
              team: subDelivery.team,
              responsible: subDelivery.responsible,
              completed: subDelivery.completed,
              progress: subDelivery.progress,
              status: subDelivery.status,
              jira_link: subDelivery.jiraLink,
            });

          if (subError) throw subError;
        }
      }

      return roadmapData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
      toast({
        title: "Roadmap salvo com sucesso!",
        description: "Todas as alterações foram salvas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar roadmap",
        description: "Ocorreu um erro ao salvar o roadmap. Tente novamente.",
        variant: "destructive",
      });
      console.error("Error saving roadmap:", error);
    }
  });
}

export function useDeleteRoadmap() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("roadmaps")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
      toast({
        title: "Roadmap excluído",
        description: "O roadmap foi excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o roadmap.",
        variant: "destructive",
      });
    }
  });
}
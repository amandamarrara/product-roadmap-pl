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
      console.log("Saving roadmap:", roadmap);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Validate required fields
      if (!roadmap.title?.trim()) {
        throw new Error("O título do roadmap é obrigatório");
      }

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
          .eq("user_id", user.id)
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
            user_id: user.id,
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
          .eq("roadmap_id", roadmap.id)
          .eq("user_id", user.id);
      }

      // Save deliveries
      for (const delivery of roadmap.deliveries || []) {
        console.log("Saving delivery:", delivery);
        
        const { data: deliveryData, error: deliveryError } = await supabase
          .from("deliveries")
          .insert({
            roadmap_id: roadmapData.id,
            user_id: user.id,
            title: delivery.title || "Entrega sem título",
            description: delivery.description || null,
            start_date: delivery.startDate ? delivery.startDate.toISOString().split('T')[0] : null,
            end_date: delivery.endDate ? delivery.endDate.toISOString().split('T')[0] : null,
            complexity: delivery.complexity || null,
            priority: delivery.priority || null,
            delivery_color: delivery.deliveryColor || null,
            delivery_phase: delivery.deliveryPhase || null,
            jira_link: delivery.jiraLink || null,
            progress: delivery.progress || 0,
            status: delivery.status || 'not-started',
          })
          .select()
          .single();

        if (deliveryError) {
          console.error("Delivery error:", deliveryError);
          throw deliveryError;
        }

        // Save sub-deliveries
        for (const subDelivery of delivery.subDeliveries || []) {
          console.log("Saving sub-delivery:", subDelivery);
          
          const { error: subError } = await supabase
            .from("sub_deliveries")
            .insert({
              delivery_id: deliveryData.id,
              user_id: user.id,
              title: subDelivery.title || "Sub-entrega sem título",
              description: subDelivery.description || null,
              start_date: subDelivery.startDate ? subDelivery.startDate.toISOString().split('T')[0] : null,
              end_date: subDelivery.endDate ? subDelivery.endDate.toISOString().split('T')[0] : null,
              team: subDelivery.team || null,
              responsible: subDelivery.responsible || null,
              completed: subDelivery.completed || false,
              progress: subDelivery.progress || 0,
              status: subDelivery.status || 'not-started',
              jira_link: subDelivery.jiraLink || null,
            });

          if (subError) {
            console.error("Sub-delivery error:", subError);
            throw subError;
          }
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
      console.error("Error saving roadmap:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao salvar o roadmap. Tente novamente.";
      toast({
        title: "Erro ao salvar roadmap",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });
}

export function useDeleteRoadmap() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase
        .from("roadmaps")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

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
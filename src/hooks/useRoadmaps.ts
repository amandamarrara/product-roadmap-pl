import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Roadmap, Delivery, SubDelivery, Milestone, RoadmapWithRole } from "@/types/roadmap";
import { toast } from "sonner";
import { generateColorFromPhase } from "@/lib/utils";
import { parseISO } from "date-fns";

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
          ),
          milestones:milestones(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map(roadmap => ({
        ...roadmap,
        createdAt: new Date(roadmap.created_at),
        updatedAt: new Date(roadmap.updated_at),
        deliveries: roadmap.deliveries.map((delivery: any) => ({
            ...delivery,
            startDate: delivery.start_date ? parseISO(delivery.start_date) : new Date(),
            endDate: delivery.end_date ? parseISO(delivery.end_date) : new Date(),
          deliveryColor: delivery.delivery_color || undefined,
          deliveryPhase: delivery.delivery_phase || undefined,
          responsible: delivery.responsible || undefined,
          jiraLink: delivery.jira_link || undefined,
          subDeliveries: delivery.sub_deliveries.map((sub: any) => ({
            ...sub,
            startDate: sub.start_date ? new Date(sub.start_date) : new Date(),
            endDate: sub.end_date ? new Date(sub.end_date) : new Date(),
            jiraLink: sub.jira_link || undefined,
          }))
        })),
        milestones: Array.isArray(roadmap.milestones) 
          ? roadmap.milestones.map((milestone: any) => ({
            ...milestone,
            date: parseISO(milestone.date),
            }))
          : []
      })) as Roadmap[];
    }
  });
}

export function useRoadmap(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["roadmap", id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Try to fetch roadmap directly (own or shared via RLS)
      const { data, error } = await supabase
        .from("roadmaps")
        .select(`
          *,
          deliveries:deliveries(
            *,
            sub_deliveries:sub_deliveries(*)
          ),
          milestones:milestones(*)
        `)
        .eq("id", id)
        .maybeSingle();

      // If not found, try to fetch via roadmap_shares (shared but not linked yet)
      if (!data) {
        const { data: shareData, error: shareError } = await supabase
          .from("roadmap_shares")
          .select(`
            *,
            roadmap:roadmaps(
              *,
              deliveries:deliveries(*,sub_deliveries:sub_deliveries(*)),
              milestones:milestones(*)
            )
          `)
          .eq("roadmap_id", id)
          .or(`shared_with_user_id.eq.${user.id},shared_with_email.eq.${user.email}`)
          .maybeSingle();

        if (shareError || !shareData || !shareData.roadmap) {
          throw new Error("Roadmap não encontrado ou você não tem permissão para visualizá-lo");
        }

        const roadmap = shareData.roadmap;
        return formatRoadmapData(roadmap);
      }

      if (error) throw error;
      return formatRoadmapData(data);
    },
    enabled: options?.enabled !== undefined ? (!!id && options.enabled) : !!id
  });
}

// Helper function to format roadmap data
function formatRoadmapData(data: any): Roadmap {
  return {
    ...data,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    deliveries: data.deliveries.map((delivery: any) => ({
      ...delivery,
      startDate: delivery.start_date ? parseISO(delivery.start_date) : new Date(),
      endDate: delivery.end_date ? parseISO(delivery.end_date) : new Date(),
      deliveryColor: delivery.delivery_color || undefined,
      deliveryPhase: delivery.delivery_phase || undefined,
      responsible: delivery.responsible || undefined,
      jiraLink: delivery.jira_link || undefined,
      subDeliveries: delivery.sub_deliveries.map((sub: any) => ({
        ...sub,
        startDate: sub.start_date ? new Date(sub.start_date) : new Date(),
        endDate: sub.end_date ? new Date(sub.end_date) : new Date(),
        jiraLink: sub.jira_link || undefined,
      }))
    })),
    milestones: Array.isArray(data.milestones) 
      ? data.milestones.map((milestone: any) => ({
        ...milestone,
        date: parseISO(milestone.date),
        }))
      : []
  } as Roadmap;
}

export function useSaveRoadmap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roadmap: Partial<Roadmap> & { deliveries: Delivery[]; milestones?: Milestone[] }) => {
      console.log('🚀 Starting roadmap save process...');
      console.log('Roadmap data:', roadmap);
      console.log('Environment check:', {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://onyscnytemwkjeeevtvh.supabase.co',
        hasKey: !!(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueXNjbnl0ZW13a2plZWV2dHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NTIyNDgsImV4cCI6MjA3MzEyODI0OH0.cuQgo5gpW8LMa_Shj_iisc-OuHowHfwX01UCITSVBa4')
      });
      
      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Auth check result:', { user: user?.id, authError });
      
      if (authError) {
        console.error('❌ Auth error:', authError);
        throw new Error(`Erro de autenticação: ${authError.message}`);
      }
      
      if (!user) {
        console.error('❌ No user found - user must be authenticated to save roadmap');
        throw new Error("Usuário não autenticado. Faça login para salvar roadmaps.");
      }

      console.log('✅ User authenticated:', user.id);
      
      // Validate required fields
      if (!roadmap.title?.trim()) {
        console.error('❌ Missing required field: title');
        throw new Error("O título do roadmap é obrigatório");
      }

      console.log('✅ Validation passed');

      // Prepare roadmap data
      const roadmapPayload = {
        title: roadmap.title,
        subtitle: roadmap.subtitle,
        description: roadmap.description,
        user_id: user.id,
      };

      console.log('Prepared roadmap payload:', roadmapPayload);

      // Save or update roadmap
      let roadmapData;
      if (roadmap.id) {
        console.log('🔄 Updating existing roadmap:', roadmap.id);
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
        
        console.log('Update roadmap result:', { data, error });
        if (error) {
          console.error('❌ Error updating roadmap:', error);
          throw new Error(`Erro ao atualizar roadmap: ${error.message} (Code: ${error.code})`);
        }
        roadmapData = data;
      } else {
        console.log('➕ Creating new roadmap');
        const { data, error } = await supabase
          .from("roadmaps")
          .insert(roadmapPayload)
          .select()
          .single();
        
        console.log('Insert roadmap result:', { data, error });
        if (error) {
          console.error('❌ Error creating roadmap:', error);
          throw new Error(`Erro ao criar roadmap: ${error.message} (Code: ${error.code})`);
        }
        roadmapData = data;
      }

      console.log('✅ Roadmap saved successfully:', roadmapData);

      // If updating existing roadmap, only update title/subtitle/description
      // DO NOT delete and recreate deliveries/milestones - they are managed individually
      if (roadmap.id) {
        console.log('✅ Roadmap updated - skipping delivery/milestone recreation');
        console.log('🎉 Update completed successfully');
        return roadmapData;
      }

      // Only save deliveries for NEW roadmaps (no roadmap.id)
      console.log(`📦 Processing ${roadmap.deliveries?.length || 0} deliveries`);
      for (const [index, delivery] of (roadmap.deliveries || []).entries()) {
        console.log(`📦 [${index + 1}/${roadmap.deliveries?.length}] Saving delivery:`, delivery.title);
        
        const deliveryPayload = {
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
          responsible: delivery.responsible || null,
          jira_link: delivery.jiraLink || null,
          progress: delivery.progress || 0,
          status: delivery.status || 'not-started',
        };
        
        console.log('Delivery payload:', deliveryPayload);
        
        const { data: deliveryData, error: deliveryError } = await supabase
          .from("deliveries")
          .insert(deliveryPayload)
          .select()
          .single();

        console.log('Delivery insert result:', { data: deliveryData, error: deliveryError });
        if (deliveryError) {
          console.error("❌ Delivery error:", deliveryError);
          throw new Error(`Erro ao salvar entrega "${delivery.title}": ${deliveryError.message} (Code: ${deliveryError.code})`);
        }

        // Save sub-deliveries
        console.log(`📋 Processing ${delivery.subDeliveries?.length || 0} sub-deliveries for delivery: ${delivery.title}`);
        for (const [subIndex, subDelivery] of (delivery.subDeliveries || []).entries()) {
          console.log(`📋 [${subIndex + 1}/${delivery.subDeliveries?.length}] Saving sub-delivery:`, subDelivery.title);
          
          const subDeliveryPayload = {
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
          };
          
          console.log('Sub-delivery payload:', subDeliveryPayload);

          const { error: subError } = await supabase
            .from("sub_deliveries")
            .insert(subDeliveryPayload);

          console.log('Sub-delivery insert result:', subError);
          if (subError) {
            console.error("❌ Sub-delivery error:", subError);
            throw new Error(`Erro ao salvar sub-entrega "${subDelivery.title}": ${subError.message} (Code: ${subError.code})`);
          }
        }
      }

      // Save milestones
      console.log(`🏁 Processing ${roadmap.milestones?.length || 0} milestones`);
      for (const [index, milestone] of (roadmap.milestones || []).entries()) {
        console.log(`🏁 [${index + 1}/${roadmap.milestones?.length}] Saving milestone:`, milestone.title);
        
        const milestonePayload = {
          roadmap_id: roadmapData.id,
          user_id: user.id,
          title: milestone.title || "Marco sem título",
          description: milestone.description || null,
          date: milestone.date ? milestone.date.toISOString().split('T')[0] : null,
          color: milestone.color || '#ef4444',
        };
        
        console.log('Milestone payload:', milestonePayload);
        
        const { error: milestoneError } = await supabase
          .from("milestones")
          .insert(milestonePayload);

        console.log('Milestone insert result:', milestoneError);
        if (milestoneError) {
          console.error("❌ Milestone error:", milestoneError);
          throw new Error(`Erro ao salvar marco "${milestone.title}": ${milestoneError.message} (Code: ${milestoneError.code})`);
        }
      }

      console.log('🎉 All operations completed successfully');
      return roadmapData;
    },
    onSuccess: () => {
      console.log('✅ Save mutation completed successfully');
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
      toast.success("Roadmap salvo com sucesso!");
    },
    onError: (error) => {
      console.error("❌ Error saving roadmap:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao salvar o roadmap. Tente novamente.";
      
      // Check for specific error types
      if (error instanceof Error && error.message.includes('404')) {
        console.error('❌ 404 Error detected - possible auth/API issue');
        toast.error("Erro de conectividade. Verifique sua conexão e tente novamente.");
      } else if (error instanceof Error && error.message.includes('NOT_FOUND')) {
        console.error('❌ NOT_FOUND Error detected');
        toast.error("Recurso não encontrado. Verifique sua autenticação e tente novamente.");
      } else {
        toast.error(`Erro ao salvar roadmap: ${errorMessage}`);
      }
    }
  });
}

export function useUpdateDeliveryOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ roadmapId, deliveries }: { roadmapId: string; deliveries: Delivery[] }) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Usuário não autenticado");
      }

      // Update delivery phases for deliveries that moved between phases
      for (const delivery of deliveries) {
        const { error } = await supabase
          .from("deliveries")
          .update({ 
            delivery_phase: delivery.deliveryPhase || null
          })
          .eq("id", delivery.id)
          .eq("user_id", user.id);
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
    },
    onError: () => {
      toast.error("Erro ao reordenar entregas.");
    }
  });
}

export function useUpdateExistingDeliveryColors() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Usuário não autenticado");
      }

      // Get all deliveries for the current user
      const { data: deliveries, error: fetchError } = await supabase
        .from("deliveries")
        .select("id, delivery_phase, delivery_color")
        .eq("user_id", user.id);

      if (fetchError) throw fetchError;

      // Update colors based on phases
      for (const delivery of deliveries || []) {
        if (delivery.delivery_phase) {
          const newColor = generateColorFromPhase(delivery.delivery_phase);
          
          const { error: updateError } = await supabase
            .from("deliveries")
            .update({ delivery_color: newColor })
            .eq("id", delivery.id)
            .eq("user_id", user.id);
            
          if (updateError) throw updateError;
        }
      }

      return deliveries?.length || 0;
    },
    onSuccess: (updatedCount) => {
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
      toast.success(`${updatedCount} entregas atualizadas com as novas cores por fase!`);
    },
    onError: () => {
      toast.error("Erro ao atualizar cores das entregas existentes.");
    }
  });
}

export function useDeleteRoadmap() {
  const queryClient = useQueryClient();

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
      toast.success("Roadmap excluído com sucesso!");
    },
    onError: () => {
      toast.error("Não foi possível excluir o roadmap.");
    }
  });
}

export function useSharedRoadmaps() {
  return useQuery({
    queryKey: ["shared-roadmaps"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("roadmap_shares")
        .select(`
          *,
          roadmap:roadmaps(
            *,
            deliveries:deliveries(*),
            milestones:milestones(*)
          )
        `)
        .or(`shared_with_user_id.eq.${user.id},shared_with_email.eq.${user.email}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map((share: any) => {
        const roadmap = share.roadmap;
        if (!roadmap) return null;
        
        return {
          ...roadmap,
          createdAt: new Date(roadmap.created_at),
          updatedAt: new Date(roadmap.updated_at),
          deliveries: roadmap.deliveries || [],
          milestones: roadmap.milestones || [],
          userRole: share.permission,
          isShared: true,
          public_share_token: roadmap.public_share_token,
        };
      }).filter(Boolean);
    },
  });
}
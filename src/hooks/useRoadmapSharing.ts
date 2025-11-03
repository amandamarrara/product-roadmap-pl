import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { RoadmapShare } from "@/types/roadmap";

// Generate a simple unique token
function generateToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function useRoadmapShares(roadmapId: string) {
  return useQuery({
    queryKey: ["roadmap-shares", roadmapId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roadmap_shares")
        .select("*")
        .eq("roadmap_id", roadmapId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map(share => ({
        id: share.id,
        roadmapId: share.roadmap_id,
        sharedWithEmail: share.shared_with_email,
        sharedWithUserId: share.shared_with_user_id || undefined,
        permission: share.permission as 'viewer' | 'editor',
        sharedByUserId: share.shared_by_user_id,
        inviteToken: share.invite_token,
        createdAt: new Date(share.created_at),
        updatedAt: new Date(share.updated_at),
      })) as RoadmapShare[];
    },
    enabled: !!roadmapId,
  });
}

export function useShareRoadmap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roadmapId,
      email,
      permission,
    }: {
      roadmapId: string;
      email: string;
      permission: 'viewer' | 'editor';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const inviteToken = generateToken();

      const { data, error } = await supabase
        .from("roadmap_shares")
        .insert({
          roadmap_id: roadmapId,
          shared_with_email: email,
          permission,
          shared_by_user_id: user.id,
          invite_token: inviteToken,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["roadmap-shares", variables.roadmapId] });
      toast({
        title: "Compartilhado com sucesso",
        description: `O roadmap foi compartilhado com ${variables.email}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao compartilhar",
        description: error.message || "Não foi possível compartilhar o roadmap",
        variant: "destructive",
      });
    },
  });
}

export function useRemoveShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shareId, roadmapId }: { shareId: string; roadmapId: string }) => {
      const { error } = await supabase
        .from("roadmap_shares")
        .delete()
        .eq("id", shareId);

      if (error) throw error;
      return { shareId, roadmapId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["roadmap-shares", data.roadmapId] });
      toast({
        title: "Acesso removido",
        description: "O acesso ao roadmap foi removido",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover acesso",
        description: error.message || "Não foi possível remover o acesso",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateSharePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      shareId,
      roadmapId,
      permission,
    }: {
      shareId: string;
      roadmapId: string;
      permission: 'viewer' | 'editor';
    }) => {
      const { error } = await supabase
        .from("roadmap_shares")
        .update({ permission })
        .eq("id", shareId);

      if (error) throw error;
      return { shareId, roadmapId, permission };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["roadmap-shares", data.roadmapId] });
      toast({
        title: "Permissão atualizada",
        description: `Permissão alterada para ${data.permission === 'editor' ? 'Editor' : 'Visualizador'}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar permissão",
        description: error.message || "Não foi possível atualizar a permissão",
        variant: "destructive",
      });
    },
  });
}

export function useRoadmapRole(roadmapId: string) {
  return useQuery({
    queryKey: ["roadmap-role", roadmapId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'none';

      const { data, error } = await supabase.rpc("get_user_roadmap_role", {
        _roadmap_id: roadmapId,
        _user_id: user.id,
      });

      if (error) throw error;
      return data as 'owner' | 'editor' | 'viewer' | 'none';
    },
    enabled: !!roadmapId,
  });
}

export function usePublicShareToken(roadmapId: string) {
  return useQuery({
    queryKey: ["public-share-token", roadmapId],
    queryFn: async () => {
      const { data: roadmap, error } = await supabase
        .from("roadmaps")
        .select("public_share_token")
        .eq("id", roadmapId)
        .single();

      if (error) throw error;

      // If no token exists, generate a new one
      if (!roadmap.public_share_token) {
        const newToken = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        const { error: updateError } = await supabase
          .from("roadmaps")
          .update({ public_share_token: newToken })
          .eq("id", roadmapId);

        if (updateError) throw updateError;
        return newToken;
      }

      return roadmap.public_share_token;
    },
    enabled: !!roadmapId,
  });
}

export function useProcessInviteToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token, roadmapId }: { token: string; roadmapId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Você precisa estar autenticado para aceitar o convite");

      // Verify if the token is valid for this roadmap
      const { data: roadmap, error: roadmapError } = await supabase
        .from("roadmaps")
        .select("id")
        .eq("id", roadmapId)
        .eq("public_share_token", token)
        .maybeSingle();

      if (roadmapError || !roadmap) {
        throw new Error("Link de convite inválido");
      }

      // Check if user is in the share list
      const { data: share, error: shareError } = await supabase
        .from("roadmap_shares")
        .select("*")
        .eq("roadmap_id", roadmapId)
        .eq("shared_with_email", user.email)
        .maybeSingle();

      if (shareError) throw shareError;

      if (!share) {
        throw new Error("Você não tem permissão para acessar este roadmap");
      }

      // Link user if not already linked
      if (!share.shared_with_user_id) {
        const { error: updateError } = await supabase
          .from("roadmap_shares")
          .update({ shared_with_user_id: user.id })
          .eq("id", share.id);

        if (updateError) throw updateError;
      }

      return roadmapId;
    },
    onSuccess: (roadmapId) => {
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
      queryClient.invalidateQueries({ queryKey: ["shared-roadmaps"] });
      queryClient.invalidateQueries({ queryKey: ["roadmap", roadmapId] });
      toast({
        title: "Convite aceito!",
        description: "Você agora tem acesso a este roadmap",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao aceitar convite",
        description: error.message || "Não foi possível processar o convite",
        variant: "destructive",
      });
    },
  });
}

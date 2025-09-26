import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Comment } from "@/types/roadmap";

export function useComments(deliveryId?: string, subDeliveryId?: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (deliveryId || subDeliveryId) {
      fetchComments();
    }
  }, [deliveryId, subDeliveryId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('delivery_comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (deliveryId) {
        query = query.eq('delivery_id', deliveryId);
      } else if (subDeliveryId) {
        query = query.eq('sub_delivery_id', subDeliveryId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedComments: Comment[] = (data || []).map(comment => ({
        id: comment.id,
        deliveryId: comment.delivery_id,
        subDeliveryId: comment.sub_delivery_id,
        userId: comment.user_id,
        comment: comment.comment,
        createdAt: new Date(comment.created_at),
        updatedAt: new Date(comment.updated_at),
      }));

      setComments(transformedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Erro ao carregar comentários",
        description: "Não foi possível carregar os comentários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addCommentMutation = useMutation({
    mutationFn: async (commentText: string) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Erro de autenticação');
      }
      
      if (!user) {
        console.error('No user found');
        throw new Error('Usuário não autenticado. Faça login para adicionar comentários.');
      }

      const newComment = {
        delivery_id: deliveryId || null,
        sub_delivery_id: subDeliveryId || null,
        user_id: user.id,
        comment: commentText,
      };

      const { data, error } = await supabase
        .from('delivery_comments')
        .insert([newComment])
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      fetchComments();
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi adicionado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro ao adicionar comentário",
        description: "Não foi possível adicionar o comentário.",
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('delivery_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      fetchComments();
      toast({
        title: "Comentário excluído",
        description: "O comentário foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
      toast({
        title: "Erro ao excluir comentário",
        description: "Não foi possível excluir o comentário.",
        variant: "destructive",
      });
    },
  });

  return {
    comments,
    isLoading,
    addComment: addCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,
    isAdding: addCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
  };
}
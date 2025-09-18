import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, MessageCircle } from "lucide-react";
import { useComments } from "@/hooks/useComments";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CommentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryId?: string;
  subDeliveryId?: string;
  title: string;
}

export function CommentsDialog({ 
  open, 
  onOpenChange, 
  deliveryId, 
  subDeliveryId, 
  title 
}: CommentsDialogProps) {
  const [newComment, setNewComment] = useState("");
  const { comments, isLoading, addComment, deleteComment, isAdding } = useComments(deliveryId, subDeliveryId);

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(newComment.trim());
      setNewComment("");
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm("Tem certeza que deseja excluir este comentário?")) {
      deleteComment(commentId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comentários - {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Add new comment */}
          <div className="space-y-2">
            <Textarea
              placeholder="Adicione um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <Button 
              onClick={handleAddComment}
              disabled={!newComment.trim() || isAdding}
              className="w-full"
            >
              {isAdding ? "Adicionando..." : "Adicionar Comentário"}
            </Button>
          </div>

          {/* Comments list */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              Comentários ({comments.length})
            </h4>
            
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Carregando comentários...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum comentário ainda
              </div>
            ) : (
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 border rounded-lg bg-muted/50 space-y-2"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm flex-1">{comment.comment}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(comment.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
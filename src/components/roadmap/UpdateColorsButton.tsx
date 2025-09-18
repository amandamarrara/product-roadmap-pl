import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Palette } from "lucide-react";
import { useUpdateExistingDeliveryColors } from "@/hooks/useRoadmaps";

export function UpdateColorsButton() {
  const updateColors = useUpdateExistingDeliveryColors();

  const handleUpdateColors = () => {
    updateColors.mutate();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          Atualizar Cores por Fase
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Atualizar cores das entregas existentes</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação irá atualizar todas as entregas existentes para usar o novo sistema de cores baseado na fase. 
            Entregas da mesma fase terão a mesma cor.
            <br /><br />
            <strong>Esta ação não pode ser desfeita.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleUpdateColors}
            disabled={updateColors.isPending}
          >
            {updateColors.isPending ? 'Atualizando...' : 'Atualizar Cores'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
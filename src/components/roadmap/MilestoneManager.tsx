import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Plus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MilestoneForm } from "./MilestoneForm";
import type { Milestone } from "@/types/roadmap";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MilestoneManagerProps {
  milestones: Milestone[];
  onSave: (milestone: Omit<Milestone, 'id'>) => void;
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
  compact?: boolean;
}

export function MilestoneManager({ 
  milestones, 
  onSave, 
  onEdit, 
  onDelete, 
  readOnly = false,
  compact = false
}: MilestoneManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | undefined>();

  const handleSave = (milestoneData: Omit<Milestone, 'id'>) => {
    if (editingMilestone) {
      onEdit({ ...milestoneData, id: editingMilestone.id });
    } else {
      onSave(milestoneData);
    }
    setShowForm(false);
    setEditingMilestone(undefined);
  };

  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMilestone(undefined);
  };

  const sortedMilestones = [...milestones].sort((a, b) => a.date.getTime() - b.date.getTime());

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Marcos</h3>
          {!readOnly && (
            <Button onClick={() => setShowForm(true)} size="sm" variant="outline">
              <Plus className="h-3 w-3 mr-1" />
              Marco
            </Button>
          )}
        </div>
        
        {sortedMilestones.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum marco criado.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sortedMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center space-x-2 px-3 py-1 bg-accent/20 rounded-full border border-border group hover:bg-accent/40 transition-colors"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: milestone.color || '#ef4444' }}
                />
                <span className="text-xs font-medium text-foreground">{milestone.title}</span>
                <span className="text-xs text-muted-foreground">
                  {format(milestone.date, 'dd/MM')}
                </span>
                {!readOnly && (
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(milestone)}
                      className="h-5 w-5 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Marco</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este marco? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(milestone.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <MilestoneForm
          milestone={editingMilestone}
          open={showForm}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <Card className="shadow-card border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Marcos ({milestones.length})
          </CardTitle>
          {!readOnly && (
            <Button
              size="sm"
              onClick={() => setShowForm(true)}
              className="bg-gradient-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Marco
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {milestones.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum marco definido</p>
            {!readOnly && (
              <p className="text-sm">Adicione marcos importantes como deadlines ou lançamentos</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: milestone.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{milestone.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {format(milestone.date, "dd/MM/yyyy", { locale: ptBR })}
                      </Badge>
                    </div>
                    {milestone.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                </div>

                {!readOnly && (
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(milestone)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Marco</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o marco "{milestone.title}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDelete(milestone.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <MilestoneForm
        milestone={editingMilestone}
        open={showForm}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </Card>
  );
}
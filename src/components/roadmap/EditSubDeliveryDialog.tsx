import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ExternalLink, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { SubDelivery } from '@/types/roadmap';

interface EditSubDeliveryDialogProps {
  subDelivery: SubDelivery | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedSubDelivery: SubDelivery) => void;
  onDelete: (subDeliveryId: string) => void;
}

export function EditSubDeliveryDialog({
  subDelivery,
  open,
  onOpenChange,
  onSave,
  onDelete
}: EditSubDeliveryDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [team, setTeam] = useState('');
  const [responsible, setResponsible] = useState('');
  const [status, setStatus] = useState<SubDelivery['status']>('not-started');
  const [progress, setProgress] = useState(0);
  const [jiraLink, setJiraLink] = useState('');

  useEffect(() => {
    if (subDelivery) {
      setTitle(subDelivery.title);
      setDescription(subDelivery.description);
      setStartDate(subDelivery.startDate);
      setEndDate(subDelivery.endDate);
      setTeam(subDelivery.team);
      setResponsible(subDelivery.responsible);
      setStatus(subDelivery.status);
      setProgress(subDelivery.progress);
      setJiraLink(subDelivery.jiraLink || '');
    }
  }, [subDelivery]);

  const handleSave = () => {
    if (!subDelivery || !title.trim() || !startDate || !endDate) {
      return;
    }

    const updatedSubDelivery: SubDelivery = {
      ...subDelivery,
      title: title.trim(),
      description: description.trim(),
      startDate,
      endDate,
      team: team.trim(),
      responsible: responsible.trim(),
      status,
      progress,
      jiraLink: jiraLink.trim(),
      completed: status === 'completed'
    };

    onSave(updatedSubDelivery);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (subDelivery) {
      onDelete(subDelivery.id);
      onOpenChange(false);
    }
  };

  const getStatusLabel = (status: SubDelivery['status']) => {
    switch (status) {
      case 'not-started': return 'Não Iniciada';
      case 'in-progress': return 'Em Progresso';
      case 'completed': return 'Concluída';
      case 'blocked': return 'Bloqueada';
      default: return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Sub-entrega</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da sub-entrega"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição da sub-entrega"
                rows={3}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Data de Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Team and Responsible */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="team">Time</Label>
              <Input
                id="team"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder="Ex: Frontend, Backend..."
              />
            </div>

            <div>
              <Label htmlFor="responsible">Responsável</Label>
              <Input
                id="responsible"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="Ex: João Silva"
              />
            </div>
          </div>

          {/* Status and Progress */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(value: SubDelivery['status']) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Não Iniciada</SelectItem>
                  <SelectItem value="in-progress">Em Progresso</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="blocked">Bloqueada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Progresso ({progress}%)</Label>
              <div className="pt-2">
                <Slider
                  value={[progress]}
                  onValueChange={(value) => setProgress(value[0])}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Jira Link */}
          <div>
            <Label htmlFor="jiraLink">Link do Jira (Tarefa)</Label>
            <div className="relative">
              <Input
                id="jiraLink"
                value={jiraLink}
                onChange={(e) => setJiraLink(e.target.value)}
                placeholder="https://empresa.atlassian.net/browse/TASK-123"
                type="url"
              />
              {jiraLink && (
                <a
                  href={jiraLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                </a>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir esta sub-entrega? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!title.trim() || !startDate || !endDate}
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
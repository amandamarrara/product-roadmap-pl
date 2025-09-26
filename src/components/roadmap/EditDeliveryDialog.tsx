import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ExternalLink, Trash2, Plus, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ColorPicker } from './ColorPicker';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import type { Delivery, Priority, Complexity } from '@/types/roadmap';

interface EditDeliveryDialogProps {
  delivery: Delivery | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedDelivery: Delivery) => void;
  onDelete: (deliveryId: string) => void;
  onEditSubDelivery?: (subDelivery: any) => void;
}

export function EditDeliveryDialog({
  delivery,
  open,
  onOpenChange,
  onSave,
  onDelete,
  onEditSubDelivery
}: EditDeliveryDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [responsible, setResponsible] = useState('');
  const [deliveryPhase, setDeliveryPhase] = useState('');
  const [jiraLink, setJiraLink] = useState('');
  const [deliveryColor, setDeliveryColor] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [complexity, setComplexity] = useState<Complexity>('medium');
  const [status, setStatus] = useState<Delivery['status']>('not-started');
  const [progress, setProgress] = useState(0);
  const [subDeliveriesOpen, setSubDeliveriesOpen] = useState(false);

  const phases = [
    'Onda 1',
    'Onda 2', 
    'Onda 3',
    'Onda 4',
    'Melhoria MVP',
    'Reforma Tributária',
    'Quebra Monolito',
    'Descoberta',
    'Desenvolvimento',
    'Testes',
    'Produção',
    'Manutenção'
  ];

  useEffect(() => {
    if (delivery) {
      console.log('EditDeliveryDialog - Loading delivery:', delivery);
      console.log('EditDeliveryDialog - Description value:', delivery.description);
      
      setTitle(delivery.title);
      setDescription(delivery.description || '');
      setStartDate(delivery.startDate);
      setEndDate(delivery.endDate);
      setResponsible(delivery.responsible || '');
      setDeliveryPhase(delivery.deliveryPhase || '');
      setJiraLink(delivery.jiraLink || '');
      setDeliveryColor(delivery.deliveryColor || '#3b82f6');
      setPriority(delivery.priority);
      setComplexity(delivery.complexity);
      setStatus(delivery.status);
      setProgress(delivery.progress);
      
      console.log('EditDeliveryDialog - Description state set to:', delivery.description || '');
    }
  }, [delivery]);

  const handleSave = () => {
    if (!delivery || !title.trim() || !startDate || !endDate) {
      return;
    }

    const updatedDelivery: Delivery = {
      ...delivery,
      title: title.trim(),
      description: description.trim(),
      startDate,
      endDate,
      responsible: responsible.trim(),
      deliveryPhase: deliveryPhase.trim(),
      jiraLink: jiraLink.trim(),
      deliveryColor,
      priority,
      complexity,
      status,
      progress
    };

    onSave(updatedDelivery);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (delivery) {
      onDelete(delivery.id);
      onOpenChange(false);
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return priority;
    }
  };

  const getComplexityLabel = (complexity: Complexity) => {
    switch (complexity) {
      case 'simple': return 'Simples';
      case 'medium': return 'Médio';
      case 'complex': return 'Complexo';
      case 'very-complex': return 'Muito Complexo';
      default: return complexity;
    }
  };

  const getStatusLabel = (status: Delivery['status']) => {
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Entrega</DialogTitle>
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
                placeholder="Título da entrega"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={description ? "Descrição da entrega" : "Nenhuma descrição cadastrada - Adicione uma descrição para aparecer no tooltip"}
                rows={3}
                className={cn(
                  !description && "text-muted-foreground"
                )}
              />
              {!description && (
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Adicione uma descrição para que ela apareça no tooltip da timeline
                </p>
              )}
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

          {/* Phase, Responsible, and Jira */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Fase de Entrega</Label>
              <Select value={deliveryPhase} onValueChange={setDeliveryPhase}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar fase" />
                </SelectTrigger>
                <SelectContent>
                  {phases.map(phase => (
                    <SelectItem key={phase} value={phase}>
                      {phase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div>
              <Label>Cor</Label>
              <ColorPicker
                value={deliveryColor}
                onChange={setDeliveryColor}
              />
            </div>
          </div>

          {/* Jira Link */}
          <div>
            <Label htmlFor="jiraLink">Link do Jira (Épico)</Label>
            <div className="relative">
              <Input
                id="jiraLink"
                value={jiraLink}
                onChange={(e) => setJiraLink(e.target.value)}
                placeholder="https://empresa.atlassian.net/browse/EPIC-123"
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

          {/* Priority, Complexity, Status, Progress */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Prioridade</Label>
                <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Complexidade</Label>
                <Select value={complexity} onValueChange={(value: Complexity) => setComplexity(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simples</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="complex">Complexo</SelectItem>
                    <SelectItem value="very-complex">Muito Complexo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={(value: Delivery['status']) => setStatus(value)}>
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
          </div>

          {/* Sub-deliveries Section */}
          {delivery && delivery.subDeliveries.length > 0 && (
            <Collapsible open={subDeliveriesOpen} onOpenChange={setSubDeliveriesOpen}>
              <div className="space-y-4">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      <span>Sub-entregas</span>
                      <Badge variant="secondary">{delivery.subDeliveries.length}</Badge>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      subDeliveriesOpen && "rotate-180"
                    )} />
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-3">
                  {delivery.subDeliveries.map((sub, index) => (
                    <div key={sub.id} className="p-4 border rounded-lg bg-muted/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{sub.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {sub.progress}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {onEditSubDelivery && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onEditSubDelivery(sub)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>{sub.description || 'Sem descrição'}</p>
                        <div className="flex flex-wrap gap-4">
                          <span><strong>Time:</strong> {sub.team || 'Não definido'}</span>
                          <span><strong>Responsável:</strong> {sub.responsible || 'Não definido'}</span>
                          <span><strong>Status:</strong> {getStatusLabel(sub.status)}</span>
                          {sub.startDate && sub.endDate && (
                            <span><strong>Período:</strong> {format(sub.startDate, "dd/MM", { locale: ptBR })} - {format(sub.endDate, "dd/MM", { locale: ptBR })}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Entrega
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir esta entrega? Todas as sub-entregas também serão excluídas. Esta ação não pode ser desfeita.
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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Delivery, Priority, Complexity } from "@/types/roadmap";

interface DeliveryFormProps {
  delivery?: Delivery;
  allDeliveries?: Delivery[];
  onSave: (delivery: Omit<Delivery, 'id'>) => void;
  onCancel: () => void;
}

export function DeliveryForm({ delivery, allDeliveries = [], onSave, onCancel }: DeliveryFormProps) {
  const [title, setTitle] = useState(delivery?.title || '');
  const [description, setDescription] = useState(delivery?.description || '');
  const [startDate, setStartDate] = useState<Date | undefined>(delivery?.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(delivery?.endDate);
  const [team, setTeam] = useState(delivery?.team || '');
  const [complexity, setComplexity] = useState<Complexity>(delivery?.complexity || 'medium');
  const [priority, setPriority] = useState<Priority>(delivery?.priority || 'medium');
  const [responsible, setResponsible] = useState(delivery?.responsible || '');
  const [linkedDeliveries, setLinkedDeliveries] = useState<string[]>(delivery?.linkedDeliveries || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate || !team || !responsible) return;

    onSave({
      title,
      description,
      startDate,
      endDate,
      team,
      complexity,
      priority,
      responsible,
      subDeliveries: delivery?.subDeliveries || [],
      progress: delivery?.progress || 0,
      status: delivery?.status || 'not-started',
      linkedDeliveries
    });
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'low': return 'roadmap-low';
      case 'medium': return 'roadmap-medium';
      case 'high': return 'roadmap-high';
      case 'critical': return 'roadmap-critical';
    }
  };

  const getComplexityLabel = (complexity: Complexity) => {
    switch (complexity) {
      case 'simple': return 'Simples';
      case 'medium': return 'Médio';
      case 'complex': return 'Complexo';
      case 'very-complex': return 'Muito Complexo';
    }
  };

  const availableLinkedDeliveries = allDeliveries.filter(d => d.id !== delivery?.id);

  const toggleLinkedDelivery = (deliveryId: string) => {
    setLinkedDeliveries(prev => 
      prev.includes(deliveryId) 
        ? prev.filter(id => id !== deliveryId)
        : [...prev, deliveryId]
    );
  };

  return (
    <Card className="shadow-card border-0">
      <CardHeader className="bg-gradient-card rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          {delivery ? 'Editar Entrega' : 'Nova Entrega'}
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Label htmlFor="title">Título da Entrega</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Implementar sistema de autenticação"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva os detalhes da entrega..."
                rows={3}
              />
            </div>

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
                      {startDate ? format(startDate, "dd/MM/yyyy") : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
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
                      {endDate ? format(endDate, "dd/MM/yyyy") : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="team">Time Responsável</Label>
                <Input
                  id="team"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  placeholder="Ex: Frontend, Backend, Mobile..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="responsible">Responsável</Label>
                <Input
                  id="responsible"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  placeholder="Ex: João Silva, Maria Santos..."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div>
                <Label>Criticidade</Label>
                <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-roadmap-low" />
                        Baixa
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-roadmap-medium" />
                        Média
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-roadmap-high" />
                        Alta
                      </div>
                    </SelectItem>
                    <SelectItem value="critical">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-roadmap-critical" />
                        Crítica
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {availableLinkedDeliveries.length > 0 && (
              <div>
                <Label>Entregas Vinculadas</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {availableLinkedDeliveries.map((linkedDelivery) => (
                    <div key={linkedDelivery.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`linked-${linkedDelivery.id}`}
                        checked={linkedDeliveries.includes(linkedDelivery.id)}
                        onCheckedChange={() => toggleLinkedDelivery(linkedDelivery.id)}
                      />
                      <Label 
                        htmlFor={`linked-${linkedDelivery.id}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {linkedDelivery.title}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              {team && (
                <Badge variant="secondary" className="bg-gradient-roadmap">
                  {team}
                </Badge>
              )}
              <Badge 
                variant="secondary"
                className={`text-${getPriorityColor(priority)}`}
              >
                {priority === 'low' && 'Baixa'}
                {priority === 'medium' && 'Média'}
                {priority === 'high' && 'Alta'}
                {priority === 'critical' && 'Crítica'}
              </Badge>
              <Badge variant="outline">
                {getComplexityLabel(complexity)}
              </Badge>
              {linkedDeliveries.length > 0 && (
                <Badge variant="outline">
                  {linkedDeliveries.length} vinculada{linkedDeliveries.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-gradient-primary">
                {delivery ? 'Atualizar' : 'Criar'} Entrega
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
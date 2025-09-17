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
import { CalendarIcon, Plus, X, Trash2, ExternalLink } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Delivery, Priority, Complexity, SubDelivery } from "@/types/roadmap";

interface DeliveryFormProps {
  delivery?: Delivery;
  onSave: (delivery: Omit<Delivery, 'id'>) => void;
  onCancel: () => void;
}

export function DeliveryForm({ delivery, onSave, onCancel }: DeliveryFormProps) {
  const [title, setTitle] = useState(delivery?.title || '');
  const [description, setDescription] = useState(delivery?.description || '');
  const [startDate, setStartDate] = useState<Date | undefined>(delivery?.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(delivery?.endDate);
  const [complexity, setComplexity] = useState<Complexity>(delivery?.complexity || 'medium');
  const [priority, setPriority] = useState<Priority>(delivery?.priority || 'medium');
  const [deliveryColor, setDeliveryColor] = useState(delivery?.deliveryColor || generateColorFromString(delivery?.title || ''));
  const [deliveryPhase, setDeliveryPhase] = useState(delivery?.deliveryPhase || '');
  const [jiraLink, setJiraLink] = useState(delivery?.jiraLink || '');
  const [status, setStatus] = useState(delivery?.status || 'not-started');
  const [progress, setProgress] = useState(delivery?.progress || 0);
  const [subDeliveries, setSubDeliveries] = useState<Omit<SubDelivery, 'id'>[]>(
    delivery?.subDeliveries?.map(sub => ({ ...sub, id: undefined })) || []
  );

  function generateColorFromString(str: string): string {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
      '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  const addSubDelivery = () => {
    setSubDeliveries(prev => [...prev, {
      title: '',
      description: '',
      startDate: startDate || new Date(),
      endDate: endDate || new Date(),
      team: '',
      responsible: '',
      completed: false,
      progress: 0,
      status: 'not-started',
      jiraLink: ''
    }]);
  };

  const updateSubDelivery = (index: number, field: keyof Omit<SubDelivery, 'id'>, value: any) => {
    setSubDeliveries(prev => prev.map((sub, i) => 
      i === index ? { ...sub, [field]: value } : sub
    ));
  };

  const removeSubDelivery = (index: number) => {
    setSubDeliveries(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 DeliveryForm: Starting form submission...');
    console.log('Form data:', { title, startDate, endDate, complexity, priority });
    
    // Validate required fields
    if (!title.trim()) {
      console.error('❌ DeliveryForm: Missing title');
      alert('O título da entrega é obrigatório');
      return;
    }
    
    if (!startDate) {
      console.error('❌ DeliveryForm: Missing start date');
      alert('A data de início é obrigatória');
      return;
    }
    
    if (!endDate) {
      console.error('❌ DeliveryForm: Missing end date');
      alert('A data de fim é obrigatória');
      return;
    }
    
    if (startDate > endDate) {
      console.error('❌ DeliveryForm: Invalid date range');
      alert('A data de início deve ser anterior à data de fim');
      return;
    }

    console.log('✅ DeliveryForm: Validation passed');

    const validSubDeliveries = subDeliveries
      .filter(sub => sub.title.trim() && sub.team.trim() && sub.responsible.trim())
      .map(sub => ({
        ...sub,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      }));

    console.log('📦 DeliveryForm: Prepared sub-deliveries:', validSubDeliveries.length);

    const deliveryData = {
      title,
      description,
      startDate,
      endDate,
      complexity,
      priority,
      deliveryColor,
      deliveryPhase,
      jiraLink,
      subDeliveries: validSubDeliveries,
      progress,
      status
    };

    console.log('🚀 DeliveryForm: Calling onSave with data:', deliveryData);
    onSave(deliveryData);
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
                onChange={(e) => {
                  setTitle(e.target.value);
                  setDeliveryColor(generateColorFromString(e.target.value));
                }}
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
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deliveryPhase">Fase de Entrega</Label>
                <Input
                  id="deliveryPhase"
                  value={deliveryPhase}
                  onChange={(e) => setDeliveryPhase(e.target.value)}
                  placeholder="Ex: Descoberta, Desenvolvimento, Testes..."
                />
              </div>

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
            </div>

            <div className="grid grid-cols-3 gap-4">
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

              <div>
                <Label>Cor da Entrega</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={deliveryColor}
                    onChange={(e) => setDeliveryColor(e.target.value)}
                    className="w-full h-10 rounded-md border border-input"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status da Entrega</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Não Iniciado</SelectItem>
                    <SelectItem value="in-progress">Em Progresso</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="blocked">Bloqueado</SelectItem>
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

            {/* Sub-entregas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Sub-entregas</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSubDelivery}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Sub-entrega
                </Button>
              </div>

              {subDeliveries.map((sub, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Sub-entrega {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubDelivery(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Título</Label>
                      <Input
                        value={sub.title}
                        onChange={(e) => updateSubDelivery(index, 'title', e.target.value)}
                        placeholder="Título da sub-entrega"
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Time Responsável</Label>
                      <Input
                        value={sub.team}
                        onChange={(e) => updateSubDelivery(index, 'team', e.target.value)}
                        placeholder="Ex: Frontend, Backend..."
                        className="h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Responsável</Label>
                      <Input
                        value={sub.responsible}
                        onChange={(e) => updateSubDelivery(index, 'responsible', e.target.value)}
                        placeholder="Ex: João Silva"
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Link do Jira (Tarefa)</Label>
                      <div className="relative">
                        <Input
                          value={sub.jiraLink || ''}
                          onChange={(e) => updateSubDelivery(index, 'jiraLink', e.target.value)}
                          placeholder="https://empresa.atlassian.net/browse/TASK-123"
                          className="h-8"
                          type="url"
                        />
                        {sub.jiraLink && (
                          <a
                            href={sub.jiraLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                          >
                            <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Data Início</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal h-8 text-xs"
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {sub.startDate ? format(sub.startDate, "dd/MM/yyyy") : "Data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={sub.startDate}
                            onSelect={(date) => date && updateSubDelivery(index, 'startDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label className="text-xs">Data Fim</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal h-8 text-xs"
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {sub.endDate ? format(sub.endDate, "dd/MM/yyyy") : "Data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={sub.endDate}
                            onSelect={(date) => date && updateSubDelivery(index, 'endDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Descrição</Label>
                    <Textarea
                      value={sub.description}
                      onChange={(e) => updateSubDelivery(index, 'description', e.target.value)}
                      placeholder="Descrição da sub-entrega"
                      rows={2}
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Status</Label>
                      <Select value={sub.status} onValueChange={(value: any) => updateSubDelivery(index, 'status', value)}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not-started">Não Iniciado</SelectItem>
                          <SelectItem value="in-progress">Em Progresso</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="blocked">Bloqueado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Progresso ({sub.progress}%)</Label>
                      <div className="pt-1">
                        <Slider
                          value={[sub.progress]}
                          onValueChange={(value) => updateSubDelivery(index, 'progress', value[0])}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-gradient-roadmap">
                <div 
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: deliveryColor }}
                />
                {deliveryPhase || 'Fase'}
              </Badge>
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
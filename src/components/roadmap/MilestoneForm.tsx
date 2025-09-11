import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Save, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Milestone } from "@/types/roadmap";

interface MilestoneFormProps {
  milestone?: Milestone;
  open: boolean;
  onSave: (milestone: Omit<Milestone, 'id'>) => void;
  onCancel: () => void;
}

export function MilestoneForm({ milestone, open, onSave, onCancel }: MilestoneFormProps) {
  const [title, setTitle] = useState(milestone?.title || '');
  const [description, setDescription] = useState(milestone?.description || '');
  const [date, setDate] = useState<Date | undefined>(milestone?.date || undefined);
  const [color, setColor] = useState(milestone?.color || '#ef4444');

  const handleSave = () => {
    if (!title.trim() || !date) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      color
    });

    // Reset form
    setTitle('');
    setDescription('');
    setDate(undefined);
    setColor('#ef4444');
  };

  const predefinedColors = [
    '#ef4444', // red
    '#f97316', // orange  
    '#eab308', // yellow
    '#22c55e', // green
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#6b7280', // gray
  ];

  return (
    <Dialog open={open} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {milestone ? 'Editar Marco' : 'Novo Marco'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="milestone-title">Título *</Label>
            <Input
              id="milestone-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome do marco (ex: Lançamento Beta)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="milestone-description">Descrição</Label>
            <Textarea
              id="milestone-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do marco (opcional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Data *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {predefinedColors.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    color === colorOption ? "border-foreground scale-110" : "border-muted-foreground/20"
                  )}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setColor(colorOption)}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!title.trim() || !date}
            className="bg-gradient-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            {milestone ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
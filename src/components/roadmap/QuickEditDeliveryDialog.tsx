import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Delivery } from "@/types/roadmap";

interface QuickEditDeliveryDialogProps {
  delivery: Delivery | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (delivery: Delivery) => void;
}

export function QuickEditDeliveryDialog({ 
  delivery, 
  open, 
  onOpenChange, 
  onSave 
}: QuickEditDeliveryDialogProps) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [responsible, setResponsible] = useState("");
  const [deliveryPhase, setDeliveryPhase] = useState("");
  const [jiraLink, setJiraLink] = useState("");

  useEffect(() => {
    if (delivery) {
      setTitle(delivery.title);
      setStartDate(delivery.startDate);
      setEndDate(delivery.endDate);
      setResponsible(delivery.responsible || "");
      setDeliveryPhase(delivery.deliveryPhase || "");
      setJiraLink(delivery.jiraLink || "");
    }
  }, [delivery]);

  const handleSave = () => {
    if (!delivery || !title || !startDate || !endDate) return;

    const updatedDelivery: Delivery = {
      ...delivery,
      title,
      startDate,
      endDate,
      responsible,
      deliveryPhase,
      jiraLink,
    };

    onSave(updatedDelivery);
    onOpenChange(false);
  };

  const phases = [
    "Descoberta",
    "Planejamento", 
    "Desenvolvimento",
    "Testes",
    "Homologação",
    "Produção"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Entrega</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome da entrega"
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
                    {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
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
              <Label>Data de Entrega</Label>
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
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="responsible">Responsável</Label>
            <Input
              id="responsible"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              placeholder="Nome do responsável"
            />
          </div>

          <div>
            <Label htmlFor="phase">Fase</Label>
            <Select value={deliveryPhase} onValueChange={setDeliveryPhase}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a fase" />
              </SelectTrigger>
              <SelectContent>
                {phases.map((phase) => (
                  <SelectItem key={phase} value={phase}>
                    {phase}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="jira">Link do Jira</Label>
            <Input
              id="jira"
              type="url"
              value={jiraLink}
              onChange={(e) => setJiraLink(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!title || !startDate || !endDate}
            >
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
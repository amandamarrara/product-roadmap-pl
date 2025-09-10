import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, Edit, MoreVertical, Users, Clock, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Delivery, Priority, Complexity } from "@/types/roadmap";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface DeliveryCardProps {
  delivery: Delivery;
  onEdit: (delivery: Delivery) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function DeliveryCard({ delivery, onEdit, onDelete, className }: DeliveryCardProps) {
  const daysToDeadline = differenceInDays(delivery.endDate, new Date());
  const isOverdue = daysToDeadline < 0;
  const isDueSoon = daysToDeadline <= 3 && daysToDeadline >= 0;

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'low': return 'bg-roadmap-low text-white';
      case 'medium': return 'bg-roadmap-medium text-white';
      case 'high': return 'bg-roadmap-high text-white';
      case 'critical': return 'bg-roadmap-critical text-white';
    }
  };

  const getComplexityDots = (complexity: Complexity) => {
    const dots = {
      'simple': 1,
      'medium': 2,
      'complex': 3,
      'very-complex': 4
    };
    return dots[complexity];
  };

  const getStatusColor = () => {
    switch (delivery.status) {
      case 'completed': return 'bg-success';
      case 'in-progress': return 'bg-info';
      case 'blocked': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getStatusLabel = () => {
    switch (delivery.status) {
      case 'completed': return 'Concluído';
      case 'in-progress': return 'Em Progresso';
      case 'blocked': return 'Bloqueado';
      default: return 'Não Iniciado';
    }
  };

  return (
    <Card className={cn(
      "group transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 border-0 shadow-card bg-gradient-card",
      isOverdue && "ring-2 ring-destructive/20",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg leading-tight">{delivery.title}</h3>
              {(isOverdue || isDueSoon) && (
                <AlertTriangle 
                  className={cn(
                    "h-4 w-4",
                    isOverdue ? "text-destructive" : "text-warning"
                  )} 
                />
              )}
            </div>
            <p className="text-muted-foreground text-sm line-clamp-2">{delivery.description}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(delivery)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(delivery.id)}
                className="text-destructive"
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3">
          <Badge className={getPriorityColor(delivery.priority)}>
            {delivery.priority === 'low' && 'Baixa'}
            {delivery.priority === 'medium' && 'Média'}
            {delivery.priority === 'high' && 'Alta'}
            {delivery.priority === 'critical' && 'Crítica'}
          </Badge>
          
          <Badge variant="outline" className="bg-background/50">
            {delivery.team}
          </Badge>

          <div className="flex items-center gap-1">
            {Array.from({ length: getComplexityDots(delivery.complexity) }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {format(delivery.startDate, "dd MMM", { locale: ptBR })} - {format(delivery.endDate, "dd MMM", { locale: ptBR })}
          </div>
          
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", getStatusColor())} />
            <span className="text-xs font-medium">{getStatusLabel()}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{delivery.progress}%</span>
          </div>
          <Progress value={delivery.progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-primary/20">
                {delivery.responsible.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium">{delivery.responsible}</div>
            </div>
          </div>

          {delivery.subDeliveries.length > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Users className="h-3 w-3 mr-1" />
              {delivery.subDeliveries.length} sub-entregas
            </Badge>
          )}
        </div>

        {isOverdue && (
          <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
            <Clock className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive font-medium">
              Atrasado em {Math.abs(daysToDeadline)} dias
            </span>
          </div>
        )}

        {isDueSoon && !isOverdue && (
          <div className="flex items-center gap-2 p-2 bg-warning/10 rounded-md">
            <Clock className="h-4 w-4 text-warning" />
            <span className="text-sm text-warning font-medium">
              Vence em {daysToDeadline} dias
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ResponsibleFilterProps {
  responsibles: string[];
  selectedResponsibles: string[];
  onSelectionChange: (selected: string[]) => void;
}

export function ResponsibleFilter({
  responsibles,
  selectedResponsibles,
  onSelectionChange,
}: ResponsibleFilterProps) {
  const [open, setOpen] = useState(false);

  const handleToggleAll = () => {
    if (selectedResponsibles.length === responsibles.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...responsibles]);
    }
  };

  const handleToggleResponsible = (responsible: string) => {
    if (selectedResponsibles.includes(responsible)) {
      onSelectionChange(selectedResponsibles.filter(r => r !== responsible));
    } else {
      onSelectionChange([...selectedResponsibles, responsible]);
    }
  };

  const getDisplayText = () => {
    if (selectedResponsibles.length === 0) {
      return 'Todos';
    }
    if (selectedResponsibles.length === responsibles.length) {
      return 'Todos';
    }
    if (selectedResponsibles.length === 1) {
      return selectedResponsibles[0];
    }
    return `${selectedResponsibles.length} selecionados`;
  };

  const isAllSelected = selectedResponsibles.length === responsibles.length;
  const hasSelection = selectedResponsibles.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'flex items-center gap-2 min-w-32',
            hasSelection && selectedResponsibles.length < responsibles.length && 'border-primary'
          )}
        >
          <Users className="h-4 w-4" />
          <span className="truncate">{getDisplayText()}</span>
          {hasSelection && selectedResponsibles.length < responsibles.length && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {selectedResponsibles.length}
            </Badge>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <div className="p-3 border-b">
          <h4 className="font-medium text-sm">Filtrar por Responsável</h4>
        </div>
        <div className="p-2">
          <div className="space-y-2">
            {/* All option */}
            <div className="flex items-center space-x-2 px-2 py-1.5 rounded-sm hover:bg-accent">
              <Checkbox
                id="all-responsibles"
                checked={isAllSelected}
                onCheckedChange={handleToggleAll}
              />
              <label
                htmlFor="all-responsibles"
                className="text-sm font-medium cursor-pointer flex-1"
              >
                Todos
              </label>
            </div>
            
            {/* Individual responsibles */}
            {responsibles.map((responsible) => (
              <div
                key={responsible}
                className="flex items-center space-x-2 px-2 py-1.5 rounded-sm hover:bg-accent"
              >
                <Checkbox
                  id={`responsible-${responsible}`}
                  checked={selectedResponsibles.includes(responsible)}
                  onCheckedChange={() => handleToggleResponsible(responsible)}
                />
                <label
                  htmlFor={`responsible-${responsible}`}
                  className="text-sm cursor-pointer flex-1 truncate"
                  title={responsible}
                >
                  {responsible}
                </label>
              </div>
            ))}
            
            {/* No responsible option */}
            <div className="flex items-center space-x-2 px-2 py-1.5 rounded-sm hover:bg-accent">
              <Checkbox
                id="no-responsible"
                checked={selectedResponsibles.includes('Sem responsável')}
                onCheckedChange={() => handleToggleResponsible('Sem responsável')}
              />
              <label
                htmlFor="no-responsible"
                className="text-sm cursor-pointer flex-1 text-muted-foreground italic"
              >
                Sem responsável
              </label>
            </div>
          </div>
        </div>
        
        {hasSelection && selectedResponsibles.length < responsibles.length && (
          <div className="p-2 border-t">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSelectionChange([])}
              className="w-full text-xs"
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
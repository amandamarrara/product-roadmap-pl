import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PHASE_COLORS } from "@/lib/utils";
import { Palette } from "lucide-react";

interface PhaseColorLegendProps {
  className?: string;
}

export function PhaseColorLegend({ className }: PhaseColorLegendProps) {
  const phaseEntries = Object.entries(PHASE_COLORS);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Palette className="h-4 w-4" />
          Cores por Fase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {phaseEntries.map(([phase, color]) => (
            <div key={phase} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground truncate">
                {phase}
              </span>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-3 pt-2 border-t">
          Entregas da mesma fase têm a mesma cor
        </div>
      </CardContent>
    </Card>
  );
}
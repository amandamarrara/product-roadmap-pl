import { PHASE_COLORS } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const predefinedColors = Object.values(PHASE_COLORS);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Cor personalizada</label>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded border cursor-pointer"
          />
          <span className="text-sm text-muted-foreground">{value}</span>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium">Cores pré-definidas</label>
        <div className="grid grid-cols-5 gap-2 mt-1">
          {predefinedColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={`w-8 h-8 rounded border-2 transition-all ${
                value === color ? 'border-foreground' : 'border-border'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Phase-based color mapping for consistent delivery colors
export const PHASE_COLORS = {
  'Onda 1': '#3b82f6',          // Blue
  'Onda 2': '#10b981',          // Green
  'Onda 3': '#f59e0b',          // Amber
  'Onda 4': '#8b5cf6',          // Purple
  'Melhoria MVP': '#ef4444',    // Red
  'Reforma Tributária': '#06b6d4', // Cyan
  'Quebra Monolito': '#f97316',    // Orange
  'Descoberta': '#84cc16',         // Lime
  'Desenvolvimento': '#ec4899',    // Pink
  'Testes': '#6366f1',            // Indigo
  'Produção': '#14b8a6',          // Teal
  'Manutenção': '#a855f7',        // Violet
} as const;

export function generateColorFromPhase(phase: string): string {
  // If phase is mapped, return the mapped color
  if (phase && PHASE_COLORS[phase as keyof typeof PHASE_COLORS]) {
    return PHASE_COLORS[phase as keyof typeof PHASE_COLORS];
  }
  
  // Fallback: generate color from phase name for unmapped phases
  if (!phase || phase.trim() === '') {
    return '#6b7280'; // Gray for empty phases
  }
  
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
  ];
  
  let hash = 0;
  for (let i = 0; i < phase.length; i++) {
    hash = phase.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function generateColorFromString(str: string): string {
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

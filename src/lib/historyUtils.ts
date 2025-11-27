import type { Delivery, SubDelivery } from '@/types/roadmap';
import { format } from 'date-fns';

export interface ChangeRecord {
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
}

// Mapeamento de campos técnicos para labels amigáveis
export const fieldLabels: Record<string, string> = {
  title: 'Título',
  description: 'Descrição',
  start_date: 'Data de Início',
  end_date: 'Data de Fim',
  actual_end_date: 'Data Real de Entrega',
  status: 'Status',
  progress: 'Progresso',
  priority: 'Prioridade',
  complexity: 'Complexidade',
  responsible: 'Responsável',
  delivery_phase: 'Fase',
  delivery_color: 'Cor',
  team: 'Time',
  jira_link: 'Link do Jira',
  completed: 'Concluída'
};

// Formatar valores de status para português
const formatStatus = (status: string | null): string => {
  if (!status) return '';
  const statusMap: Record<string, string> = {
    'not-started': 'Não Iniciada',
    'in-progress': 'Em Progresso',
    'completed': 'Concluída',
    'blocked': 'Bloqueada'
  };
  return statusMap[status] || status;
};

// Formatar valores de prioridade para português
const formatPriority = (priority: string | null): string => {
  if (!priority) return '';
  const priorityMap: Record<string, string> = {
    'low': 'Baixa',
    'medium': 'Média',
    'high': 'Alta',
    'critical': 'Crítica'
  };
  return priorityMap[priority] || priority;
};

// Formatar valores de complexidade para português
const formatComplexity = (complexity: string | null): string => {
  if (!complexity) return '';
  const complexityMap: Record<string, string> = {
    'simple': 'Simples',
    'medium': 'Médio',
    'complex': 'Complexo',
    'very-complex': 'Muito Complexo'
  };
  return complexityMap[complexity] || complexity;
};

// Formatar valor para exibição
export const formatValue = (fieldName: string, value: any): string => {
  if (value === null || value === undefined || value === '') return '';
  
  // Formatar datas
  if (fieldName.includes('date') && value instanceof Date) {
    return format(value, 'dd/MM/yyyy');
  }
  
  // Formatar progresso
  if (fieldName === 'progress') {
    return `${value}%`;
  }
  
  // Formatar boolean
  if (fieldName === 'completed') {
    return value ? 'Sim' : 'Não';
  }
  
  // Formatar status
  if (fieldName === 'status') {
    return formatStatus(String(value));
  }
  
  // Formatar prioridade
  if (fieldName === 'priority') {
    return formatPriority(String(value));
  }
  
  // Formatar complexidade
  if (fieldName === 'complexity') {
    return formatComplexity(String(value));
  }
  
  return String(value);
};

// Converter Date para string no formato ISO para comparação
const dateToString = (date: Date | undefined | null): string | null => {
  if (!date) return null;
  return date.toISOString().split('T')[0];
};

// Comparar entregas e retornar lista de mudanças
export function compareDeliveryChanges(
  oldDelivery: Delivery,
  newDelivery: Delivery
): ChangeRecord[] {
  const changes: ChangeRecord[] = [];
  
  // Comparar título
  if (oldDelivery.title !== newDelivery.title) {
    changes.push({
      fieldName: 'title',
      oldValue: oldDelivery.title,
      newValue: newDelivery.title
    });
  }
  
  // Comparar descrição
  if ((oldDelivery.description || '') !== (newDelivery.description || '')) {
    changes.push({
      fieldName: 'description',
      oldValue: oldDelivery.description || null,
      newValue: newDelivery.description || null
    });
  }
  
  // Comparar datas
  if (dateToString(oldDelivery.startDate) !== dateToString(newDelivery.startDate)) {
    changes.push({
      fieldName: 'start_date',
      oldValue: dateToString(oldDelivery.startDate),
      newValue: dateToString(newDelivery.startDate)
    });
  }
  
  if (dateToString(oldDelivery.endDate) !== dateToString(newDelivery.endDate)) {
    changes.push({
      fieldName: 'end_date',
      oldValue: dateToString(oldDelivery.endDate),
      newValue: dateToString(newDelivery.endDate)
    });
  }
  
  if (dateToString(oldDelivery.actualEndDate) !== dateToString(newDelivery.actualEndDate)) {
    changes.push({
      fieldName: 'actual_end_date',
      oldValue: dateToString(oldDelivery.actualEndDate),
      newValue: dateToString(newDelivery.actualEndDate)
    });
  }
  
  // Comparar outros campos
  if (oldDelivery.status !== newDelivery.status) {
    changes.push({
      fieldName: 'status',
      oldValue: oldDelivery.status,
      newValue: newDelivery.status
    });
  }
  
  if (oldDelivery.progress !== newDelivery.progress) {
    changes.push({
      fieldName: 'progress',
      oldValue: String(oldDelivery.progress),
      newValue: String(newDelivery.progress)
    });
  }
  
  if (oldDelivery.priority !== newDelivery.priority) {
    changes.push({
      fieldName: 'priority',
      oldValue: oldDelivery.priority,
      newValue: newDelivery.priority
    });
  }
  
  if (oldDelivery.complexity !== newDelivery.complexity) {
    changes.push({
      fieldName: 'complexity',
      oldValue: oldDelivery.complexity,
      newValue: newDelivery.complexity
    });
  }
  
  if ((oldDelivery.responsible || '') !== (newDelivery.responsible || '')) {
    changes.push({
      fieldName: 'responsible',
      oldValue: oldDelivery.responsible || null,
      newValue: newDelivery.responsible || null
    });
  }
  
  if ((oldDelivery.deliveryPhase || '') !== (newDelivery.deliveryPhase || '')) {
    changes.push({
      fieldName: 'delivery_phase',
      oldValue: oldDelivery.deliveryPhase || null,
      newValue: newDelivery.deliveryPhase || null
    });
  }
  
  if ((oldDelivery.deliveryColor || '') !== (newDelivery.deliveryColor || '')) {
    changes.push({
      fieldName: 'delivery_color',
      oldValue: oldDelivery.deliveryColor || null,
      newValue: newDelivery.deliveryColor || null
    });
  }
  
  if ((oldDelivery.jiraLink || '') !== (newDelivery.jiraLink || '')) {
    changes.push({
      fieldName: 'jira_link',
      oldValue: oldDelivery.jiraLink || null,
      newValue: newDelivery.jiraLink || null
    });
  }
  
  return changes;
}

// Comparar sub-entregas e retornar lista de mudanças
export function compareSubDeliveryChanges(
  oldSubDelivery: SubDelivery,
  newSubDelivery: SubDelivery
): ChangeRecord[] {
  const changes: ChangeRecord[] = [];
  
  // Comparar título
  if (oldSubDelivery.title !== newSubDelivery.title) {
    changes.push({
      fieldName: 'title',
      oldValue: oldSubDelivery.title,
      newValue: newSubDelivery.title
    });
  }
  
  // Comparar descrição
  if ((oldSubDelivery.description || '') !== (newSubDelivery.description || '')) {
    changes.push({
      fieldName: 'description',
      oldValue: oldSubDelivery.description || null,
      newValue: newSubDelivery.description || null
    });
  }
  
  // Comparar datas
  if (dateToString(oldSubDelivery.startDate) !== dateToString(newSubDelivery.startDate)) {
    changes.push({
      fieldName: 'start_date',
      oldValue: dateToString(oldSubDelivery.startDate),
      newValue: dateToString(newSubDelivery.startDate)
    });
  }
  
  if (dateToString(oldSubDelivery.endDate) !== dateToString(newSubDelivery.endDate)) {
    changes.push({
      fieldName: 'end_date',
      oldValue: dateToString(oldSubDelivery.endDate),
      newValue: dateToString(newSubDelivery.endDate)
    });
  }
  
  if (dateToString(oldSubDelivery.actualEndDate) !== dateToString(newSubDelivery.actualEndDate)) {
    changes.push({
      fieldName: 'actual_end_date',
      oldValue: dateToString(oldSubDelivery.actualEndDate),
      newValue: dateToString(newSubDelivery.actualEndDate)
    });
  }
  
  // Comparar outros campos
  if (oldSubDelivery.status !== newSubDelivery.status) {
    changes.push({
      fieldName: 'status',
      oldValue: oldSubDelivery.status,
      newValue: newSubDelivery.status
    });
  }
  
  if (oldSubDelivery.progress !== newSubDelivery.progress) {
    changes.push({
      fieldName: 'progress',
      oldValue: String(oldSubDelivery.progress),
      newValue: String(newSubDelivery.progress)
    });
  }
  
  if ((oldSubDelivery.team || '') !== (newSubDelivery.team || '')) {
    changes.push({
      fieldName: 'team',
      oldValue: oldSubDelivery.team || null,
      newValue: newSubDelivery.team || null
    });
  }
  
  if ((oldSubDelivery.responsible || '') !== (newSubDelivery.responsible || '')) {
    changes.push({
      fieldName: 'responsible',
      oldValue: oldSubDelivery.responsible || null,
      newValue: newSubDelivery.responsible || null
    });
  }
  
  if ((oldSubDelivery.jiraLink || '') !== (newSubDelivery.jiraLink || '')) {
    changes.push({
      fieldName: 'jira_link',
      oldValue: oldSubDelivery.jiraLink || null,
      newValue: newSubDelivery.jiraLink || null
    });
  }
  
  if (oldSubDelivery.completed !== newSubDelivery.completed) {
    changes.push({
      fieldName: 'completed',
      oldValue: String(oldSubDelivery.completed),
      newValue: String(newSubDelivery.completed)
    });
  }
  
  return changes;
}

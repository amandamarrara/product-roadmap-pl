import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Calendar } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useDeliveryHistory, useSubDeliveryHistory, type HistoryRecord } from '@/hooks/useDeliveryHistory';
import { fieldLabels, formatValue } from '@/lib/historyUtils';

interface HistoryPanelProps {
  deliveryId?: string;
  subDeliveryId?: string;
}

export function HistoryPanel({ deliveryId, subDeliveryId }: HistoryPanelProps) {
  // Buscar histórico apropriado baseado no tipo
  const deliveryHistoryQuery = useDeliveryHistory(deliveryId || null);
  const subDeliveryHistoryQuery = useSubDeliveryHistory(subDeliveryId || null);
  
  const { data: history, isLoading, error } = deliveryId 
    ? deliveryHistoryQuery 
    : subDeliveryHistoryQuery;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Carregando histórico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-destructive">Erro ao carregar histórico</p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">Nenhuma modificação registrada ainda</p>
        <p className="text-xs text-muted-foreground mt-1">
          As alterações futuras serão registradas automaticamente
        </p>
      </div>
    );
  }

  // Agrupar histórico por data e hora
  const groupedHistory = history.reduce((acc, record) => {
    const timestamp = record.created_at;
    if (!acc[timestamp]) {
      acc[timestamp] = [];
    }
    acc[timestamp].push(record);
    return acc;
  }, {} as Record<string, HistoryRecord[]>);

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {Object.entries(groupedHistory).map(([timestamp, records]) => {
          const date = new Date(timestamp);
          const firstRecord = records[0];
          
          return (
            <div key={timestamp} className="border rounded-lg p-4 bg-muted/20">
              {/* Cabeçalho com data e usuário */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{firstRecord.user_email || 'Usuário desconhecido'}</span>
                </div>
              </div>

              {/* Lista de mudanças */}
              <div className="space-y-2">
                {records[0].action === 'create' && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">
                      Criação
                    </Badge>
                    <span className="text-sm">
                      {deliveryId ? 'Entrega criada' : 'Sub-entrega criada'}
                    </span>
                  </div>
                )}
                
                {records[0].action === 'update' && records.map((record, idx) => {
                  if (!record.field_name) return null;
                  
                  const fieldLabel = fieldLabels[record.field_name] || record.field_name;
                  const oldValueFormatted = record.old_value 
                    ? formatValue(record.field_name, record.old_value)
                    : 'Vazio';
                  const newValueFormatted = record.new_value
                    ? formatValue(record.field_name, record.new_value)
                    : 'Vazio';

                  return (
                    <div key={idx} className="text-sm">
                      <span className="font-medium text-foreground">{fieldLabel}:</span>{' '}
                      <span className="text-muted-foreground line-through">{oldValueFormatted}</span>
                      {' → '}
                      <span className="text-foreground font-medium">{newValueFormatted}</span>
                    </div>
                  );
                })}

                {records[0].action === 'delete' && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400">
                      Exclusão
                    </Badge>
                    <span className="text-sm">
                      {deliveryId ? 'Entrega excluída' : 'Sub-entrega excluída'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

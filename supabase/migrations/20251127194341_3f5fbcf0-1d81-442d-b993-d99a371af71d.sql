-- Criar tabela de histórico de entregas
CREATE TABLE delivery_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_email TEXT,
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  field_name TEXT, -- campo alterado (null se for create/delete)
  old_value TEXT, -- valor anterior
  new_value TEXT, -- novo valor
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela de histórico de subentregas
CREATE TABLE sub_delivery_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_delivery_id UUID NOT NULL REFERENCES sub_deliveries(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL,
  user_id UUID NOT NULL,
  user_email TEXT,
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS nas tabelas de histórico
ALTER TABLE delivery_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_delivery_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para delivery_history
-- Usuários podem ver histórico de entregas que têm acesso ao roadmap
CREATE POLICY "Users can view delivery history for accessible roadmaps"
ON delivery_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM deliveries d
    WHERE d.id = delivery_history.delivery_id
    AND (d.user_id = auth.uid() OR has_roadmap_access(d.roadmap_id, auth.uid()))
  )
);

-- Apenas usuários autenticados podem inserir registros de histórico
CREATE POLICY "Authenticated users can insert delivery history"
ON delivery_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para sub_delivery_history
-- Usuários podem ver histórico de subentregas que têm acesso ao roadmap
CREATE POLICY "Users can view sub_delivery history for accessible roadmaps"
ON sub_delivery_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM sub_deliveries sd
    JOIN deliveries d ON d.id = sd.delivery_id
    WHERE sd.id = sub_delivery_history.sub_delivery_id
    AND (sd.user_id = auth.uid() OR has_roadmap_access(d.roadmap_id, auth.uid()))
  )
);

-- Apenas usuários autenticados podem inserir registros de histórico
CREATE POLICY "Authenticated users can insert sub_delivery history"
ON sub_delivery_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Criar índices para melhorar performance das consultas
CREATE INDEX idx_delivery_history_delivery_id ON delivery_history(delivery_id);
CREATE INDEX idx_delivery_history_created_at ON delivery_history(created_at DESC);
CREATE INDEX idx_sub_delivery_history_sub_delivery_id ON sub_delivery_history(sub_delivery_id);
CREATE INDEX idx_sub_delivery_history_created_at ON sub_delivery_history(created_at DESC);
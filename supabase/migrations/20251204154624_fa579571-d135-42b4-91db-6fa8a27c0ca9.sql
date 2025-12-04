-- Adicionar coluna category com DEFAULT 'other'
-- Todos os marcos existentes receberão automaticamente 'other'
ALTER TABLE milestones 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'other';

-- Garantir que marcos existentes sem categoria recebam 'other'
UPDATE milestones SET category = 'other' WHERE category IS NULL;

-- Adicionar constraint para valores válidos
ALTER TABLE milestones 
ADD CONSTRAINT milestones_category_check 
CHECK (category IN ('delivery', 'freezing', 'vacation', 'other'));
-- Add actual_end_date to deliveries table
ALTER TABLE deliveries 
ADD COLUMN actual_end_date DATE;

-- Add actual_end_date to sub_deliveries table
ALTER TABLE sub_deliveries 
ADD COLUMN actual_end_date DATE;

-- Add comments explaining the field
COMMENT ON COLUMN deliveries.actual_end_date IS 'Data real de finalização da entrega. Pode ser diferente da data planejada (end_date)';
COMMENT ON COLUMN sub_deliveries.actual_end_date IS 'Data real de finalização da sub-entrega. Pode ser diferente da data planejada (end_date)';
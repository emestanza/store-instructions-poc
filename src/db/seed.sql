-- Sample stores for testing
INSERT INTO stores (external_id, name, address, brand_id, brand_name, active) VALUES
  ('store_001', 'Walmart Polanco', 'Av. Presidente Masaryk 111, Polanco, CDMX', 1, 'Walmart', 1),
  ('store_002', 'Soriana Santa Fe', 'Av. Vasco de Quiroga 3800, Santa Fe, CDMX', 2, 'Soriana', 1),
  ('store_003', 'Chedraui Coyoacán', 'Av. Universidad 1650, Coyoacán, CDMX', 3, 'Chedraui', 1);

-- Sample instruction for Walmart Polanco
INSERT INTO instructions (store_id, title, active, version) VALUES
  (1, 'Instrucciones de llegada - Walmart Polanco', 1, 1);

-- Sample blocks for the instruction
INSERT INTO instruction_blocks (instruction_id, position, block_type, text_content) VALUES
  (1, 1, 'text', 'Bienvenido a Walmart Polanco. Por favor sigue estas instrucciones para una llegada exitosa.');

INSERT INTO instruction_blocks (instruction_id, position, block_type, text_content) VALUES
  (1, 2, 'text', 'Estacionamiento: Utiliza el estacionamiento subterráneo. La entrada está por Av. Presidente Masaryk.');

INSERT INTO instruction_blocks (instruction_id, position, block_type, text_content) VALUES
  (1, 3, 'text', 'Check-in: Dirígete al mostrador de servicio al cliente en el primer piso. Presenta tu identificación de Zubalero.');

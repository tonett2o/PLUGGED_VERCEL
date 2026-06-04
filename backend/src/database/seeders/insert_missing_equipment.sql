-- Script para insertar el equipamiento faltante
-- Ejecutar esta consulta en la base de datos 'laravel' después de que Docker esté corriendo

-- Hardware faltante (5 items)
INSERT INTO hardware (nombre, marca, precio, imagen, descripcion, created_at, updated_at) VALUES
('DJM-A9', 'Pioneer DJ', 2799.00, 'gear/djm_a9.png', 'Mezclador club estándar 4 canales', NOW(), NOW()),
('CDJ-3000', 'Pioneer DJ', 2499.00, 'gear/cdj3000.png', 'Reproductor multiformato profesional', NOW(), NOW()),
('KH 120 II', 'Neumann', 1800.00, 'gear/neumann.png', 'Monitores de estudio campo cercano', NOW(), NOW()),
('TR-909', 'Roland', 3500.00, 'gear/tr909.png', 'Caja de ritmos analógica histórica', NOW(), NOW()),
('OB-6', 'Sequential', 3200.00, 'gear/ob6.png', 'Sintetizador analógico polifónico', NOW(), NOW());

-- Software faltante (4 items)
INSERT INTO software (nombre, version, distribuidor, precio, imagen, tipo_pago, descripcion, created_at, updated_at) VALUES
('Bitwig Studio', '5.0', 'Bitwig', 399.00, 'sw/bitwig.png', 'unico', 'DAW moderno con modulación modular', NOW(), NOW()),
('Rekordbox', '7.0', 'Pioneer DJ', 0.00, 'sw/rekordbox.png', 'gratuito', 'Gestor de bibliotecas DJ', NOW(), NOW()),
('Traktor Pro 4', '4.0', 'Native Instruments', 99.00, 'sw/traktor.png', 'unico', 'Software de mezcla creativa', NOW(), NOW()),
('Serato DJ Pro', '3.1', 'Serato', 249.00, 'sw/serato.png', 'unico', 'Software de mezcla estándar en club', NOW(), NOW());

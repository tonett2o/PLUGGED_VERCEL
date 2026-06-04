<?php

/**
 * ProducerPersonas - Datos reales de 15 productores musicales europeos
 *
 * Cada persona incluye perfiles coherentes con:
 * - Nicks únicos, nombres reales
 * - Rol (dj, productor)
 * - Ubicación geográfica europea (con coordenadas reales)
 * - Géneros primarios que producen
 * - IDs de hardware/software que usan (referencias a EquipamientoRealSeeder)
 * - Biografía realista
 * - Redes sociales opcionales
 *
 * Los hardware_ids y software_ids corresponden a índices del array en
 * EquipamientoRealSeeder (0-indexed en el array, pero IDs en BD son 1-indexed)
 */

return [
    // ====== BERLIN TECHNO CREW ======
    [
        'nick' => 'alex_techno_berlin',
        'nombre' => 'Alex Müller',
        'email' => 'alex.muller@techno.de',
        'rol' => 'productor',
        'ubicacion' => 'Kreuzberg, Berlin',
        'latitud' => 52.5010,
        'longitud' => 13.3997,
        'estilos_primarios' => ['Industrial Techno', 'Berlin Techno', 'Hard Techno'],
        'hardware_ids' => [9, 10, 1], // TR-909, OB-6, DJM-A9 (IDs 1-based)
        'software_ids' => [1, 4], // Ableton Live 12, Bitwig Studio
        'biografia' => 'Industrial techno producer obsesionado con síntesis analógica. Frecuentemente en Berghain. Construye sus propios sintetizadores.',
        'twitter' => '@alextechnoberlin',
        'instagram' => 'alex_techno_berlin'
    ],
    [
        'nick' => 'luna_deep_house',
        'nombre' => 'Luna Richter',
        'email' => 'luna.richter@music.de',
        'rol' => 'dj',
        'ubicacion' => 'Friedrichshain, Berlin',
        'latitud' => 52.5139,
        'longitud' => 13.4472,
        'estilos_primarios' => ['Deep House', 'Tech House', 'Minimal'],
        'hardware_ids' => [6, 7, 5], // KH 120 II, HS8, Xone:96
        'software_ids' => [1, 11], // Ableton, Rekordbox
        'biografia' => 'DJ de Deep House con especialidad en sets rítmicos. Residency en clubs berlineses. Vinilo analógico collector.',
        'instagram' => 'luna_deephousemix'
    ],
    [
        'nick' => 'kai_industrial',
        'nombre' => 'Kai Schröder',
        'email' => 'kai@industrial-sounds.de',
        'rol' => 'productor',
        'ubicacion' => 'Wedding, Berlin',
        'latitud' => 52.5411,
        'longitud' => 13.3890,
        'estilos_primarios' => ['Industrial Techno', 'EBM', 'Detroit Techno'],
        'hardware_ids' => [1, 9, 13], // DJM-A9, TR-909, Maschine MK3
        'software_ids' => [1, 4], // Ableton, Bitwig
        'biografia' => 'Producción experimental industrial. Influenciado por la escena EBM 80s. Studio casero lleno de sintetizadores.',
        'twitter' => '@kai_industrial'
    ],

    // ====== AMSTERDAM HOUSE CREW ======
    [
        'nick' => 'moses_house_ams',
        'nombre' => 'Moses van der Berg',
        'email' => 'moses@housedublin.nl',
        'rol' => 'productor',
        'ubicacion' => 'Amsterdam',
        'latitud' => 52.3676,
        'longitud' => 4.9041,
        'estilos_primarios' => ['Progressive House', 'Soulful House', 'Deep House'],
        'hardware_ids' => [6, 8, 4], // Neumann monitors, VXT8, CDJ-3000
        'software_ids' => [2, 1], // FL Studio 21, Ableton
        'biografia' => 'Productor de Progressive House con raíces en la escena Amsterdam. Residencies en Dekmantel y Melkweg.',
        'instagram' => 'moses_progressive_house'
    ],
    [
        'nick' => 'iris_tech_house',
        'nombre' => 'Iris Vermeulen',
        'email' => 'iris@techhouse.nl',
        'rol' => 'dj',
        'ubicacion' => 'Amsterdam-West',
        'latitud' => 52.3643,
        'longitud' => 4.8765,
        'estilos_primarios' => ['Tech House', 'House', 'Acid House'],
        'hardware_ids' => [3, 5, 7], // CDJ-3000, Xone:96, HS8
        'software_ids' => [11, 12], // Rekordbox, Traktor Pro 4
        'biografia' => 'DJ técnica especializada en transiciones suave. Viaja por festivales europeos. Love for vinilo de 90s.',
        'twitter' => '@iris_tech_house'
    ],
    [
        'nick' => 'sander_acid',
        'nombre' => 'Sander Koen',
        'email' => 'sander@acid.nl',
        'rol' => 'productor',
        'ubicacion' => 'Amsterdam',
        'latitud' => 52.3650,
        'longitud' => 4.9050,
        'estilos_primarios' => ['Acid House', 'Acid Techno', 'House'],
        'hardware_ids' => [11, 9, 10], // PLX-1000, TR-909, OB-6
        'software_ids' => [2, 5], // FL Studio, Serum VST
        'biografia' => 'Especialista en sonidos ácidos puros. Estudios llenos de sintetizadores vintage. Influenciado por Chicago House.',
        'instagram' => 'sander_acid_house'
    ],

    // ====== LONDON DRUM & BASS CREW ======
    [
        'nick' => 'jack_liquid',
        'nombre' => 'Jack Morrison',
        'email' => 'jack@liquid.uk',
        'rol' => 'productor',
        'ubicacion' => 'Hackney, London',
        'latitud' => 51.5471,
        'longitud' => -0.0629,
        'estilos_primarios' => ['Liquid Funk', 'Drum & Bass', 'Liquid Drum & Bass'],
        'hardware_ids' => [6, 8, 2], // Neumann, KRK, SL-1200MK7
        'software_ids' => [3, 1], // Logic Pro X, Ableton
        'biografia' => 'Productor de Liquid Drum & Bass con énfasis en atmósferas. Influenciado por Calibre y High Contrast.',
        'twitter' => '@jack_liquid_dnb'
    ],
    [
        'nick' => 'maya_neurofunk',
        'nombre' => 'Maya Singh',
        'email' => 'maya@neurofunk.uk',
        'rol' => 'dj',
        'ubicacion' => 'Shoreditch, London',
        'latitud' => 51.5206,
        'longitud' => -0.0830,
        'estilos_primarios' => ['Neurofunk', 'Drum & Bass', 'Jump Up'],
        'hardware_ids' => [1, 4, 3], // DJM-A9, SL-1200, CDJ-3000
        'software_ids' => [12, 11], // Traktor Pro 4, Rekordbox
        'biografia' => 'DJ Neurofunk de alto nivel con set técnicos intensos. Residency en Fabric y clubs de dnb londinenses.',
        'instagram' => 'maya_neurofunk_sounds'
    ],

    // ====== BARCELONA DEEP HOUSE CREW ======
    [
        'nick' => 'carlos_deep_barca',
        'nombre' => 'Carlos Martínez',
        'email' => 'carlos@deephouse.es',
        'rol' => 'productor',
        'ubicacion' => 'Barcelona',
        'latitud' => 41.3851,
        'longitud' => 2.1734,
        'estilos_primarios' => ['Deep House', 'Soulful House', 'House'],
        'hardware_ids' => [6, 8, 14], // Neumann, KRK, Push 3
        'software_ids' => [1, 7], // Ableton Live, Omnisphere 2
        'biografia' => 'Productor Deep House con influencias latinos. Studio en Gràcia. Sets relajados pero hipnotizantes.',
        'twitter' => '@carlos_deep_barca'
    ],
    [
        'nick' => 'ana_soulful',
        'nombre' => 'Ana García',
        'email' => 'ana@soulful.es',
        'rol' => 'dj',
        'ubicacion' => 'Barcelona',
        'latitud' => 41.3860,
        'longitud' => 2.1700,
        'estilos_primarios' => ['Soulful House', 'Deep House', 'Melodic Dubstep'],
        'hardware_ids' => [7, 8, 1], // HS8, VXT8, DJM-A9
        'software_ids' => [1, 11], // Ableton, Rekordbox
        'biografia' => 'DJ con corazón soulful. Especializada en reads emocionalmente intensas. Residency en clubs de playa.',
        'instagram' => 'ana_soulful_vibes'
    ],

    // ====== IBIZA TRANCE CREW ======
    [
        'nick' => 'diego_trance_ibiza',
        'nombre' => 'Diego Fernández',
        'email' => 'diego@trance.es',
        'rol' => 'dj',
        'ubicacion' => 'Ibiza',
        'latitud' => 38.9067,
        'longitud' => 1.1608,
        'estilos_primarios' => ['Progressive Trance', 'Uplifting Trance', 'Trance'],
        'hardware_ids' => [3, 4, 5], // CDJ-3000, SL-1200, Xone:96
        'software_ids' => [11, 12, 1], // Rekordbox, Traktor, Ableton
        'biografia' => 'Leyenda local de Ibiza. Resident en clubs icónicos. Sets de 4+ horas épicas. Colector de vinilo raro.',
        'twitter' => '@diego_trance_ibiza'
    ],
    [
        'nick' => 'sophia_psytrance',
        'nombre' => 'Sophia Nikolaidis',
        'email' => 'sophia@psytrance.gr',
        'rol' => 'productor',
        'ubicacion' => 'Atenas (residente en Ibiza)',
        'latitud' => 37.9838,
        'longitud' => 23.7275,
        'estilos_primarios' => ['Psytrance', 'Goa Trance', 'Progressive Trance'],
        'hardware_ids' => [9, 10, 11], // TR-909, OB-6, Push 3
        'software_ids' => [1, 2, 5], // Ableton, FL Studio, Serum
        'biografia' => 'Productor Psytrance con influencias del Goa trance clásico. Estudios en Atenas y Ibiza.',
        'instagram' => 'sophia_psytrance_cosmos'
    ],

    // ====== PARIS ELECTRO/FRENCH TOUCH CREW ======
    [
        'nick' => 'laurent_french_touch',
        'nombre' => 'Laurent Dubois',
        'email' => 'laurent@frenchtouch.fr',
        'rol' => 'productor',
        'ubicacion' => 'Marais, Paris',
        'latitud' => 48.8637,
        'longitud' => 2.3615,
        'estilos_primarios' => ['French Touch', 'Electro House', 'Filtered House'],
        'hardware_ids' => [10, 11, 6], // OB-6, Push 3, Neumann monitors
        'software_ids' => [3, 1, 7], // Logic Pro X, Ableton, Omnisphere 2
        'biografia' => 'Heredero de la escena French Touch. Producción melódica sofisticada. Studio vintage en el Marais.',
        'twitter' => '@laurent_ft_paris'
    ],
    [
        'nick' => 'marie_electro',
        'nombre' => 'Marie Leclerc',
        'email' => 'marie@electro.fr',
        'rol' => 'dj',
        'ubicacion' => 'Paris',
        'latitud' => 48.8566,
        'longitud' => 2.3522,
        'estilos_primarios' => ['Electro', 'Electro House', 'Tech House'],
        'hardware_ids' => [1, 5, 8], // DJM-A9, Xone:96, KRK
        'software_ids' => [11, 12], // Rekordbox, Traktor Pro 4
        'biografia' => 'DJ técnica con énfasis en sonidos electro clasicos. Residencies en venues legendarias parisienses.',
        'instagram' => 'marie_electro_paris'
    ]
];

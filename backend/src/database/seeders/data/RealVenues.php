<?php

/**
 * RealVenues - Festivales y clubs reales europeos
 *
 * Cada venue incluye:
 * - Nombre real del festival/club
 * - Ciudad y país
 * - Coordenadas geográficas (latitude, longitude) reales
 * - Géneros primarios que típicamente se tocan
 * - Tipo (festival, club)
 * - URL de venta (genérica, se personalizará en DB)
 *
 * Las coordenadas son reales para poder mostrar en mapas.
 */

return [
    [
        'nombre' => 'Tomorrowland',
        'nombre_sala' => 'Tomorrowland Festival',
        'ciudad' => 'Boom',
        'pais' => 'Belgium',
        'ubicacion' => 'De Schorre, Boom, Belgium',
        'latitud' => 51.1635,
        'longitud' => 4.3436,
        'tipo' => 'festival',
        'url_venta' => 'https://www.tomorrowland.com',
        'estilos_primarios' => ['Trance', 'Progressive House', 'Uplifting Trance', 'Future Bass'],
        'descripcion' => 'El festival de electrónica más grande de Europa, con múltiples escenarios y experiencia inmersiva.'
    ],
    [
        'nombre' => 'Berghain',
        'nombre_sala' => 'Berghain Club',
        'ciudad' => 'Berlin',
        'pais' => 'Germany',
        'ubicacion' => 'Friedrichshain, Berlin, Germany',
        'latitud' => 52.5104,
        'longitud' => 13.4436,
        'tipo' => 'club',
        'url_venta' => 'https://www.berghain.de',
        'estilos_primarios' => ['Industrial Techno', 'Berlin Techno', 'Hard Techno'],
        'descripcion' => 'Legendario club de techno industrial en Berlin. Atmósfera cruda, sonido impecable, door policy estricta.'
    ],
    [
        'nombre' => 'Printworks',
        'nombre_sala' => 'Printworks London',
        'ciudad' => 'London',
        'pais' => 'UK',
        'ubicacion' => 'Clink Street, London, UK',
        'latitud' => 51.5046,
        'longitud' => -0.0865,
        'tipo' => 'club',
        'url_venta' => 'https://www.printworkslondon.com',
        'estilos_primarios' => ['House', 'Techno', 'Drum & Bass', 'Tech House'],
        'descripcion' => 'Espacio multifuncional de vanguardia con tecnología de sonido e iluminación de clase mundial.'
    ],
    [
        'nombre' => 'Fabric',
        'nombre_sala' => 'Fabric London',
        'ciudad' => 'London',
        'pais' => 'UK',
        'ubicacion' => 'Charterhouse Street, London, UK',
        'latitud' => 51.5189,
        'longitud' => -0.1002,
        'tipo' => 'club',
        'url_venta' => 'https://www.fabriclondon.com',
        'estilos_primarios' => ['Drum & Bass', 'House', 'Techno', 'Garage'],
        'descripcion' => 'Icónico club londinense reabierto con residencies de artistas internacionales.'
    ],
    [
        'nombre' => 'Dekmantel',
        'nombre_sala' => 'Dekmantel Festival',
        'ciudad' => 'Amsterdam',
        'pais' => 'Netherlands',
        'ubicacion' => 'Zeeburgereiland, Amsterdam, Netherlands',
        'latitud' => 52.3848,
        'longitud' => 4.9364,
        'tipo' => 'festival',
        'url_venta' => 'https://www.dekmantel.com',
        'estilos_primarios' => ['House', 'Deep House', 'Techno', 'Ambient'],
        'descripcion' => 'Festival de 2 días en isla artificial. Curaduría de artistas independientes, atmósfera intelectual.'
    ],
    [
        'nombre' => 'Green Valley',
        'nombre_sala' => 'Green Valley Festival',
        'ciudad' => 'Covilhã',
        'pais' => 'Portugal',
        'ubicacion' => 'Serra da Estrela, Covilhã, Portugal',
        'latitud' => 40.2835,
        'longitud' => -7.4977,
        'tipo' => 'festival',
        'url_venta' => 'https://www.greenvalle.pt',
        'estilos_primarios' => ['Techno', 'House', 'Deep House', 'Ambient'],
        'descripcion' => 'Festival sostenible en naturaleza portuguesa. Sets de 12+ horas, enfoque en artistas de vanguardia.'
    ],
    [
        'nombre' => 'Awakenings',
        'nombre_sala' => 'Awakenings Festival',
        'ciudad' => 'Amsterdam',
        'pais' => 'Netherlands',
        'ubicacion' => 'Park Frankendael, Amsterdam, Netherlands',
        'latitud' => 52.3520,
        'longitud' => 4.9352,
        'tipo' => 'festival',
        'url_venta' => 'https://www.awakenings.nl',
        'estilos_primarios' => ['House', 'Techno', 'Progressive House', 'Tech House'],
        'descripcion' => 'Festival con raíces en nightclub homónimo. Lineup cuidadosamente curado, ambiente comunal.'
    ],
    [
        'nombre' => 'Time Warp',
        'nombre_sala' => 'Time Warp Festival',
        'ciudad' => 'Mannheim',
        'pais' => 'Germany',
        'ubicacion' => 'Maimarkt-Gelände, Mannheim, Germany',
        'latitud' => 49.4891,
        'longitud' => 8.4673,
        'tipo' => 'festival',
        'url_venta' => 'https://www.timewarpfestival.de',
        'estilos_primarios' => ['Techno', 'Industrial Techno', 'Hard Techno', 'Detroit Techno'],
        'descripcion' => 'Festival de techno puro alemán. Enfoque en sonido y producción. Artistas experimentales.'
    ],
    [
        'nombre' => 'Monegros Festival',
        'nombre_sala' => 'Monegros Desert Festival',
        'ciudad' => 'Fraga',
        'pais' => 'Spain',
        'ubicacion' => 'Las Monegros, Fraga, Spain',
        'latitud' => 41.5258,
        'longitud' => -0.4989,
        'tipo' => 'festival',
        'url_venta' => 'https://www.monegros.com',
        'estilos_primarios' => ['House', 'Techno', 'Trance', 'Electro'],
        'descripcion' => 'Festival desert de verano español. Ambiente de playa electrónica, múltiples escenarios simultáneos.'
    ],
    [
        'nombre' => 'Sensation Outdoor',
        'nombre_sala' => 'Sensation Festival',
        'ciudad' => 'Amsterdam',
        'pais' => 'Netherlands',
        'ubicacion' => 'Flevopolder, Netherlands',
        'latitud' => 52.1951,
        'longitud' => 4.4774,
        'tipo' => 'festival',
        'url_venta' => 'https://www.sensation.com',
        'estilos_primarios' => ['Progressive House', 'House', 'Trance', 'Future Bass'],
        'descripcion' => 'Festival masivo de casa diseñado con concepto temático anual. Producción de espectáculo épica.'
    ],
    [
        'nombre' => 'Elektra Festival',
        'nombre_sala' => 'Elektra',
        'ciudad' => 'Turku',
        'pais' => 'Finland',
        'ubicacion' => 'Ruissalo, Turku, Finland',
        'latitud' => 60.4517,
        'longitud' => 22.0808,
        'tipo' => 'festival',
        'url_venta' => 'https://www.elektrafestival.fi',
        'estilos_primarios' => ['House', 'Techno', 'Electronic'],
        'descripcion' => 'Festival finlandés en isla natural. Enfoque en sostenibilidad y experiencia comunitaria.'
    ],
    [
        'nombre' => 'RTS.FM Warehouse',
        'nombre_sala' => 'RTS Warehouse',
        'ciudad' => 'Moscow',
        'pais' => 'Russia',
        'ubicacion' => 'Luzhniki, Moscow, Russia',
        'latitud' => 55.7188,
        'longitud' => 37.5525,
        'tipo' => 'club',
        'url_venta' => 'https://rts.fm',
        'estilos_primarios' => ['Techno', 'House', 'Industrial Techno'],
        'descripcion' => 'Club warehouse de Moscú con escena techno emergente. Residencies de productores locales.'
    ],
    [
        'nombre' => 'Movement Festival',
        'nombre_sala' => 'Movement',
        'ciudad' => 'Detroit',
        'pais' => 'USA',
        'ubicacion' => 'Hart Plaza, Detroit, USA',
        'latitud' => 42.3314,
        'longitud' => -83.0458,
        'tipo' => 'festival',
        'url_venta' => 'https://www.movement.us',
        'estilos_primarios' => ['Detroit Techno', 'House', 'Drum & Bass'],
        'descripcion' => 'Festival legendario honrando la historia techno de Detroit. Artistas locales e internacionales.'
    ]
];

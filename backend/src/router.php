<?php

/**
 * Router para PHP built-in server
 * Añade cabeceras CORS a archivos estáticos (storage) que no pasan por Laravel
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$file = __DIR__ . '/public' . $uri;

// Si es un archivo estático que existe, añadir CORS y servirlo
if ($uri !== '/' && file_exists($file) && !is_dir($file)) {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    $allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://pluggedvercel-production.up.railway.app',
    ];

    $allowedPattern = '/^https:\/\/plugged-?vercel.*\.vercel\.app$/';

    if (in_array($origin, $allowedOrigins) || preg_match($allowedPattern, $origin)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Methods: GET');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
    }

    return false; // Servir el archivo estático normalmente
}

// Todo lo demás pasa por Laravel
require __DIR__ . '/public/index.php';

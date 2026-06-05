<?php

/**
 * Router para PHP built-in server
 * Sirve archivos estáticos de storage/ con cabeceras CORS correctas
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$file = __DIR__ . '/public' . $uri;
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://pluggedvercel-production.up.railway.app',
];
$allowedPattern = '/^https:\/\/plugged-?vercel.*\.vercel\.app$/';
$isAllowed = in_array($origin, $allowedOrigins) || preg_match($allowedPattern, $origin);

// Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if ($isAllowed) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
        header('Vary: Origin');
    }
    http_response_code(204);
    exit;
}

// Archivos estáticos en storage/ (audio, imágenes)
if ($uri !== '/' && file_exists($file) && !is_dir($file)) {
    if ($isAllowed) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }

    // MIME types
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $mimeTypes = [
        'mp3'  => 'audio/mpeg',
        'wav'  => 'audio/wav',
        'ogg'  => 'audio/ogg',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'gif'  => 'image/gif',
        'webp' => 'image/webp',
    ];
    $contentType = $mimeTypes[$ext] ?? mime_content_type($file);
    $size = filesize($file);

    header('Content-Type: ' . $contentType);
    header('Accept-Ranges: bytes');

    // Soporte Range requests (necesario para seekbar de audio)
    if (isset($_SERVER['HTTP_RANGE'])) {
        preg_match('/bytes=(\d+)-(\d*)/', $_SERVER['HTTP_RANGE'], $matches);
        $start = intval($matches[1]);
        $end = isset($matches[2]) && $matches[2] !== '' ? intval($matches[2]) : $size - 1;
        $end = min($end, $size - 1);
        http_response_code(206);
        header("Content-Range: bytes $start-$end/$size");
        header('Content-Length: ' . ($end - $start + 1));
        $fp = fopen($file, 'rb');
        fseek($fp, $start);
        $remaining = $end - $start + 1;
        while ($remaining > 0 && !feof($fp)) {
            $chunk = min(8192, $remaining);
            echo fread($fp, $chunk);
            $remaining -= $chunk;
        }
        fclose($fp);
    } else {
        header('Content-Length: ' . $size);
        readfile($file);
    }
    exit;
}

// Todo lo demás pasa por Laravel
require __DIR__ . '/public/index.php';

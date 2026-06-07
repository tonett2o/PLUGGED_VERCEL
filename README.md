# PLUGGED

**La red social para la comunidad de música electrónica.**

PLUGGED es una plataforma web donde DJs, productores y amantes de la música electrónica pueden subir su música, descubrir artistas, organizar eventos y compartir el equipo con el que crean su sonido. Una mezcla entre un reproductor de música y una red social, pensada para la escena electrónica.

🔗 **Pruébalo en vivo:** [plugged-vercel.vercel.app](https://plugged-vercel.vercel.app/)

---

## ¿Qué se puede hacer en PLUGGED?

-  **Subir y escuchar música** — Publica tus tracks y escúchalos con un reproductor integrado que se mueve contigo por toda la web.
-  **Organizar tu música** — Agrupa tus canciones en álbumes, EPs y playlists.
-  **Descubrir eventos** — Publica conciertos y fiestas en un mapa interactivo para que la gente sepa dónde tocas.
-  **Mostrar tu setup** — Comparte el hardware y software (mesas de mezclas, sintetizadores, programas) que usas para crear tu música.
-  **Crear tu perfil de artista** — Personaliza tu página con avatar, biografía, ubicación, redes sociales y una galería de fotos.
-  **Interactuar con la comunidad** — Sigue a otros artistas, da "me gusta" y comenta las canciones.
-  **Buscar y explorar** — Encuentra artistas, canciones y álbumes, y consulta los rankings de lo más escuchado.

---

## Tecnologías utilizadas

PLUGGED está dividido en dos partes que funcionan por separado y se comunican entre sí:

### Frontend (lo que ves y usas)
- **React** — La librería para construir la interfaz.
- **Vite** — Herramienta que hace que el desarrollo sea rápido.
- **React Router** — Para navegar entre páginas sin recargar.
- **MapLibre** — Los mapas interactivos de eventos.
- **WaveSurfer.js** — Las ondas visuales del reproductor de audio.

### Backend (el cerebro y la base de datos)
- **Laravel (PHP)** — El framework que gestiona los datos y la lógica.
- **MySQL** — La base de datos donde se guarda todo.
- **Laravel Sanctum** — El sistema de inicio de sesión seguro.

### Dónde está alojado
- **Vercel** — Aloja el frontend.
- **Railway** — Aloja el backend y la base de datos.
- **Docker** — Para levantar el entorno de desarrollo de forma idéntica en cualquier ordenador.

---

## Cómo ejecutarlo en tu ordenador

Si quieres probar el proyecto en local, necesitas tener instalados **Node.js** (para el frontend) y **PHP + Composer** (para el backend).

### 1. Descargar el proyecto

```bash
git clone https://github.com/tonett2o/PLUGGED_VERCEL.git
cd PLUGGED_VERCEL
```

### 2. Arrancar el frontend

```bash
cd frontend
npm install        # Instala las dependencias (solo la primera vez)
npm run dev        # Arranca la web en modo desarrollo
```

La web se abrirá en `http://localhost:5173`.

### 3. Arrancar el backend

```bash
cd backend/src
composer install   # Instala las dependencias (solo la primera vez)
php artisan serve  # Arranca el servidor en http://localhost:8000
```

> El frontend detecta automáticamente si estás en local y se conecta al backend de tu ordenador.

---

## Estructura del proyecto

```
PLUGGED_VERCEL/
├── frontend/      → La aplicación web (React)
└── backend/       → El servidor y la API (Laravel)
```

---

## Autor

Proyecto desarrollado por **Toni Sánchez** como Trabajo de Fin de Grado (TFG).

---

*PLUGGED — Conecta con tu sonido.*
a
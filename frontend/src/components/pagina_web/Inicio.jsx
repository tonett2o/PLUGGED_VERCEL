import React, { useState, useContext, useEffect } from "react";
import API_URL from "../../config/api.js";
import { contextoMusica } from "../../contexts/ProveedorMusica.jsx";
import { generos46 } from "../../utils/generos.js";
import FilaCarrusel from "../FilaCarrusel.jsx";
import HeroEstadisticas from "../HeroEstadisticas.jsx";
import BuscadorGenero from "../BuscadorGenero.jsx";
import Cancion from "../componentes_principales/Cancion.jsx";
import Coleccion from "../componentes_principales/Coleccion.jsx";
import Playlist from "../componentes_principales/Playlist.jsx";
import './Inicio.css';

export const Inicio = () => {
    const { canciones: cancionesGlobales = [], colecciones = [], playlists = [] } = useContext(contextoMusica) || {};
    const [busquedaGenero, setBusquedaGenero] = useState('');
    const [canciones, setCanciones] = useState(cancionesGlobales);

    // Refrescar canciones del backend cuando se carga la página
    useEffect(() => {
        const refrescarCanciones = async () => {
            try {
                const res = await fetch(`${API_URL}/api/canciones`);
                const data = await res.json();
                setCanciones(data);
            } catch (e) {
                setCanciones(cancionesGlobales);
            }
        };
        refrescarCanciones();

        // 🔄 POLLING: Verificar nuevas canciones y reproducciones cada 5 segundos
        const intervaloPolling = setInterval(() => {
            refrescarCanciones();
        }, 5000); // 5 segundos para captar cambios más rápido

        // Limpieza al desmontar
        return () => clearInterval(intervaloPolling);
    }, []);

    // 🔄 SINCRONIZAR: Si el contexto global cambia, actualizar también
    useEffect(() => {
        if (cancionesGlobales && cancionesGlobales.length > 0) {
            setCanciones(cancionesGlobales);
        }
    }, [cancionesGlobales]);

    // Canciones nuevas ordenadas por fecha más reciente (solo públicas)
    const cancionesNuevas = [...canciones]
        .filter(c => c.privacidad === 'publica' || !c.privacidad)
        .sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion))
        .slice(0, 20);

    // Álbumes nuevos (tipo album o ep, solo públicos)
    const albumesNuevos = colecciones
        .filter(c => (c.privacidad === 'publica' || !c.privacidad) && c.tipo && ['album', 'ep'].includes(c.tipo.toLowerCase()))
        .slice(0, 15);

    // Todas las colecciones públicas
    const coleccionesPublicas = colecciones
        .filter(c => c.privacidad === 'publica' || !c.privacidad)
        .slice(0, 15);

    // Género seleccionado basado en búsqueda
    const generoSeleccionado = busquedaGenero.trim() === ''
        ? null
        : generos46.find(g => g.nombre.toLowerCase() === busquedaGenero.toLowerCase());

    // Canciones del género seleccionado (solo públicas)
    const cancionesDelGenero = generoSeleccionado
        ? canciones.filter(c =>
            (c.privacidad === 'publica' || !c.privacidad) &&
            c.estilos && Array.isArray(c.estilos) &&
            c.estilos.some(e => e.id === generoSeleccionado.id)
          )
        : [];

    const handleClearSearch = () => {
        setBusquedaGenero('');
    };

    return (
        <div className="inicio-pagina">
            {/* Hero Section + Estadísticas */}
            <HeroEstadisticas />

            {/* Carrusel: Novedades */}
            <FilaCarrusel
                titulo="Novedades"
                subtitulo="Las canciones más recientes"
                items={cancionesNuevas}
                render={(cancion) => <Cancion datosCancion={cancion} />}
                vacio="No hay canciones disponibles"
            />

            {/* Carrusel: Álbumes y EPs */}
            {albumesNuevos.length > 0 && (
                <FilaCarrusel
                    titulo="Álbumes y EPs"
                    subtitulo="Nuevas colecciones destacadas"
                    items={albumesNuevos}
                    render={(coleccion) => <Coleccion datosColeccion={coleccion} />}
                    vacio="No hay álbumes disponibles"
                />
            )}

            {/* Carrusel: Playlists (solo públicas) */}
            {(() => {
                const playlistsFiltradas = playlists
                    .filter(p => (p.privacidad === 'publica' || !p.privacidad) && p.titulo && !p.titulo.toLowerCase().includes('me gusta'))
                    .slice(0, 15);
                return playlistsFiltradas.length > 0 && (
                    <FilaCarrusel
                        titulo="Playlists"
                        subtitulo="Playlists para disfrutar"
                        items={playlistsFiltradas}
                        render={(playlist) => <Playlist datosPlaylist={playlist} />}
                        vacio="No hay playlists disponibles"
                    />
                );
            })()}

            {/* Sección de Búsqueda por Género */}
            <BuscadorGenero
                seleccionado={busquedaGenero}
                onSelect={setBusquedaGenero}
                onClear={handleClearSearch}
            />

            {/* Carrusel Dinámico: Canciones del Género Seleccionado */}
            {generoSeleccionado && (
                <FilaCarrusel
                    titulo={generoSeleccionado.nombre}
                    subtitulo={`Canciones en el género ${generoSeleccionado.nombre}`}
                    items={cancionesDelGenero}
                    render={(cancion) => <Cancion datosCancion={cancion} />}
                    vacio={`No hay canciones disponibles en ${generoSeleccionado.nombre}`}
                />
            )}
        </div>
    );
};

export default Inicio;

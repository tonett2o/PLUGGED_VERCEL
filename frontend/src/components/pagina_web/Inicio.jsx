/**
 * Inicio.jsx - Pagina principal de la plataforma
 *
 * Muestra los contenidos mas relevantes de la plataforma organizados en
 * carruseles horizontales y una seccion de busqueda por genero musical.
 *
 * Estructura de la pagina:
 *   1. HeroEstadisticas - Banner superior con estadisticas globales de la plataforma
 *   2. Carrusel "Novedades" - Canciones publicas ordenadas por fecha descendente
 *   3. Carrusel "Albums y EPs" - Colecciones de tipo album/ep publicas
 *   4. Carrusel "Playlists" - Playlists publicas (excluye las de "me gusta")
 *   5. BuscadorGenero - Selector de genero musical con 46 opciones
 *   6. Carrusel dinamico - Canciones del genero seleccionado (aparece solo si hay seleccion)
 *
 * La lista de canciones se obtiene directamente del backend al montar el componente
 * y se actualiza cada 5 segundos via polling para captar nuevas subidas sin recargar.
 * Ademas se sincroniza con el contexto global de musica cuando este cambia.
 *
 * Solo se muestran contenidos con privacidad = 'publica'.
 */
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

    // Genero musical seleccionado en el buscador
    const [busquedaGenero, setBusquedaGenero] = useState('');

    // Lista de canciones local que puede ser mas fresca que el contexto
    const [canciones, setCanciones] = useState(cancionesGlobales);

    /**
     * Al montar el componente, obtiene las canciones directamente del backend
     * para tener los datos mas actualizados. Luego establece un polling de
     * 5 segundos para captar nuevas canciones o cambios sin recargar la pagina.
     */
    useEffect(() => {
        const refrescarCanciones = async () => {
            try {
                const res = await fetch(`${API_URL}/api/canciones`);
                const data = await res.json();
                setCanciones(data);
            } catch (e) {
                // Si falla, mantener las del contexto global como fallback
                setCanciones(cancionesGlobales);
            }
        };
        refrescarCanciones();

        const intervaloPolling = setInterval(() => {
            refrescarCanciones();
        }, 5000);

        return () => clearInterval(intervaloPolling);
    }, []);

    /**
     * Si el contexto global de musica se actualiza (nueva cancion subida,
     * edicion, etc.), sincronizar el estado local con esos datos.
     */
    useEffect(() => {
        if (cancionesGlobales && cancionesGlobales.length > 0) {
            setCanciones(cancionesGlobales);
        }
    }, [cancionesGlobales]);

    // Canciones publicas ordenadas de mas reciente a mas antigua (max 20)
    const cancionesNuevas = [...canciones]
        .filter(c => c.privacidad === 'publica' || !c.privacidad)
        .sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion))
        .slice(0, 20);

    // Colecciones de tipo album o ep, solo publicas
    const albumesNuevos = colecciones
        .filter(c => (c.privacidad === 'publica' || !c.privacidad) && c.tipo && ['album', 'ep'].includes(c.tipo.toLowerCase()))
        .slice(0, 15);

    // Todas las colecciones publicas sin filtrar por tipo
    const coleccionesPublicas = colecciones
        .filter(c => c.privacidad === 'publica' || !c.privacidad)
        .slice(0, 15);

    // Objeto del genero seleccionado (null si no hay seleccion activa)
    const generoSeleccionado = busquedaGenero.trim() === ''
        ? null
        : generos46.find(g => g.nombre.toLowerCase() === busquedaGenero.toLowerCase());

    // Canciones publicas que pertenecen al genero seleccionado
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
            {/* Bloque superior: estadisticas y hero */}
            <HeroEstadisticas />

            {/* Novedades: canciones mas recientes */}
            <FilaCarrusel
                titulo="Novedades"
                subtitulo="Las canciones mas recientes"
                items={cancionesNuevas}
                render={(cancion) => <Cancion datosCancion={cancion} />}
                vacio="No hay canciones disponibles"
            />

            {/* Albums y EPs destacados */}
            {albumesNuevos.length > 0 && (
                <FilaCarrusel
                    titulo="Albums y EPs"
                    subtitulo="Nuevas colecciones destacadas"
                    items={albumesNuevos}
                    render={(coleccion) => <Coleccion datosColeccion={coleccion} />}
                    vacio="No hay albums disponibles"
                />
            )}

            {/* Playlists publicas (excluye las de "me gusta" que son privadas del sistema) */}
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

            {/* Selector de genero musical */}
            <BuscadorGenero
                seleccionado={busquedaGenero}
                onSelect={setBusquedaGenero}
                onClear={handleClearSearch}
            />

            {/* Carrusel dinamico: solo visible cuando hay un genero seleccionado */}
            {generoSeleccionado && (
                <FilaCarrusel
                    titulo={generoSeleccionado.nombre}
                    subtitulo={`Canciones en el genero ${generoSeleccionado.nombre}`}
                    items={cancionesDelGenero}
                    render={(cancion) => <Cancion datosCancion={cancion} />}
                    vacio={`No hay canciones disponibles en ${generoSeleccionado.nombre}`}
                />
            )}
        </div>
    );
};

export default Inicio;

import React, { createContext, useState, useEffect, useRef } from "react";
import API_URL from "../config/api.js";

// Hooks de Canciones
import useApiGetAll_Canciones from "../hooks/Cancion/useApiGetAll.js";
import useApiPost_Cancion from "../hooks/Cancion/useApiPost.js";
import useApiPut_Cancion from "../hooks/Cancion/useApiPut.js"; // 🚨 1. IMPORTAMOS EL NUEVO HOOK DE CANCIÓN

// Hooks de Colecciones
import useApiGetAll_Colecciones from "../hooks/Coleccion/useApiGetAll.js";
import useApiPost_Coleccion from "../hooks/Coleccion/useApiPost.js";
import useApiPut_Coleccion from "../hooks/Coleccion/useApiPut.js";

// Hooks de Playlists
import useApiGetAll_Playlists from "../hooks/Playlist/useApiGetAll.js";
import useApiPost_Playlist from "../hooks/Playlist/useApiPost.js";
import useApiPut_Playlist from "../hooks/Playlist/useApiPut.js"; 

const contextoMusica = createContext();

const ProveedorMusica = (props) => {
    const [canciones, setCanciones] = useState([]);
    const [colecciones, setColecciones] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [trackActual, setTrackActual] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const wavesurferRef = useRef(null);
    const usuarioActual = JSON.parse(localStorage.getItem('usuario'));

    // --- MÉTODOS DE INICIO (GET) ---
    const iniciarCanciones = async () => {
        const data = await useApiGetAll_Canciones();
        setCanciones([...data]);
    }

    const iniciarColecciones = async () => {
        const data = await useApiGetAll_Colecciones();
        if (data) {
            setColecciones([...data]);
        }
    }

    const iniciarPlaylists = async () => {
        try {
            const data = await useApiGetAll_Playlists();
            if (data && !data.error) {
                setPlaylists([...data]);
            }
        } catch (error) {
            console.error("Error al iniciar playlists:", error);
        }
    }

    // --- MÉTODO: PUBLICAR CANCIÓN ---
    const publicarCancion = async (nuevaCancion) => {
        const token = localStorage.getItem('token');
        const usuarioActual = JSON.parse(localStorage.getItem('usuario'));

        if (!usuarioActual) {
            return { error: true, message: "Sesión expirada" };
        }

        const objetoCompleto = {
            ...nuevaCancion,
            id_usuario: usuarioActual.id
        };

        const resultado = await useApiPost_Cancion(objetoCompleto, token);

        if (resultado && !resultado.error) {
            if (resultado.cancion) {
                setCanciones(prevCanciones => [resultado.cancion, ...prevCanciones]);
            } else {
                setCanciones(prevCanciones => [resultado, ...prevCanciones]);
            }

            await iniciarCanciones();
            await iniciarColecciones();
            await iniciarPlaylists(); 
        }
        return resultado;
    };

    // 🚨 2. NUEVO MÉTODO: ACTUALIZAR CANCIÓN
    const actualizarCancion = async (idCancion, datosFormulario) => {
        const token = localStorage.getItem('token');

        if (!token) return { error: true, message: "No hay sesión activa" };

        try {
            const respuesta = await useApiPut_Cancion(idCancion, datosFormulario, token);

            if (respuesta && !respuesta.error) {
                console.log("Canción actualizada con éxito");
                // 🔄 Refrescar canciones, colecciones Y playlists para mantener datos sincronizados
                await iniciarCanciones();
                await iniciarColecciones();
                await iniciarPlaylists();
            }

            return respuesta;
        } catch (error) {
            console.error("Error en actualizarCancion del proveedor:", error);
            return { error: true, message: "Error crítico al actualizar la canción" };
        }
    };

    // --- MÉTODO: PUBLICAR PLAYLIST ---
    const publicarPlaylist = async (nuevaPlaylist) => {
        const token = localStorage.getItem('token');
        const usuarioActual = JSON.parse(localStorage.getItem('usuario'));

        if (!usuarioActual) {
            return { error: true, message: "Sesión expirada" };
        }

        // Preparar datos completos con usuario y año sin amigosar
        const datosCompletos = {
            titulo: nuevaPlaylist.titulo,
            descripcion: nuevaPlaylist.descripcion || '',
            privacidad: nuevaPlaylist.privacidad,
            fecha_publicacion: nuevaPlaylist.fecha_publicacion.toString().substring(0, 4),
            portada: nuevaPlaylist.portada,
            id_usuario: usuarioActual.id,
            colaboradores: nuevaPlaylist.colaboradores || []
        };

        const resultado = await useApiPost_Playlist(datosCompletos, token);

        if (resultado && !resultado.error) {
            await iniciarCanciones();
            await iniciarPlaylists();
        }

        return resultado;
    };

    // --- MÉTODO: ACTUALIZAR PLAYLIST
    const actualizarPlaylist = async (idPlaylist, datosFormulario) => {
        const token = localStorage.getItem('token');

        if (!token) return { error: true, message: "No hay sesión activa" };

        try {
            const respuesta = await useApiPut_Playlist(idPlaylist, datosFormulario, token);

            if (respuesta && !respuesta.error) {
                console.log("Playlist actualizada con éxito");
                await iniciarPlaylists(); 
            }

            return respuesta;
        } catch (error) {
            console.error("Error en actualizarPlaylist del proveedor:", error);
            return { error: true, message: "Error crítico al actualizar la playlist" };
        }
    };

    // --- MÉTODO: PUBLICAR COLECCIÓN ---
    const publicarColeccion = async (nuevaColeccion) => {
        const token = localStorage.getItem('token');
        const usuarioActual = JSON.parse(localStorage.getItem('usuario'));

        if (!usuarioActual) {
            return { error: true, message: "Sesión expirada" };
        }

        // Preparar datos completos con usuario y año sin amigosar
        const datosCompletos = {
            titulo: nuevaColeccion.titulo,
            artista: nuevaColeccion.artista || usuarioActual.nick || '',
            descripcion: nuevaColeccion.descripcion || '',
            tipo: nuevaColeccion.tipo,
            privacidad: nuevaColeccion.privacidad,
            fecha_publicacion: nuevaColeccion.fecha_publicacion.toString().substring(0, 4),
            portada: nuevaColeccion.portada,
            id_usuario: usuarioActual.id,
            colaboradores: nuevaColeccion.colaboradores || []
        };

        const resultado = await useApiPost_Coleccion(datosCompletos, token);

        if (resultado && !resultado.error) {
            await iniciarCanciones();
            await iniciarColecciones();
        }
        return resultado;
    };

    // --- MÉTODO: ACTUALIZAR COLECCIÓN ---
    const actualizarColeccion = async (idColeccion, datosFormulario) => {
        const token = localStorage.getItem('token');

        if (!token) return { error: true, message: "No hay sesión activa" };

        try {
            const respuesta = await useApiPut_Coleccion(idColeccion, datosFormulario, token);

            if (respuesta && !respuesta.error) {
                console.log("Colección actualizada en el estado global a través del hook");
                await iniciarColecciones(); 
            }

            return respuesta;

        } catch (error) {
            console.error("Error en actualizarColeccion del proveedor:", error);
            return { error: true, message: "Error crítico al actualizar la colección" };
        }
    };

    // --- LÓGICA DE REPRODUCCIÓN ---
    const reproducirTrack = (track) => {
        if (trackActual?.id === track.id) {
            setIsPlaying(!isPlaying);
            const playerBoton = document.querySelector('.btn-play');
            if (playerBoton) playerBoton.click();
        } else {
            setTrackActual(track);
        }
    };

    const buscarCancion = (idEntrada) => {
        return canciones.find(c => c.id == idEntrada);
    }

    // Buscar playlist completa (con canciones) desde el backend
    const buscarPlaylist = async (idPlaylist) => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const response = await fetch(`${API_URL}/api/playlists/${idPlaylist}`, {
                headers: {
                    'Accept': 'application/json',
                    ...headers
                }
            });

            if (!response.ok) {
                console.error(`Error ${response.status} al cargar playlist`);
                return null;
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error buscando playlist:', error);
            return null;
        }
    };

    // Método para refrescar playlists y colecciones (útil al agregar canciones)
    const refrescarPlaylistsYColecciones = async () => {
        console.log('🔄 Refrescando playlists y colecciones...');
        await iniciarPlaylists();
        await iniciarColecciones();
    };

    // Método para limpiar la música cuando se cierra sesión
    const limpiarMusica = () => {
        console.log('🛑 Limpiando reproductor...');
        setTrackActual(null);
        setIsPlaying(false);
        if (wavesurferRef.current) {
            wavesurferRef.current.destroy?.();
        }
    };

    useEffect(() => {
        iniciarCanciones();
        iniciarColecciones();
        iniciarPlaylists(); 
    }, []);

    const exportacion = {
        trackActual,
        setTrackActual,
        isPlaying,
        setIsPlaying,
        reproducirTrack,
        wavesurferRef,
        canciones,
        colecciones,
        playlists,
        iniciarCanciones,
        iniciarColecciones,
        iniciarPlaylists,
        refrescarPlaylistsYColecciones,
        buscarCancion,
        buscarPlaylist,
        publicarCancion,
        actualizarCancion,
        publicarColeccion,
        publicarPlaylist,
        actualizarColeccion,
        actualizarPlaylist,
        limpiarMusica // 🛑 Limpia el reproductor al cerrar sesión
    }

    return (
        <contextoMusica.Provider value={exportacion}>
            {props.children}
        </contextoMusica.Provider>
    );
}

export default ProveedorMusica;
export { contextoMusica };
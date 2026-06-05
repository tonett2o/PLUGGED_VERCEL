import React, { useContext, useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import API_URL from "../../config/api.js";

// Contextos
import { contextoMusica } from "../../contexts/ProveedorMusica.jsx";
import { contextoEquipamiento } from "../../contexts/ProveedorEquipamiento.jsx";
import { contextoEvento } from "../../contexts/ProveedorEvento.jsx";
import { contextoUsuario } from "../../contexts/ProveedorUsuario.jsx";

// Componentes de Detalles
import DetallesCancion from "../detalles/DetallesCancion.jsx";
import DetallesPlaylist from "../detalles/DetallesPlaylist.jsx";
import DetallesColeccion from "../detalles/DetallesColeccion.jsx";
import DetallesHardware from "../detalles/DetallesHardware.jsx";
import DetallesSoftware from "../detalles/DetallesSoftware.jsx";
import DetallesEvento from "../detalles/DetallesEvento.jsx";
import DetallesUsuario from "../detalles/DetallesUsuario.jsx";

// Determina si un dato tiene todas las relaciones necesarias cargadas
const tieneRelacionesCompletas = (tipo, datos) => {
    if (!datos) return false;
    switch (tipo) {
        case 'cancion':   return Array.isArray(datos.colaboradores);
        case 'playlist':  return Array.isArray(datos.canciones);
        case 'coleccion': return Array.isArray(datos.canciones) && Array.isArray(datos.colaboradores);
        case 'evento':    return Array.isArray(datos.colaboradores);
        default:          return true; // hardware, software, usuario no necesitan relaciones especiales
    }
};

// El componente intermedio que limpia la lógica
const ValidarDetalle = ({ dato, Componente, propNombre, cargarDelBackend, tipo, id, refrescarFn }) => {
    const [datoCargado, setDatoCargado] = useState(dato || null);
    const [cargando, setCargando] = useState(false);
    // Ref para saber si ya tenemos datos completos del id actual
    // Evita que actualizaciones parciales del contexto (iniciarCanciones, etc.)
    // sobreescriban datos completos y provoquen el spinner de "Cargando..."
    const datoCargadoRef = useRef(dato || null);

    const setDato = (datos) => {
        datoCargadoRef.current = datos;
        setDatoCargado(datos);
    };

    const refrescarDatos = async () => {
        if (refrescarFn) await refrescarFn();
        if (cargarDelBackend && tipo && id) {
            try {
                const datos = await cargarDelBackend(id, tipo);
                if (datos) setDato(datos);
            } catch (error) {
                console.error('Error refrescando datos:', error);
            }
        }
    };

    useEffect(() => {
        const loaded = datoCargadoRef.current;
        const mismoId = loaded && String(loaded.id) === String(id);

        if (tieneRelacionesCompletas(tipo, dato)) {
            // El contexto tiene datos completos (p.ej. respuesta del PUT): usar directamente
            setDato(dato);
        } else if (!mismoId) {
            // Id distinto al que tenemos cargado: resetear para forzar carga fresca
            setDato(dato || null);
        }
        // Si mismo id pero dato parcial (p.ej. iniciarCanciones sin relaciones):
        // NO sobreescribir — mantener los datos completos que ya teníamos
    }, [dato, id]);

    useEffect(() => {
        const loaded = datoCargadoRef.current;
        const mismoId = loaded && String(loaded.id) === String(id);
        const yaTenemosBuenos = mismoId && tieneRelacionesCompletas(tipo, loaded);

        if (!yaTenemosBuenos && cargarDelBackend && tipo && id) {
            // Solo mostrar spinner si no tenemos NINGÚN dato para este id
            // Si tenemos datos parciales: cargar en background sin spinner (evita el flicker)
            if (!mismoId) setCargando(true);

            cargarDelBackend(id, tipo).then(datos => {
                if (datos) setDato(datos);
                setCargando(false);
            }).catch(error => {
                console.error('Error cargando datos:', error);
                setCargando(false);
            });
        }
    }, [dato, id, tipo, cargarDelBackend]);

    if (cargando) return <p className="cargando">Cargando...</p>;
    if (!datoCargado) return <p className="error">No se ha encontrado la información solicitada.</p>;

    const props = { [propNombre]: datoCargado };
    if (refrescarFn) props.refrescarTodo = refrescarDatos;

    return <Componente key={`${propNombre}-${id}`} {...props} />;
};

const Mostrar = () => {
    const { tipo, identificador } = useParams();

    // Extraemos todo de los contextos con fallbacks para arrays
    const { canciones, playlists, colecciones, buscarPlaylist, iniciarCanciones, iniciarPlaylists, iniciarColecciones } = useContext(contextoMusica);
    const { hardware = [], software = [] } = useContext(contextoEquipamiento) || {};
    const { listaEventos, cargarTodosLosEventos } = useContext(contextoEvento);
    const { usuarios, iniciarUsuarios } = useContext(contextoUsuario);

    // Función para cargar datos del backend si no existen en el contexto
    const cargarDelBackend = async (id, tipo) => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            let endpoint = '';
            switch (tipo) {
                case 'cancion':
                    endpoint = `/api/canciones/${id}`;
                    break;
                case 'playlist':
                    endpoint = `/api/playlists/${id}`;
                    break;
                case 'coleccion':
                    endpoint = `/api/colecciones/${id}`;
                    break;
                case 'usuario':
                    endpoint = `/api/usuarios/${id}`;
                    break;
                case 'evento':
                    endpoint = `/api/eventos/${id}`;
                    break;
                case 'hardware':
                    endpoint = `/api/hardware/${id}`;
                    break;
                case 'software':
                    endpoint = `/api/software/${id}`;
                    break;
                // Agregar más tipos según sea necesario
                default:
                    return null;
            }

            const response = await fetch(`${API_URL}${endpoint}`, {
                headers: {
                    'Accept': 'application/json',
                    ...headers
                }
            });

            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Error cargando datos del backend:', error);
            return null;
        }
    };

    switch (tipo) {
        // --- SECCIÓN MÚSICA ---
        case "cancion":
            return <ValidarDetalle
                dato={canciones.find(c => String(c.id) === identificador)}
                Componente={DetallesCancion} propNombre="cancionBuscada"
                cargarDelBackend={cargarDelBackend} tipo="cancion" id={identificador}
                refrescarFn={iniciarCanciones} />;
        case "playlist":
            return <ValidarDetalle
                dato={playlists.find(p => String(p.id) === identificador)}
                Componente={DetallesPlaylist} propNombre="playlistBuscada"
                cargarDelBackend={cargarDelBackend} tipo="playlist" id={identificador}
                refrescarFn={iniciarPlaylists} />;
        case "coleccion":
            return <ValidarDetalle
                dato={colecciones.find(col => String(col.id) === identificador)}
                Componente={DetallesColeccion} propNombre="coleccionBuscada"
                cargarDelBackend={cargarDelBackend} tipo="coleccion" id={identificador}
                refrescarFn={iniciarColecciones} />;
                

        // --- SECCIÓN EQUIPAMIENTO ---
        case "hardware":
            return <ValidarDetalle
                dato={hardware.find(h => String(h.id) === identificador)}
                Componente={DetallesHardware} propNombre="hwBuscado"
                cargarDelBackend={cargarDelBackend} tipo="hardware" id={identificador} />;
        case "software":
            return <ValidarDetalle
                dato={software.find(s => String(s.id) === identificador)}
                Componente={DetallesSoftware} propNombre="swBuscado"
                cargarDelBackend={cargarDelBackend} tipo="software" id={identificador} />;
                

        // --- OTROS ---
        case "evento":
            return <ValidarDetalle
                dato={listaEventos.find(ev => String(ev.id) === identificador)}
                Componente={DetallesEvento} propNombre="eventoBuscado"
                cargarDelBackend={cargarDelBackend} tipo="evento" id={identificador}
                refrescarFn={cargarTodosLosEventos} />;

        case "usuario":
            const existe = usuarios.find(u => String(u.id) === identificador);
            return <ValidarDetalle
                dato={existe} Componente={DetallesUsuario} propNombre="datosUsuario"
                cargarDelBackend={cargarDelBackend} tipo="usuario" id={identificador}
                refrescarFn={iniciarUsuarios} />;

        default:
            return <p>Categoría "{tipo}" no reconocida.</p>;
    }
};

export default Mostrar;
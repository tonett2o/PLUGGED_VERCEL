import React, { useContext, useState, useEffect } from "react";
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

// Tipos cuyo detalle se sirve SIEMPRE desde el backend (endpoint `show`).
// Motivo: la respuesta del PUT (update) y las listas del contexto tienen una
// forma incompleta (p.ej. el PUT no carga la relación `usuario` y envuelve el
// objeto en { cancion: ... }). El endpoint `show` es la fuente de verdad
// completa y consistente, así que para estos tipos revalidamos desde él.
const TIPOS_REVALIDA_BACKEND = ['cancion', 'coleccion', 'playlist', 'evento'];

// ¿El objeto del contexto está COMPLETO para renderizar el detalle?
// Las respuestas parciales de POST/PUT (y las inyecciones optimistas en el contexto)
// no incluyen la relación `usuario` (canción/colección/playlist) ni `colaboradores`
// (evento). Si detectamos esa forma parcial, NO la renderizamos: esperamos a `show`.
// Esto evita el bug de "Artista" genérico + portada/audio rotos durante el refresco.
const esDetalleCompleto = (tipo, d) => {
    if (!d) return false;
    switch (tipo) {
        case 'cancion':
        case 'coleccion':
        case 'playlist':
            return d.usuario !== undefined && d.usuario !== null;
        case 'evento':
            return Array.isArray(d.colaboradores);
        default:
            return true;
    }
};

// El componente intermedio que limpia la lógica
const ValidarDetalle = ({ dato, Componente, propNombre, cargarDelBackend, tipo, id, refrescarFn }) => {
    // Solo sembramos el render con `dato` del contexto si está completo; si es parcial,
    // arrancamos en null para mostrar spinner hasta que llegue la versión de `show`.
    const [datoCargado, setDatoCargado] = useState(() => (esDetalleCompleto(tipo, dato) ? dato : null));
    // Arrancamos en "cargando" si es un tipo que revalida y aún no tenemos datos completos,
    // para mostrar el spinner directamente (evita un flash de "No encontrado").
    const [cargando, setCargando] = useState(
        () => TIPOS_REVALIDA_BACKEND.includes(tipo) && !esDetalleCompleto(tipo, dato)
    );

    const refrescarDatos = async () => {
        if (refrescarFn) await refrescarFn();
        if (cargarDelBackend && tipo && id) {
            try {
                const datos = await cargarDelBackend(id, tipo);
                if (datos) setDatoCargado(datos);
            } catch (error) {
                console.error('Error refrescando datos:', error);
            }
        }
    };

    useEffect(() => {
        let cancelado = false;
        const revalidaBackend = TIPOS_REVALIDA_BACKEND.includes(tipo);

        if (revalidaBackend && cargarDelBackend && id) {
            // STALE-WHILE-REVALIDATE: siempre traemos la versión canónica y completa
            // desde `show`. Si ya mostramos datos COMPLETOS de este id, los mantenemos
            // visibles mientras llega la nueva versión (sin spinner ni flicker).
            // Si solo tenemos datos parciales (o nada), mostramos spinner hasta `show`.
            const tenemosCompletoDelMismoId = datoCargado
                && String(datoCargado.id) === String(id)
                && esDetalleCompleto(tipo, datoCargado);
            if (!tenemosCompletoDelMismoId) setCargando(true);

            cargarDelBackend(id, tipo)
                .then(datos => {
                    if (cancelado) return;
                    if (datos) setDatoCargado(datos);
                    setCargando(false);
                })
                .catch(error => {
                    if (cancelado) return;
                    console.error('Error cargando datos:', error);
                    setCargando(false);
                });
        } else {
            // usuario / hardware / software: contexto primero, backend solo si falta
            if (dato) {
                setDatoCargado(dato);
            } else if (cargarDelBackend && id) {
                setCargando(true);
                cargarDelBackend(id, tipo)
                    .then(datos => {
                        if (cancelado) return;
                        setDatoCargado(datos);
                        setCargando(false);
                    })
                    .catch(error => {
                        if (cancelado) return;
                        console.error('Error cargando datos:', error);
                        setCargando(false);
                    });
            }
        }

        return () => { cancelado = true; };
        // `dato` en deps: tras un PUT el contexto cambia de referencia y eso dispara
        // la revalidación desde el backend (trae el objeto ya actualizado y completo).
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
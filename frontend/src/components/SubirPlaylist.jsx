import React, { useState, useContext, useEffect } from 'react';
import { contextoMusica } from '../contexts/ProveedorMusica.jsx';
import { contextoNotificaciones } from '../contexts/ProveedorNotificaciones.jsx';
import './SubirPlaylist.css';

/**
 * SubirPlaylist - Componente para crear y editar playlists
 *
 * Features:
 * - Modo creación: portada requerida
 * - Modo edición: portada opcional
 * - Validación backend con errores por campo
 * - Muestra errores con badges rojos inline
 * - Limpia errores automáticamente al escribir
 * - Si validación falla, NO se crea/modifica en BD
 */
const SubirPlaylist = ({ alFinalizar, datosAEditar }) => {
    const { publicarPlaylist, actualizarPlaylist } = useContext(contextoMusica);
    const notificaciones = useContext(contextoNotificaciones);

    const [formulario, setFormulario] = useState({
        titulo: datosAEditar?.titulo || '',
        descripcion: datosAEditar?.descripcion || '',
        privacidad: datosAEditar?.privacidad || 'publica',
        fecha_publicacion: datosAEditar?.fecha_publicacion || new Date().getFullYear(),
        portada: null
    });

    // Estado para errores de validación
    const [errores, setErrores] = useState({});

    // Reinicializar formulario y colaboradores cuando datosAEditar cambia
    useEffect(() => {
        if (datosAEditar) {
            setFormulario({
                titulo: datosAEditar.titulo || '',
                descripcion: datosAEditar.descripcion || '',
                privacidad: datosAEditar.privacidad || 'publica',
                fecha_publicacion: datosAEditar.fecha_publicacion || new Date().getFullYear(),
                portada: null
            });

        } else {
            // Limpiar formulario cuando se abre el modal para crear una nueva playlist
            setFormulario({
                titulo: '',
                descripcion: '',
                privacidad: 'publica',
                fecha_publicacion: new Date().getFullYear(),
                portada: null
            });
        }
    }, [datosAEditar?.id]); // Dependencia en datosAEditar.id

    /**
     * Renderiza mensaje de error para un campo específico
     * Muestra el primer error del array de errores en rojo
     */
    const renderErrorMessage = (fieldName) => {
        if (!errores[fieldName]?.length) return null;
        return (
            <span style={{
                display: 'block',
                marginTop: '4px',
                color: '#ff4444',
                fontSize: '0.75rem',
                fontWeight: '500'
            }}>
                {errores[fieldName][0]}
            </span>
        );
    };

    /**
     * Maneja cambios en inputs de texto
     * Limpia el error del campo al escribir
     */
    const handleTexto = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
        // Limpiar error del campo
        if (errores[e.target.name]) {
            const newErrores = { ...errores };
            delete newErrores[e.target.name];
            setErrores(newErrores);
        }
    };

    /**
     * Maneja cambios en selects
     * Limpia el error del campo al cambiar
     */
    const handleSelect = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
        // Limpiar error del campo
        if (errores[e.target.name]) {
            const newErrores = { ...errores };
            delete newErrores[e.target.name];
            setErrores(newErrores);
        }
    };

    /**
     * Maneja selección de archivo de portada
     * Limpia el error del campo al seleccionar
     */
    const handleArchivo = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormulario({ ...formulario, portada: e.target.files[0] });
            // Limpiar error del campo
            if (errores.portada) {
                const newErrores = { ...errores };
                delete newErrores.portada;
                setErrores(newErrores);
            }
        }
    };

    /**
     * Envía el formulario
     * Valida en backend, muestra errores si hay, o procesa éxito
     */
    const enviarFormulario = async (e) => {
        e.preventDefault();

        // Limpiar errores previos
        setErrores({});

        let respuesta;

        const datosEnvio = {
            ...formulario
        };

        // Lógica bifurcada: ¿Crear o Actualizar?
        if (datosAEditar) {
            // Modo Edición
            respuesta = await actualizarPlaylist(datosAEditar.id, datosEnvio);
        } else {
            // Modo Creación
            respuesta = await publicarPlaylist(datosEnvio);
        }

        if (respuesta && !respuesta.error) {
            // Éxito
            notificaciones.exito(datosAEditar ? "Playlist actualizada correctamente" : "Playlist creada correctamente");

            // Si nos pasaron la función alFinalizar, la llamamos
            if (alFinalizar) alFinalizar();
        } else {
            // Error: mostrar errores por campo
            if (respuesta?.detalles) {
                setErrores(respuesta.detalles);
                // Scroll a arriba para ver los errores
                window.scrollTo(0, 0);
            } else {
                // Fallback a notificación genérica
                notificaciones.error(respuesta?.message || "Revisa los campos");
            }
        }
    };

    return (
        <form className="sc-form" onSubmit={enviarFormulario}>
            <h2>{datosAEditar ? 'Editar Playlist' : 'Nueva Playlist'}</h2>

            {/* FILA 1: Título | Privacidad */}
            <div className="form-row">
                <div>
                    <label>Título</label>
                    <input
                        type="text"
                        name="titulo"
                        value={formulario.titulo}
                        onChange={handleTexto}
                        placeholder="Nombre de la playlist"
                        style={{ borderColor: errores.titulo ? '#ff4444' : undefined }}
                    />
                    {renderErrorMessage('titulo')}
                </div>

                <div>
                    <label>Privacidad</label>
                    <select
                        name="privacidad"
                        onChange={handleSelect}
                        value={formulario.privacidad}
                        style={{ borderColor: errores.privacidad ? '#ff4444' : undefined }}
                    >
                        <option value="publica">Pública</option>
                        <option value="privada">Privada</option>
                    </select>
                    {renderErrorMessage('privacidad')}
                </div>
            </div>

            {/* FILA 2: Descripción | Año */}
            <div className="form-row">
                <div>
                    <label>Descripción</label>
                    <textarea
                        name="descripcion"
                        value={formulario.descripcion}
                        onChange={handleTexto}
                        placeholder="Descripción de la playlist (opcional)"
                        maxLength="200"
                        style={{ borderColor: errores.descripcion ? '#ff4444' : undefined }}
                    />
                    {renderErrorMessage('descripcion')}
                </div>

                <div>
                    <label>Año de Publicación</label>
                    <input
                        type="number"
                        name="fecha_publicacion"
                        value={formulario.fecha_publicacion}
                        onChange={handleTexto}
                        placeholder="Ej: 2026"
                        style={{ borderColor: errores.fecha_publicacion ? '#ff4444' : undefined }}
                    />
                    {renderErrorMessage('fecha_publicacion')}
                </div>
            </div>

            {/* FILA 3: Portada */}
            <div className="form-row">
                <div style={{ gridColumn: '1 / -1' }}>
                    <label>
                        {datosAEditar ? 'Cambiar Portada (opcional)' : 'Portada de la Playlist'}
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleArchivo}
                        style={{ borderColor: errores.portada ? '#ff4444' : undefined }}
                    />
                    {renderErrorMessage('portada')}
                </div>
            </div>

            {/* BOTÓN */}
            <button type="submit" className="sc-btn-upload">
                {datosAEditar ? 'Guardar Cambios' : 'Guardar Playlist'}
            </button>
        </form>
    );
};

export default SubirPlaylist;
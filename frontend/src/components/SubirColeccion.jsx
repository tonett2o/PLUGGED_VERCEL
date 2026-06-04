import React, { useState, useContext, useEffect } from 'react';
import { contextoMusica } from '../contexts/ProveedorMusica.jsx';
import { contextoNotificaciones } from '../contexts/ProveedorNotificaciones.jsx';
import FormularioColaboradores from './FormularioColaboradores.jsx';
import './SubirColeccion.css';

/**
 * SubirColeccion - Componente para crear y editar colecciones (álbumes, EPs)
 *
 * Features:
 * - Modo creación: portada requerida
 * - Modo edición: portada opcional
 * - Validación backend con errores por campo
 * - Muestra errores con badges rojos inline
 * - Limpia errores automáticamente al escribir
 * - Si validación falla, NO se crea/modifica en BD
 */
const SubirColeccion = ({ datosAEditar, alFinalizar }) => {
    const { publicarColeccion, actualizarColeccion } = useContext(contextoMusica);
    const notificaciones = useContext(contextoNotificaciones);

    const [formulario, setFormulario] = useState({
        titulo: datosAEditar?.titulo || '',
        artista: datosAEditar?.artista || '',
        descripcion: datosAEditar?.descripcion || '',
        tipo: datosAEditar?.tipo || 'album',
        privacidad: datosAEditar?.privacidad || 'publica',
        fecha_publicacion: datosAEditar?.fecha_publicacion || new Date().getFullYear(),
        portada: null
    });

    // Estado para errores de validación - SIEMPRE inicia vacío
    const [errores, setErrores] = useState({});
    // Estado para colaboradores
    const [colaboradores, setColaboradores] = useState([]);

    // Reinicializar formulario y colaboradores cuando datosAEditar cambia
    useEffect(() => {
        if (datosAEditar) {
            setFormulario({
                titulo: datosAEditar.titulo || '',
                artista: datosAEditar.artista || '',
                descripcion: datosAEditar.descripcion || '',
                tipo: datosAEditar.tipo || 'album',
                privacidad: datosAEditar.privacidad || 'publica',
                fecha_publicacion: datosAEditar.fecha_publicacion || new Date().getFullYear(),
                portada: null
            });

            if (datosAEditar.colaboradores) {
                const ids = datosAEditar.colaboradores.map(c => c.id || c);
                setColaboradores(ids);
            } else {
                setColaboradores([]);
            }
        } else {
            // Limpiar formulario cuando se abre el modal para crear una nueva colección
            setFormulario({
                titulo: '',
                artista: '',
                descripcion: '',
                tipo: 'album',
                privacidad: 'publica',
                fecha_publicacion: new Date().getFullYear(),
                portada: null
            });
            setColaboradores([]);
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
            ...formulario,
            colaboradores: colaboradores
        };

        // Lógica bifurcada: ¿Crear o Actualizar?
        if (datosAEditar) {
            // Modo Edición
            respuesta = await actualizarColeccion(datosAEditar.id, datosEnvio);
        } else {
            // Modo Creación
            respuesta = await publicarColeccion(datosEnvio);
        }

        if (respuesta && !respuesta.error) {
            // Éxito
            notificaciones.exito(datosAEditar ? "Colección actualizada correctamente" : "Colección creada correctamente");

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
            <h2>{datosAEditar ? 'Editar Colección' : 'Subir Nueva Colección'}</h2>

            {/* FILA 1: Título | Artista */}
            <div className="form-row">
                <div>
                    <label>Título</label>
                    <input
                        type="text"
                        name="titulo"
                        value={formulario.titulo}
                        onChange={handleTexto}
                        placeholder="Nombre de la colección"
                        style={{ borderColor: errores.titulo ? '#ff4444' : undefined }}
                    />
                    {renderErrorMessage('titulo')}
                </div>

                <div>
                    <label>Artista</label>
                    <input
                        type="text"
                        name="artista"
                        value={formulario.artista}
                        onChange={handleTexto}
                        placeholder="Artista / Banda"
                        style={{ borderColor: errores.artista ? '#ff4444' : undefined }}
                    />
                    {renderErrorMessage('artista')}
                </div>
            </div>

            {/* FILA 2: Tipo | Privacidad */}
            <div className="form-row">
                <div>
                    <label>Tipo</label>
                    <select
                        name="tipo"
                        onChange={handleSelect}
                        value={formulario.tipo}
                        style={{ borderColor: errores.tipo ? '#ff4444' : undefined }}
                    >
                        <option value="album">Álbum</option>
                        <option value="ep">EP</option>
                    </select>
                    {renderErrorMessage('tipo')}
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

            {/* DESCRIPCIÓN */}
            <div>
                <label htmlFor="descripcion">Descripción (Opcional)</label>
                <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formulario.descripcion}
                    onChange={handleTexto}
                    placeholder="Describe tu colección..."
                    rows="4"
                    style={{ borderColor: errores.descripcion ? '#ff4444' : undefined }}
                />
                {renderErrorMessage('descripcion')}
            </div>

            {/* FILA 3: Año | Carátula */}
            <div className="form-row">
                <div>
                    <label>Año de Publicación</label>
                    <input
                        type="number"
                        name="fecha_publicacion"
                        value={formulario.fecha_publicacion}
                        onChange={handleTexto}
                        placeholder="Ej: 2025"
                        style={{ borderColor: errores.fecha_publicacion ? '#ff4444' : undefined }}
                    />
                    {renderErrorMessage('fecha_publicacion')}
                </div>

                <div>
                    <label>
                        {datosAEditar ? 'Cambiar Carátula (opcional)' : 'Carátula de la Colección'}
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

            <FormularioColaboradores
                colaboradoresSeleccionados={colaboradores}
                onColaboradoresChange={setColaboradores}
            />

            {/* BOTÓN */}
            <button type="submit" className="sc-btn-upload">
                {datosAEditar ? 'Guardar Cambios' : 'Guardar Colección'}
            </button>
        </form>
    );
};

export default SubirColeccion;

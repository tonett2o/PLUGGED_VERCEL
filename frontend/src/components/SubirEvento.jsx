import React, { useState, useContext, useEffect } from "react";
import API_URL from "../config/api.js";
import { contextoEvento } from "../contexts/ProveedorEvento.jsx";
import { contextoNotificaciones } from "../contexts/ProveedorNotificaciones.jsx";
import FormularioColaboradores from "./FormularioColaboradores.jsx";
import MapaEventos from "./MapaEventos.jsx";
import './SubirEvento.css';

// Hook para obtener estilos disponibles
const useObtenerEstilos = () => {
    const [estilos, setEstilos] = useState([]);

    useEffect(() => {
        const cargarEstilos = async () => {
            try {
                const response = await fetch(`${API_URL}/api/estilos`);
                if (response.ok) {
                    const datos = await response.json();
                    setEstilos(datos);
                }
            } catch (error) {
                console.error('Error cargando estilos:', error);
            }
        };

        cargarEstilos();
    }, []);

    return estilos;
};

// Función para renderizar mensajes de error
const renderErrorMessage = (errores, fieldName) => {
    if (!errores[fieldName] || errores[fieldName].length === 0) {
        return null;
    }

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

const SubirEvento = ({ alFinalizar, datosAEditar }) => {
    const { guardarNuevoEvento, actualizarEvento } = useContext(contextoEvento);
    const notificaciones = useContext(contextoNotificaciones);
    const [subiendo, setSubiendo] = useState(false);
    const estilosDisponibles = useObtenerEstilos();

    const [form, setForm] = useState({
        nombre: "",
        nombre_sala: "",
        ubicacion: "",
        latitud: "",
        longitud: "",
        fecha_evento: "",
        url_venta: "",
        imagen: null,
        estilos: [] // Array de IDs de estilos seleccionados
    });

    const [errores, setErrores] = useState({});
    const [colaboradores, setColaboradores] = useState([]);

    // Sincronizar datos si es edición
    useEffect(() => {
        if (datosAEditar) {
            // Extraer IDs de estilos si existen
            const estilosIds = datosAEditar.estilos?.map(estilo => estilo.id) || [];

            // Convertir fecha ISO a formato YYYY-MM-DD para el input type="date"
            let fechaFormato = "";
            if (datosAEditar.fecha_evento) {
                // Extraer solo la parte de fecha (YYYY-MM-DD) del timestamp ISO
                fechaFormato = datosAEditar.fecha_evento.split('T')[0];
            }

            // Extraer dirección de ubicación (puede ser string u objeto)
            let ubicacionTexto = "";
            let latitud = "";
            let longitud = "";

            if (datosAEditar.ubicacion) {
                // Si es objeto con propiedad 'direccion', extraerla
                if (typeof datosAEditar.ubicacion === 'object') {
                    ubicacionTexto = datosAEditar.ubicacion.direccion || datosAEditar.ubicacion.direction || "";
                } else {
                    // Si es string, usarlo directamente
                    ubicacionTexto = datosAEditar.ubicacion;
                }
            }

            // Asegurar que latitud y longitud sean strings (para los inputs)
            if (datosAEditar.latitud !== undefined && datosAEditar.latitud !== null) {
                latitud = String(datosAEditar.latitud);
            }
            if (datosAEditar.longitud !== undefined && datosAEditar.longitud !== null) {
                longitud = String(datosAEditar.longitud);
            }

            console.log('📍 Cargando ubicación del evento:', {
                ubicacionTexto,
                latitud,
                longitud,
                original: datosAEditar.ubicacion
            });

            setForm({
                nombre: datosAEditar.nombre || "",
                nombre_sala: datosAEditar.nombre_sala || "",
                ubicacion: ubicacionTexto,
                latitud: latitud,
                longitud: longitud,
                fecha_evento: fechaFormato,
                url_venta: datosAEditar.url_venta || "",
                imagen: null,
                estilos: estilosIds
            });

            // Inicializar colaboradores al editar
            if (datosAEditar.colaboradores) {
                const ids = datosAEditar.colaboradores.map(c => c.id || c);
                console.log('🤝 Inicializando colaboradores en SubirEvento:', ids);
                setColaboradores(ids);
            } else {
                console.log('⚠️ Sin colaboradores en datosAEditar');
                setColaboradores([]);
            }
        }
    }, [datosAEditar?.id]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm(prev => ({ ...prev, [name]: files ? files[0] : value }));
    };

    const handleUbicacionChange = (lat, lng, ubicacionTexto) => {
        setForm(prev => ({
            ...prev,
            latitud: lat.toString(),
            longitud: lng.toString(),
            ubicacion: ubicacionTexto || prev.ubicacion
        }));
        // Limpiar error de ubicación
        setErrores(prev => ({ ...prev, ubicacion: undefined }));
    };

    const toggleEstilo = (estiloId) => {
        setForm(prev => ({
            ...prev,
            estilos: prev.estilos.includes(estiloId)
                ? prev.estilos.filter(id => id !== estiloId)
                : [...prev.estilos, estiloId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubiendo(true);
        setErrores({});

        // Validar que haya colaboradores si es necesario
        console.log('📤 Enviando evento con colaboradores:', colaboradores);

        const datosEnvio = {
            ...form,
            colaboradores: colaboradores
        };

        const res = datosAEditar
            ? await actualizarEvento(datosAEditar.id, datosEnvio)
            : await guardarNuevoEvento(datosEnvio);

        setSubiendo(false);

        if (res && !res.error) {
            notificaciones.exito(datosAEditar ? "Evento actualizado correctamente" : "Evento publicado correctamente");
            // Limpiar formulario después de éxito
            setForm({
                nombre: "",
                nombre_sala: "",
                ubicacion: "",
                latitud: "",
                longitud: "",
                fecha_evento: "",
                url_venta: "",
                imagen: null,
                estilos: []
            });
            setColaboradores([]);
            setErrores({});
            if (alFinalizar) alFinalizar();
        } else {
            // Mostrar errores de validación del backend
            if (res?.detalles && Object.keys(res.detalles).length > 0) {
                console.error('❌ Errores de validación:', res.detalles);
                setErrores(res.detalles);
                notificaciones.error(res?.message || "Revisa los campos con error");
            } else {
                console.error('❌ Error al procesar:', res?.message);
                notificaciones.error(res?.message || "No se pudo procesar");
                // Limpiar errores generales después de mostrar
                setErrores({});
            }
        }
    };

    return (
        <div className="sc-event-form-container">
            <div className="event-form-header">
                <h2>{datosAEditar ? "Editar Evento" : "Publicar Próximo Concierto"}</h2>
                <p className="event-form-subtitle">Rellena todos los campos para crear o actualizar tu evento</p>
            </div>

            <form onSubmit={handleSubmit} className="event-form">
                <div className="form-section">
                    <h3>Información del Evento</h3>

                    <div className="form-group">
                        <label>Nombre del Evento *</label>
                        <input
                            name="nombre"
                            type="text"
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="Ej: Festival de Electrónica 2024"
                            style={{ borderColor: errores.nombre ? '#ff4444' : undefined }}
                        />
                        {renderErrorMessage(errores, 'nombre')}
                    </div>

                    <div className="form-group">
                        <label>Sala / Venue *</label>
                        <input
                            name="nombre_sala"
                            type="text"
                            value={form.nombre_sala}
                            onChange={handleChange}
                            placeholder="Ej: Sala Clamores"
                            style={{ borderColor: errores.nombre_sala ? '#ff4444' : undefined }}
                        />
                        {renderErrorMessage(errores, 'nombre_sala')}
                    </div>

                    <div className="form-group">
                        <label>Fecha del Evento *</label>
                        <input
                            name="fecha_evento"
                            type="date"
                            value={form.fecha_evento}
                            onChange={handleChange}
                            style={{ borderColor: errores.fecha_evento ? '#ff4444' : undefined }}
                        />
                        {renderErrorMessage(errores, 'fecha_evento')}
                    </div>

                    <div className="form-group">
                        <label>URL de Venta de Entradas</label>
                        <input
                            name="url_venta"
                            type="url"
                            value={form.url_venta}
                            onChange={handleChange}
                            placeholder="https://ejemplo.com/entradas"
                            style={{ borderColor: errores.url_venta ? '#ff4444' : undefined }}
                        />
                        {renderErrorMessage(errores, 'url_venta')}
                    </div>

                    <div className="form-group">
                        <label>{datosAEditar ? "Cambiar Cartel (Opcional)" : "Cartel / Imagen *"}</label>
                        <input
                            name="imagen"
                            type="file"
                            accept="image/*"
                            onChange={handleChange}
                            style={{ borderColor: errores.imagen ? '#ff4444' : undefined }}
                        />
                        {renderErrorMessage(errores, 'imagen')}
                    </div>

                    <div className="form-group">
                        <label>Géneros / Estilos (Opcional)</label>
                        <select
                            multiple
                            value={form.estilos.map(String)}
                            onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                setForm(prev => ({ ...prev, estilos: selected }));
                            }}
                            style={{
                                padding: '10px 12px',
                                background: 'rgba(27, 28, 30, 0.8)',
                                border: '1px solid rgba(10, 218, 245, 0.2)',
                                borderRadius: '6px',
                                color: '#ffffff',
                                fontSize: '0.95rem',
                                fontFamily: 'inherit',
                                minHeight: '120px',
                                cursor: 'pointer'
                            }}
                        >
                            {estilosDisponibles.map(estilo => (
                                <option key={estilo.id} value={estilo.id}>
                                    {estilo.nombre}
                                </option>
                            ))}
                        </select>
                        <span style={{
                            display: 'block',
                            marginTop: '6px',
                            color: '#999999',
                            fontSize: '0.8rem'
                        }}>
                            Usa Ctrl/Cmd + Click para seleccionar múltiples
                        </span>
                    </div>
                </div>

                {/* Mapa para ubicación */}
                <MapaEventos
                    latitud={form.latitud}
                    longitud={form.longitud}
                    ubicacion={form.ubicacion}
                    onUbicacionChange={handleUbicacionChange}
                    nombreSala={form.nombre_sala}
                />

                <FormularioColaboradores
                    colaboradoresSeleccionados={colaboradores}
                    onColaboradoresChange={setColaboradores}
                />

                <div className="form-actions">
                    <button
                        type="submit"
                        disabled={subiendo}
                        className="btn-submit"
                    >
                        {subiendo ? "Procesando..." : (datosAEditar ? "Guardar Cambios" : "Publicar Evento")}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubirEvento;
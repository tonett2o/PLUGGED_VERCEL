import React, { useState, useContext, useEffect, useRef } from 'react';
import API_URL from '../config/api.js';
import { contextoMusica } from '../contexts/ProveedorMusica.jsx';
import { contextoNotificaciones } from '../contexts/ProveedorNotificaciones.jsx';
import FormularioColaboradores from './FormularioColaboradores.jsx';
import MultiSelectEstilos from './MultiSelectEstilos.jsx';
import './SubirCancion.css';

const SubirCancion = ({ alFinalizar, misColecciones, misPlaylists, datosAEditar }) => {
    // 🚨 Extraemos también actualizarCancion
    const { publicarCancion, actualizarCancion } = useContext(contextoMusica);
    const notificaciones = useContext(contextoNotificaciones);
    const [loading, setLoading] = useState(false);
    const [errores, setErrores] = useState({}); // Estado para errores
    const [colaboradores, setColaboradores] = useState([]);
    const [estilosDisponibles, setEstilosDisponibles] = useState([]); // Estilos desde API

    // 1. Estado inicial dinámico (vacío si es nueva, relleno si editamos)
    const [form, setForm] = useState({
        titulo: datosAEditar?.titulo || '',
        bpm: datosAEditar?.bpm || '',
        tonalidad: datosAEditar?.tonalidad || '',
        estilos: datosAEditar?.estilos?.map(e => e.id) || [], // Array de IDs de estilos
        privacidad: datosAEditar?.privacidad || 'publica',
        fecha_publicacion: datosAEditar?.fecha_publicacion?.toString() || new Date().getFullYear().toString(),
        portada: null, // Los archivos siempre inician en null
        archivo: null,
        id_coleccion: datosAEditar?.id_coleccion || '',
        id_playlist: '' // Las playlists asociadas no las solemos precargar aquí
    });

    const inicializadoRef = useRef(false);

    const tonalidades = [
        "1A (Abm)", "1B (B)", "2A (Ebm)", "2B (F#)", "3A (Bbm)", "3B (Db)",
        "4A (Fm)", "4B (Ab)", "5A (Cm)", "5B (Eb)", "6A (Gm)", "6B (Bb)",
        "7A (Dm)", "7B (F)", "8A (Am)", "8B (C)", "9A (Em)", "9B (G)",
        "10A (Bm)", "10B (D)", "11A (F#m)", "11B (A)", "12A (Dbm)", "12B (E)"
    ];

    // Cargar estilos desde API
    useEffect(() => {
        fetch(`${API_URL}/api/estilos`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setEstilosDisponibles(data);
                }
            })
            .catch(err => console.error('Error cargando estilos:', err));
    }, []);

    // Actualizar formulario cuando datosAEditar cambia (edición)
    // SOLO al montar o cuando datosAEditar cambia, NO cuando misColecciones cambia
    useEffect(() => {
        if (datosAEditar) {
            // Si estamos editando, cargar los datos
            setForm({
                titulo: datosAEditar.titulo || '',
                bpm: datosAEditar.bpm || '',
                tonalidad: datosAEditar.tonalidad || '',
                estilos: datosAEditar.estilos?.map(e => e.id) || [],
                privacidad: datosAEditar.privacidad || 'publica',
                fecha_publicacion: datosAEditar.fecha_publicacion?.toString() || new Date().getFullYear().toString(),
                portada: null,
                archivo: null,
                // Convertir a string para que coincida con el value del select
                id_coleccion: datosAEditar.id_coleccion ? String(datosAEditar.id_coleccion) : '',
                id_playlist: ''
            });

            // Inicializar colaboradores al editar
            if (datosAEditar.colaboradores) {
                const ids = datosAEditar.colaboradores.map(c => c.id || c);
                setColaboradores(ids);
            } else {
                setColaboradores([]);
            }

            inicializadoRef.current = true; // Marcar como inicializado para edición
        } else {
            // Si no estamos editando, resetear el flag para poder reinicializar en creación
            inicializadoRef.current = false;
            setColaboradores([]);
        }
    }, [datosAEditar?.id]);

    // SEPARADO: marcar como inicializado en creación cuando misColecciones esté disponible.
    // NO preasignamos el id de Singles: en creación el <select> oculta la opción "Singles",
    // por lo que poner su id dejaría el value del select SIN una <option> coincidente. El
    // navegador mostraría la primera opción visible (p. ej. un álbum) mientras el estado real
    // seguiría siendo Singles -> el track se guardaba en Singles aunque se viera otro álbum.
    // Dejando id_coleccion vacío, el select muestra coherentemente "Ninguno (Se asignará a
    // Singles)" y el backend ya asigna Singles por defecto cuando llega vacío.
    useEffect(() => {
        if (!datosAEditar && misColecciones && misColecciones.length > 0 && !inicializadoRef.current) {
            inicializadoRef.current = true;
        }
    }, [datosAEditar, misColecciones]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        const nuevoValor = files ? files[0] : value;

        setForm({ ...form, [name]: nuevoValor });
        // Limpiar errores de este campo cuando el usuario interactúa
        if (errores[name]) {
            setErrores({ ...errores, [name]: null });
        }
    };

    // Función para renderizar errores como texto compacto
    const renderErrorMessage = (fieldName) => {
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

    // Función para humanizar mensajes de error SQL
    const humanizarError = (mensaje) => {
        if (!mensaje) return 'Error al procesar la solicitud';

        // Detectar errores comunes de BD y mostrar mensajes amigables
        if (mensaje.includes("Field 'tonalidad' doesn't have a default value")) {
            return 'Por favor especifica una tonalidad o deja el campo vacío (será opcional)';
        }
        if (mensaje.includes("doesn't have a default value")) {
            const campo = mensaje.match(/Field '(\w+)'/)?.[1] || 'campo requerido';
            return `El campo "${campo}" es requerido`;
        }
        if (mensaje.includes('Duplicate entry')) {
            return 'Este registro ya existe';
        }
        if (mensaje.includes('SQLSTATE')) {
            // Si es un error SQL, mostrar genérico
            return 'Error al procesar los datos. Por favor revisa todos los campos requeridos';
        }

        return mensaje;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrores({}); // Limpiar errores previos

        try {
            const idSinglesFallback = misColecciones?.find(c => c.titulo.toLowerCase() === 'singles')?.id || '';

            const datosSeguros = {
                ...form,
                id_coleccion: form.id_coleccion || idSinglesFallback,
                id_playlist: form.id_playlist || '',
                colaboradores: colaboradores
            };

            // 2. 🚨 LÓGICA BIFURCADA: ¿Crear o Actualizar?
            const res = datosAEditar
                ? await actualizarCancion(datosAEditar.id, datosSeguros)
                : await publicarCancion(datosSeguros);


            if (res && !res.error) {
                notificaciones.exito(datosAEditar ? 'Canción actualizada correctamente' : 'Canción publicada correctamente');
                alFinalizar();
            } else if (res?.detalles && Object.keys(res.detalles).length > 0) {
                // Mostrar errores con badges por camp
                setErrores(res.detalles);
                notificaciones.error('Por favor revisa los errores en el formulario');
                // Scroll hacia arriba para ver los errores
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
            } else if (res?.message) {
                // Error genérico - humanizar el mensaje
                const mensajeAmigable = humanizarError(res.message);
                console.error('❌ Error genérico:', res.message);
                setErrores({ general: [mensajeAmigable] });
                notificaciones.error(mensajeAmigable);
            } else {
                setErrores({ general: ['Error desconocido al procesar la solicitud'] });
                notificaciones.error('Error desconocido al procesar la solicitud');
            }
        } catch (err) {
            console.error('❌ Error de conexión:', err);
            setErrores({ general: ['Error de conexión con el servidor: ' + err.message] });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="sc-form" onSubmit={handleSubmit}>

            {/* 3. Textos dinámicos */}
            <h2>{datosAEditar ? 'Editar Track' : 'Subir nuevo Track'}</h2>

            <label htmlFor="titulo">Título del Track:</label>
            <input
                id="titulo"
                type="text"
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Ej: Orbital Dance"
                style={{ borderColor: errores.titulo ? '#ff4444' : undefined }}
            />
            {renderErrorMessage('titulo')}

            <div className="form-row">
                <div className="input-group">
                    <label htmlFor="bpm">BPM (Opcional):</label>
                    <input
                        id="bpm"
                        type="number"
                        name="bpm"
                        value={form.bpm}
                        onChange={handleChange}
                        placeholder="124"
                        style={{ borderColor: errores.bpm ? '#ff4444' : undefined }}
                    />
                    {renderErrorMessage('bpm')}
                </div>
                <div className="input-group">
                    <label htmlFor="tonalidad">Tonalidad (Opcional):</label>
                    <select
                        id="tonalidad"
                        name="tonalidad"
                        onChange={handleChange}
                        value={form.tonalidad}
                        style={{ borderColor: errores.tonalidad ? '#ff4444' : undefined }}
                    >
                        <option value="">Selecciona clave...</option>
                        {tonalidades.map((ton, i) => (
                            <option key={i} value={ton}>{ton}</option>
                        ))}
                    </select>
                    {renderErrorMessage('tonalidad')}
                </div>
            </div>

            <div className="form-row">
                <div className="input-group">
                    <label htmlFor="estilos">Géneros / Estilos (Opcional):</label>
                    <MultiSelectEstilos
                        estilosDisponibles={estilosDisponibles}
                        estilosSeleccionados={form.estilos}
                        onChange={(estilos) => setForm({ ...form, estilos })}
                        error={!!errores.estilos}
                    />
                    {renderErrorMessage('estilos')}
                </div>
                <div className="input-group">
                    <label htmlFor="privacidad">Visibilidad:</label>
                    <select
                        id="privacidad"
                        name="privacidad"
                        onChange={handleChange}
                        value={form.privacidad}
                        style={{ borderColor: errores.privacidad ? '#ff4444' : undefined }}
                    >
                        <option value="publica">Pública</option>
                        <option value="privada">Privada</option>
                    </select>
                    {renderErrorMessage('privacidad')}
                </div>
            </div>

            <div className="form-row">
                <div className="input-group">
                    <label htmlFor="id_coleccion">Álbum/EP:</label>
                    <select
                        id="id_coleccion"
                        name="id_coleccion"
                        value={form.id_coleccion}
                        onChange={handleChange}
                        style={{ borderColor: errores.id_coleccion ? '#ff4444' : undefined }}
                    >
                        <option value="">Ninguno (Se asignará a Singles)</option>
                        {misColecciones?.filter(col => {
                            const titulo = col.titulo.toLowerCase().trim();
                            const isSingles = titulo === 'singles';
                            const isGusta = titulo.includes('gusta');

                            // Durante EDICIÓN: mostrar Singles (permitir reasignación)
                            // Durante CREACIÓN: ocultar Singles (se asignará por defecto al backend)
                            if (datosAEditar) {
                                return !isGusta; // Mostrar todas excepto "Me gusta"
                            } else {
                                return !isGusta && !isSingles; // Ocultar "Me gusta" y Singles
                            }
                        }).map(col => (
                            // value como String para que coincida con form.id_coleccion (siempre string)
                            <option key={col.id} value={String(col.id)}>{col.titulo}</option>
                        ))}
                    </select>
                    {renderErrorMessage('id_coleccion')}
                </div>

                {/* Campo de playlist siempre disponible (crear o editar) */}
                <div className="input-group">
                    <label htmlFor="id_playlist">Playlist:</label>
                    <select
                        id="id_playlist"
                        name="id_playlist"
                        value={form.id_playlist}
                        onChange={handleChange}
                        style={{ borderColor: errores.id_playlist ? '#ff4444' : undefined }}
                    >
                        <option value="">Ninguno</option>
                        {misPlaylists?.filter(pl => {
                            const titulo = pl.titulo.toLowerCase().trim();
                            return !titulo.includes('gusta') && titulo !== 'singles';
                        }).map(pl => (
                            <option key={pl.id} value={pl.id}>{pl.titulo}</option>
                        ))}
                    </select>
                    {renderErrorMessage('id_playlist')}
                </div>
            </div>

            <label htmlFor="archivo">
                {datosAEditar ? 'Sustituir Audio MP3/WAV (Opcional):' : 'Archivo de Audio (Requerido):'}
            </label>
            <input
                id="archivo"
                type="file"
                name="archivo"
                style={{ borderColor: errores.archivo ? '#ff4444' : undefined }}
                accept="audio/mp3, audio/wav, audio/mpeg"
                onChange={handleChange}
            />
            {renderErrorMessage('archivo')}

            <label htmlFor="portada">
                {datosAEditar ? 'Sustituir Portada (Opcional):' : 'Portada del Track (Opcional):'}
            </label>
            <input
                id="portada"
                type="file"
                name="portada"
                accept="image/*"
                onChange={handleChange}
                style={{ borderColor: errores.portada ? '#ff4444' : undefined }}
            />
            {renderErrorMessage('portada')}

            <FormularioColaboradores
                colaboradoresSeleccionados={colaboradores}
                onColaboradoresChange={setColaboradores}
            />

            <button type="submit" className="sc-btn-upload" disabled={loading}>
                {loading ? "Guardando..." : (datosAEditar ? "Guardar Cambios" : "Publicar Track")}
            </button>
        </form>
    );
};

export default SubirCancion;
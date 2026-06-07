/**
 * Registro.jsx - Formulario de creacion de nueva cuenta
 *
 * Permite al usuario registrarse en la plataforma con:
 *   - Nick (nombre de usuario unico)
 *   - Nombre real o artistico
 *   - Email
 *   - Contraseña y confirmacion
 *   - Tipo de cuenta (usuario, DJ o productor)
 *   - Ubicacion mediante mapa interactivo (opcional)
 *
 * Al enviar, si el registro es exitoso:
 *   - Inicia sesion automaticamente con el token devuelto
 *   - Muestra notificacion de bienvenida
 *   - Redirige al inicio tras 1.5 segundos
 *
 * Si el backend devuelve errores de validacion (campo por campo),
 * se muestran bajo cada input y desaparecen al escribir de nuevo.
 *
 * El backend realiza validacion realista de email (comprueba DNS).
 */
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api.js';
import { useAuth } from '../contexts/ProveedorAuth.jsx';
import { contextoNotificaciones } from '../contexts/ProveedorNotificaciones.jsx';
import MapaUbicacion from './MapaUbicacion.jsx';
import './Registro.css';

const Registro = () => {
    const navigate = useNavigate();
    const notificaciones = useContext(contextoNotificaciones);
    const { conectar } = useAuth();

    const [formulario, setFormulario] = useState({
        nick: '',
        nombre: '',
        email: '',
        password: '',
        password_confirmation: '',
        rol: 'usuario',
        ubicacion: '',
        latitud: '',
        longitud: ''
    });

    // Mapa de errores por campo: { nick: ['ya esta en uso'], email: [...] }
    const [errores, setErrores] = useState({});

    /**
     * Renderiza el primer mensaje de error de un campo si existe.
     *
     * @param {string} fieldName - Nombre del campo
     * @returns {JSX.Element|null} Span con el error o null
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
     * Actualiza el valor del campo y borra su error anterior.
     */
    const handleTexto = (e) => {
        const { name, value } = e.target;
        setFormulario({ ...formulario, [name]: value });

        if (errores[name]) {
            const newErrores = { ...errores };
            delete newErrores[name];
            setErrores(newErrores);
        }
    };

    /**
     * Actualiza el valor de un select y borra su error anterior.
     */
    const handleSelect = (e) => {
        const { name, value } = e.target;
        setFormulario({ ...formulario, [name]: value });

        if (errores[name]) {
            const newErrores = { ...errores };
            delete newErrores[name];
            setErrores(newErrores);
        }
    };

    /**
     * Recibe las coordenadas y texto de ubicacion desde el componente de mapa.
     * Actualiza latitud, longitud y ubicacion en el formulario.
     *
     * @param {number} lat             - Latitud seleccionada en el mapa
     * @param {number} lng             - Longitud seleccionada en el mapa
     * @param {string} ubicacionTexto  - Direccion o nombre del lugar
     */
    const handleUbicacionChange = (lat, lng, ubicacionTexto) => {
        setFormulario(prev => ({
            ...prev,
            latitud: lat.toString(),
            longitud: lng.toString(),
            ubicacion: ubicacionTexto || prev.ubicacion
        }));
        if (errores.ubicacion) {
            const newErrores = { ...errores };
            delete newErrores.ubicacion;
            setErrores(newErrores);
        }
    };

    /**
     * Envia el formulario al backend como FormData.
     * Solo incluye los campos con valor para no mandar campos vacios.
     *
     * Si el backend responde con exito -> inicio de sesion automatico y redireccion.
     * Si hay errores de validacion -> se distribuyen por campo.
     * Si hay error generico -> notificacion de error global.
     */
    const enviarFormulario = async (e) => {
        e.preventDefault();
        setErrores({});

        try {
            const formData = new FormData();
            Object.keys(formulario).forEach(key => {
                if (formulario[key]) {
                    formData.append(key, formulario[key]);
                }
            });

            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData
            });

            const respuesta = await response.json();

            if (response.ok && !respuesta.error) {
                // Registro exitoso: iniciar sesion y redirigir
                const datosUsuario = {
                    access_token: respuesta.access_token,
                    user: respuesta.user || respuesta.usuario
                };
                conectar(datosUsuario);
                notificaciones.exito("Bienvenido! Cuenta creada correctamente.");
                setTimeout(() => navigate('/'), 1500);
            } else {
                if (respuesta?.detalles) {
                    // Errores por campo: mostrar bajo cada input
                    setErrores(respuesta.detalles);
                    window.scrollTo(0, 0);
                } else {
                    notificaciones.error(respuesta?.message || "Revisa los campos");
                }
            }
        } catch (error) {
            console.error('Error de conexion:', error);
            notificaciones.error("Error de conexion");
        }
    };

    return (
        <div className="registro-container">
            <div className="registro-wrapper">
                <form className="sc-form" onSubmit={enviarFormulario}>
                    <h2>Crear Cuenta</h2>

                    {/* Fila 1: Nick y Email */}
                    <div className="form-row">
                        <div>
                            <label>Nick (Usuario)</label>
                            <input
                                type="text"
                                name="nick"
                                value={formulario.nick}
                                onChange={handleTexto}
                                placeholder="tu_usuario"
                                style={{ borderColor: errores.nick ? '#ff4444' : undefined }}
                            />
                            {renderErrorMessage('nick')}
                        </div>

                        <div>
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formulario.email}
                                onChange={handleTexto}
                                placeholder="tu@email.com"
                                style={{ borderColor: errores.email ? '#ff4444' : undefined }}
                            />
                            {renderErrorMessage('email')}
                        </div>
                    </div>

                    {/* Fila 2: Nombre y Tipo de cuenta */}
                    <div className="form-row">
                        <div>
                            <label>Nombre Real / Artistico</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formulario.nombre}
                                onChange={handleTexto}
                                placeholder="Tu nombre"
                                style={{ borderColor: errores.nombre ? '#ff4444' : undefined }}
                            />
                            {renderErrorMessage('nombre')}
                        </div>

                        <div>
                            <label>Tipo de Cuenta</label>
                            <select
                                name="rol"
                                value={formulario.rol}
                                onChange={handleSelect}
                                style={{ borderColor: errores.rol ? '#ff4444' : undefined }}
                            >
                                <option value="usuario">Usuario</option>
                                <option value="dj">DJ</option>
                                <option value="productor">Productor</option>
                            </select>
                            {renderErrorMessage('rol')}
                        </div>
                    </div>

                    {/* Fila 3: Contraseña y confirmacion */}
                    <div className="form-row">
                        <div>
                            <label>Contraseña</label>
                            <input
                                type="password"
                                name="password"
                                value={formulario.password}
                                onChange={handleTexto}
                                placeholder="Min. 8 caracteres"
                                style={{ borderColor: errores.password ? '#ff4444' : undefined }}
                            />
                            {renderErrorMessage('password')}
                        </div>

                        <div>
                            <label>Confirmar Contraseña</label>
                            <input
                                type="password"
                                name="password_confirmation"
                                value={formulario.password_confirmation}
                                onChange={handleTexto}
                                placeholder="HOLA HOLA"
                                style={{ borderColor: errores.password_confirmation ? '#ff4444' : undefined }}
                            />
                            {renderErrorMessage('password_confirmation')}
                        </div>
                    </div>

                    {/* Mapa interactivo para seleccionar la ubicacion */}
                    <MapaUbicacion
                        latitud={formulario.latitud}
                        longitud={formulario.longitud}
                        ubicacion={formulario.ubicacion}
                        onUbicacionChange={handleUbicacionChange}
                    />

                    <button type="submit" className="sc-btn-upload">
                        Crear Cuenta
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#999' }}>
                        Ya tienes cuenta?{' '}
                        <a href="/iniciar-sesion" style={{ color: '#0abcd4', textDecoration: 'none' }}>
                            Inicia sesion aqui
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Registro;

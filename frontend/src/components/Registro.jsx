import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/ProveedorAuth.jsx';
import { contextoNotificaciones } from '../contexts/ProveedorNotificaciones.jsx';
import MapaUbicacion from './MapaUbicacion.jsx';
import './Registro.css';

/**
 * Registro - Componente para crear nueva cuenta de usuario
 *
 * Features:
 * - Validación backend con errores por campo
 * - Muestra errores con badges rojos inline
 * - Limpia errores automáticamente al escribir
 * - Si validación falla, NO se crea en BD
 * - Validación realista de email (con DNS check en backend)
 */
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

    // Estado para errores de validación
    const [errores, setErrores] = useState({});

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
     * Maneja cambios en inputs
     * Limpia el error del campo al escribir
     */
    const handleTexto = (e) => {
        const { name, value } = e.target;
        setFormulario({ ...formulario, [name]: value });

        // Limpiar error del campo
        if (errores[name]) {
            const newErrores = { ...errores };
            delete newErrores[name];
            setErrores(newErrores);
        }
    };

    /**
     * Maneja cambios en selects
     */
    const handleSelect = (e) => {
        const { name, value } = e.target;
        setFormulario({ ...formulario, [name]: value });

        // Limpiar error del campo
        if (errores[name]) {
            const newErrores = { ...errores };
            delete newErrores[name];
            setErrores(newErrores);
        }
    };

    /**
     * Maneja cambios de ubicación desde el mapa
     */
    const handleUbicacionChange = (lat, lng, ubicacionTexto) => {
        setFormulario(prev => ({
            ...prev,
            latitud: lat.toString(),
            longitud: lng.toString(),
            ubicacion: ubicacionTexto || prev.ubicacion
        }));
        // Limpiar error de ubicación
        if (errores.ubicacion) {
            const newErrores = { ...errores };
            delete newErrores.ubicacion;
            setErrores(newErrores);
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

        try {
            const formData = new FormData();
            Object.keys(formulario).forEach(key => {
                if (formulario[key]) {
                    formData.append(key, formulario[key]);
                }
            });

            const response = await fetch('http://localhost:8000/api/register', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            });

            const respuesta = await response.json();

            if (response.ok && !respuesta.error) {
                // Éxito - Conectar automáticamente
                const datosUsuario = {
                    access_token: respuesta.access_token,
                    user: respuesta.user || respuesta.usuario
                };
                conectar(datosUsuario);
                notificaciones.exito("¡Bienvenido! Cuenta creada correctamente.");
                setTimeout(() => navigate('/'), 1500);
            } else {
                // Error: mostrar errores por campo
                if (respuesta?.detalles) {
                    setErrores(respuesta.detalles);
                    window.scrollTo(0, 0);
                } else {
                    notificaciones.error(respuesta?.message || "Revisa los campos");
                }
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            notificaciones.error("Error de conexión");
        }
    };

    return (
        <div className="registro-container">
            <div className="registro-wrapper">
                <form className="sc-form" onSubmit={enviarFormulario}>
                    <h2>Crear Cuenta</h2>

                    {/* FILA 1: Nick | Email */}
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

                    {/* FILA 2: Nombre | Rol */}
                    <div className="form-row">
                        <div>
                            <label>Nombre Real / Artístico</label>
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

                    {/* FILA 3: Contraseña | Confirmación */}
                    <div className="form-row">
                        <div>
                            <label>Contraseña</label>
                            <input
                                type="password"
                                name="password"
                                value={formulario.password}
                                onChange={handleTexto}
                                placeholder="Mín. 8 caracteres"
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
                                placeholder="Repite tu contraseña"
                                style={{ borderColor: errores.password_confirmation ? '#ff4444' : undefined }}
                            />
                            {renderErrorMessage('password_confirmation')}
                        </div>
                    </div>

                    {/* MAPA INTERACTIVO PARA UBICACIÓN */}
                    <MapaUbicacion
                        latitud={formulario.latitud}
                        longitud={formulario.longitud}
                        ubicacion={formulario.ubicacion}
                        onUbicacionChange={handleUbicacionChange}
                    />

                    {/* BOTÓN */}
                    <button type="submit" className="sc-btn-upload">
                        Crear Cuenta
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#999' }}>
                        ¿Ya tienes cuenta?{' '}
                        <a href="/iniciar-sesion" style={{ color: '#0abcd4', textDecoration: 'none' }}>
                            Inicia sesión aquí
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Registro;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/ProveedorAuth.jsx';
import useApiLogin from '../../hooks/Auth/useApiLogin.js';
import '../formulario.css';
import './Login.css';

/**
 * Login - Componente para iniciar sesión de usuario
 *
 * Features:
 * - Validación backend con errores por campo
 * - Muestra errores con badges rojos inline
 * - Limpia errores automáticamente al escribir
 * - Estilos consistentes con EditarPerfil y Registro
 */
export const Login = () => {
    const [formulario, setFormulario] = useState({
        email: '',
        password: ''
    });

    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(false);

    const { conectar } = useAuth();
    const navigate = useNavigate();

    /**
     * Renderiza mensaje de error para un campo específico
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
     * Envía el formulario
     * Valida en backend, muestra errores si hay, o procesa éxito
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrores({});
        setCargando(true);

        const respuesta = await useApiLogin(formulario.email, formulario.password);

        setCargando(false);

        if (respuesta && respuesta.access_token) {
            // Éxito - conectar y redirigir
            conectar(respuesta);
            navigate('/');
        } else {
            // Error de credenciales
            if (respuesta?.detalles) {
                // Si hay errores por campo desde el backend
                setErrores(respuesta.detalles);
                window.scrollTo(0, 0);
            } else {
                // Error genérico
                setErrores({
                    email: [respuesta?.message || 'Credenciales incorrectas o error de conexión']
                });
                window.scrollTo(0, 0);
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <form className="sc-form" onSubmit={handleSubmit}>
                    <h2>Iniciar Sesión</h2>

                    {/* Email */}
                    <div className="form-row" style={{ gridTemplateColumns: '1fr' }}>
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

                    {/* Contraseña */}
                    <div className="form-row" style={{ gridTemplateColumns: '1fr' }}>
                        <div>
                            <label>Contraseña</label>
                            <input
                                type="password"
                                name="password"
                                value={formulario.password}
                                onChange={handleTexto}
                                placeholder="Tu contraseña"
                                style={{ borderColor: errores.password ? '#ff4444' : undefined }}
                            />
                            {renderErrorMessage('password')}
                        </div>
                    </div>

                    {/* BOTÓN */}
                    <button
                        type="submit"
                        className="sc-btn-upload"
                        disabled={cargando}
                    >
                        {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#999' }}>
                        ¿No tienes cuenta?{' '}
                        <Link to="/registro" style={{ color: '#0abcd4', textDecoration: 'none' }}>
                            Crea una aquí
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};
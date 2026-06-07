/**
 * Login.jsx - Formulario de inicio de sesion
 *
 * Permite al usuario autenticarse con email y contraseña.
 * Los errores de validacion se muestran campo a campo directamente
 * bajo el input correspondiente, sin necesidad de un bloque de error global.
 *
 * Flujo:
 *   1. El usuario rellena el formulario y envia
 *   2. Se llama al hook useApiLogin con las credenciales
 *   3a. Si la respuesta contiene access_token -> sesion iniciada, redireccion a "/"
 *   3b. Si hay errores por campo (detalles) -> se muestran inline en rojo
 *   3c. Si es un error generico -> se muestra en el campo email
 *
 * Los errores desaparecen automaticamente al volver a escribir en el campo.
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/ProveedorAuth.jsx';
import useApiLogin from '../../hooks/Auth/useApiLogin.js';
import '../formulario.css';
import './Login.css';

export const Login = () => {
    const [formulario, setFormulario] = useState({
        email: '',
        password: ''
    });

    // Mapa de errores por nombre de campo: { email: ['mensaje'], password: [...] }
    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(false);

    const { conectar } = useAuth();
    const navigate = useNavigate();

    /**
     * Renderiza el primer mensaje de error de un campo si existe.
     *
     * @param {string} fieldName - Nombre del campo del formulario
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
     * Actualiza el formulario y borra el error del campo modificado.
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
     * Envia las credenciales al backend.
     * Si el login es exitoso, conecta la sesion y redirige al inicio.
     * Si hay errores, los distribuye por campo o muestra uno generico.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrores({});
        setCargando(true);

        const respuesta = await useApiLogin(formulario.email, formulario.password);

        setCargando(false);

        if (respuesta && respuesta.access_token) {
            // Login exitoso
            conectar(respuesta);
            navigate('/');
        } else {
            if (respuesta?.detalles) {
                // Errores de validacion por campo devueltos por Laravel
                setErrores(respuesta.detalles);
                window.scrollTo(0, 0);
            } else {
                // Error generico (credenciales incorrectas, servidor caido, etc.)
                setErrores({
                    email: [respuesta?.message || 'Credenciales incorrectas o error de conexion']
                });
                window.scrollTo(0, 0);
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <form className="sc-form" onSubmit={handleSubmit}>
                    <h2>Iniciar Sesion</h2>

                    {/* Campo email */}
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

                    {/* Campo contraseña */}
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

                    <button
                        type="submit"
                        className="sc-btn-upload"
                        disabled={cargando}
                    >
                        {cargando ? 'Iniciando sesion...' : 'Iniciar Sesion'}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#999' }}>
                        No tienes cuenta?{' '}
                        <Link to="/registro" style={{ color: '#0abcd4', textDecoration: 'none' }}>
                            Crea una aqui
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

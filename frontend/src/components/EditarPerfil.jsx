import React, { useState, useContext } from 'react';
import { FaTwitter, FaInstagram, FaYoutube, FaSpotify, FaTiktok, FaSoundcloud } from 'react-icons/fa';
import { contextoUsuario } from '../contexts/ProveedorUsuario.jsx';
import { contextoNotificaciones } from '../contexts/ProveedorNotificaciones.jsx';
import { useAuth } from '../contexts/ProveedorAuth.jsx';
import MapaUbicacion from './MapaUbicacion.jsx';
import './EditarPerfil.css';

/**
 * EditarPerfil - Componente para editar perfil de usuario
 *
 * Features:
 * - Validación backend con errores por campo
 * - Muestra errores con badges rojos inline
 * - Limpia errores automáticamente al escribir
 * - Si validación falla, NO se modifica en BD
 */
const EditarPerfil = ({ datosActuales, alFinalizar }) => {
    const { actualizarPerfilUsuario } = useContext(contextoUsuario);
    const notificaciones = useContext(contextoNotificaciones);
    const { conectar } = useAuth();

    const [formulario, setFormulario] = useState({
        nick: datosActuales?.nick || '',
        nombre: datosActuales?.nombre || '',
        email: datosActuales?.email || '',
        biografia: datosActuales?.biografia || '',
        ubicacion: datosActuales?.ubicacion || '',
        latitud: datosActuales?.latitud || '',
        longitud: datosActuales?.longitud || '',
        rol: datosActuales?.rol || 'usuario',
        twitter: datosActuales?.twitter || '',
        instagram: datosActuales?.instagram || '',
        youtube: datosActuales?.youtube || '',
        spotify: datosActuales?.spotify || '',
        tiktok: datosActuales?.tiktok || '',
        soundcloud: datosActuales?.soundcloud || '',
        avatar: null,
        banner: null
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
     * Maneja cambios en inputs de texto
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
     * Limpia el error del campo al cambiar
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
     * Maneja selección de archivos
     * Limpia el error del campo al seleccionar
     */
    const handleArchivo = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormulario({ ...formulario, [name]: files[0] });

            // Limpiar error del campo
            if (errores[name]) {
                const newErrores = { ...errores };
                delete newErrores[name];
                setErrores(newErrores);
            }
        }
    };

    /**
     * Maneja cambios de ubicación desde el mapa
     * Actualiza ubicación, latitud y longitud
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

        const respuesta = await actualizarPerfilUsuario(datosActuales.id, formulario);

        if (respuesta && !respuesta.error) {
            // Éxito
            notificaciones.exito("Perfil actualizado correctamente");

            // El ProveedorUsuario ya actualiza localStorage
            // Extraer el usuario actualizado de la respuesta para sincronizar NavBar
            const usuarioActualizado = respuesta.usuario || respuesta.user || respuesta;

            // Actualizar el contexto de autenticación para que la navbar se refleje inmediatamente
            const token = localStorage.getItem('token');
            if (token && usuarioActualizado) {
                conectar({ access_token: token, usuario: usuarioActualizado });
            }

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
            <h2>Editar Perfil</h2>

            {/* FILA 1: Nick | Email */}
            <div className="form-row">
                <div>
                    <label>Nick (Usuario)</label>
                    <input
                        type="text"
                        name="nick"
                        value={formulario.nick}
                        onChange={handleTexto}
                        placeholder="Nombre de usuario"
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
                    <label>Rol</label>
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

            {/* FILA 3: Biografía fullwidth */}
            <div className="form-row" style={{ gridTemplateColumns: '1fr' }}>
                <div>
                    <label>Biografía</label>
                    <textarea
                        name="biografia"
                        value={formulario.biografia}
                        onChange={handleTexto}
                        placeholder="Cuéntale al mundo quién eres..."
                        style={{ borderColor: errores.biografia ? '#ff4444' : undefined }}
                    />
                    {renderErrorMessage('biografia')}
                </div>
            </div>

            {/* FILA 4: REDES SOCIALES */}
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #333333' }}>
                <label style={{ display: 'block', marginBottom: '12px', color: '#bbbbbb', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                    🌐 Redes Sociales (Opcional)
                </label>

                <div className="social-networks-row">
                    <div className="social-network-item">
                        <FaTwitter style={{ color: '#1DA1F2' }} />
                        <input
                            type="text"
                            name="twitter"
                            value={formulario.twitter}
                            onChange={handleTexto}
                            placeholder="Twitter/X"
                            style={{ borderColor: errores.twitter ? '#ff4444' : undefined }}
                        />
                    </div>
                    <div className="social-network-item">
                        <FaInstagram style={{ color: '#E4405F' }} />
                        <input
                            type="text"
                            name="instagram"
                            value={formulario.instagram}
                            onChange={handleTexto}
                            placeholder="Instagram"
                            style={{ borderColor: errores.instagram ? '#ff4444' : undefined }}
                        />
                    </div>
                </div>

                <div className="social-networks-row" style={{ marginTop: '12px' }}>
                    <div className="social-network-item">
                        <FaYoutube style={{ color: '#FF0000' }} />
                        <input
                            type="text"
                            name="youtube"
                            value={formulario.youtube}
                            onChange={handleTexto}
                            placeholder="YouTube"
                            style={{ borderColor: errores.youtube ? '#ff4444' : undefined }}
                        />
                    </div>
                    <div className="social-network-item">
                        <FaSpotify style={{ color: '#1DB954' }} />
                        <input
                            type="text"
                            name="spotify"
                            value={formulario.spotify}
                            onChange={handleTexto}
                            placeholder="Spotify"
                            style={{ borderColor: errores.spotify ? '#ff4444' : undefined }}
                        />
                    </div>
                </div>

                <div className="social-networks-row" style={{ marginTop: '12px' }}>
                    <div className="social-network-item">
                        <FaTiktok style={{ color: '#000000' }} />
                        <input
                            type="text"
                            name="tiktok"
                            value={formulario.tiktok}
                            onChange={handleTexto}
                            placeholder="TikTok"
                            style={{ borderColor: errores.tiktok ? '#ff4444' : undefined }}
                        />
                    </div>
                    <div className="social-network-item">
                        <FaSoundcloud style={{ color: '#FF7700' }} />
                        <input
                            type="text"
                            name="soundcloud"
                            value={formulario.soundcloud}
                            onChange={handleTexto}
                            placeholder="SoundCloud"
                            style={{ borderColor: errores.soundcloud ? '#ff4444' : undefined }}
                        />
                    </div>
                </div>
            </div>

            {/* FILA 4: Avatar | Banner */}
            <div className="form-row">
                <div>
                    <label>Cambiar Avatar (Opcional)</label>
                    <input
                        type="file"
                        name="avatar"
                        accept="image/*"
                        onChange={handleArchivo}
                        style={{ borderColor: errores.avatar ? '#ff4444' : undefined }}
                    />
                    {renderErrorMessage('avatar')}
                </div>

                <div>
                    <label>Cambiar Banner (Opcional)</label>
                    <input
                        type="file"
                        name="banner"
                        accept="image/*"
                        onChange={handleArchivo}
                        style={{ borderColor: errores.banner ? '#ff4444' : undefined }}
                    />
                    {renderErrorMessage('banner')}
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
                Guardar Cambios
            </button>
        </form>
    );
};

export default EditarPerfil;
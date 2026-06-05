/**
 * Cancion.jsx - Tarjeta de presentacion de una cancion
 *
 * Muestra la portada, titulo y artista de una cancion dentro de un carrusel
 * o listado. Tiene dos zonas de interaccion claramente separadas:
 *
 *   - Zona de imagen: al hacer clic reproduce la cancion a traves del contexto.
 *     Si no hay sesion, muestra un candado y deshabilita la reproduccion.
 *   - Zona de texto (titulo): enlace a la pagina de detalle de la cancion.
 *   - Zona de artista: enlace al perfil del usuario propietario.
 *
 * La tarjeta adopta la clase CSS "activa" cuando es la cancion en reproduccion,
 * lo que permite destacarla visualmente en el carrusel.
 *
 * Si el avatar del artista falla al cargar, se muestra el icono FaUser como
 * fallback para mantener la consistencia visual.
 *
 * Props:
 *   datosCancion {object} - Objeto cancion con id, titulo, portada, usuario
 */
import React, { useContext } from "react";
import { contextoMusica } from "../../contexts/ProveedorMusica.jsx";
import { generarPortadaPlaceholder } from "../../utils/imagen.js";
import { tieneSesion } from "../../utils/sesion.js";
import { Link } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import "./Cancion.css";

const Cancion = (props) => {
    const { reproducirTrack, trackActual, isPlaying } = useContext(contextoMusica);
    const { id, titulo, portada, usuario } = props.datosCancion;
    const sesionIniciada = tieneSesion();

    // Imagen de fondo generada con el titulo cuando no hay portada
    const imagenPorDefecto = generarPortadaPlaceholder(titulo || 'Cancion');

    // Indica si esta cancion es la que esta sonando en este momento
    const esEsta = trackActual?.id === id;

    /**
     * Inicia o pausa la reproduccion de esta cancion.
     * Detiene la propagacion para que el clic no active el enlace de detalle.
     */
    const manejarReproduccion = (e) => {
        e.preventDefault();
        e.stopPropagation();
        reproducirTrack(props.datosCancion);
    };

    return (
        <article
            className={`tarjeta-cancion ${esEsta ? 'activa' : ''}`}
            id={id ? id : crypto.randomUUID()}
        >
            {/* Zona de la imagen: clic reproduce (o muestra candado si no hay sesion) */}
            <div
                className="contenedor-imagen"
                onClick={sesionIniciada ? manejarReproduccion : undefined}
                style={{ cursor: sesionIniciada ? 'pointer' : 'not-allowed' }}
                title={sesionIniciada ? 'Click para reproducir' : 'Inicia sesion para reproducir'}
            >
                <img
                    src={portada}
                    alt="Imagen Cancion"
                    onError={(e) => (e.target.src = imagenPorDefecto)}
                />

                {/* Indicador play/pausa visible al hacer hover cuando hay sesion */}
                {sesionIniciada && (
                    <div className="indicador-reproduccion">
                        <span className="icon-play">
                            {esEsta && isPlaying ? '⏸' : '▶'}
                        </span>
                    </div>
                )}

                {/* Candado para usuarios no autenticados */}
                {!sesionIniciada && (
                    <div className="indicador-reproduccion">
                        <FaLock className="icon-lock" />
                    </div>
                )}
            </div>

            <div className="cuerpo-tarjeta">
                {/* Titulo: enlace a la pagina de detalle */}
                <div className='titulo-cancion'>
                    <Link
                        to={`/mostrar/cancion/${id}`}
                        className="enlace-titulo-cancion"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {titulo ? titulo : 'Titulo no disponible'}
                    </Link>
                </div>

                {/* Artista: avatar + nombre, enlace al perfil */}
                <div className='seccion-usuario-cancion'>
                    <Link
                        to={`/mostrar/usuario/${usuario?.id}`}
                        className="enlace-usuario-cancion"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='avatar-usuario-cancion'>
                            {usuario?.avatar ? (
                                <>
                                    <img
                                        src={usuario.avatar}
                                        alt={usuario?.nombre || 'Usuario'}
                                        onError={(e) => {
                                            // Si la imagen falla, ocultar y mostrar icono
                                            e.target.style.display = 'none';
                                            const parent = e.target.parentElement;
                                            const fallback = parent.querySelector('.avatar-placeholder');
                                            if (fallback) fallback.style.display = 'flex';
                                        }}
                                    />
                                    <div className='avatar-placeholder' style={{ display: 'none' }}>
                                        <FaUser />
                                    </div>
                                </>
                            ) : (
                                // Sin avatar: mostrar icono directamente
                                <div className='avatar-placeholder'>
                                    <FaUser />
                                </div>
                            )}
                        </div>
                        <span className='nombre-usuario-cancion'>
                            {usuario?.nombre || usuario?.nick || 'Usuario no disponible'}
                        </span>
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default Cancion;

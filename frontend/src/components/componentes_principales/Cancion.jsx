import React, { useContext } from "react";
import { contextoMusica } from "../../contexts/ProveedorMusica.jsx";
import { generarPortadaPlaceholder } from "../../utils/imagen.js";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import "./Cancion.css";

const Cancion = (props) => {
    const { reproducirTrack, trackActual, isPlaying } = useContext(contextoMusica);
    const { id, titulo, portada, usuario } = props.datosCancion;
    // Usar gradientes como colecciones en lugar de corchea
    const imagenPorDefecto = generarPortadaPlaceholder(titulo || 'Canción');

    const esEsta = trackActual?.id === id;

    // Esta función ahora solo se activa al hacer clic en la imagen
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
            {/* ZONA DE REPRODUCCIÓN: Al hacer clic en la imagen, suena la música */}
            <div className="contenedor-imagen" onClick={manejarReproduccion} style={{ cursor: 'pointer' }}>
                <img
                    src={portada}
                    alt="Imagen Cancion"
                    onError={(e) => (e.target.src = imagenPorDefecto)}
                />

                {/* Indicador visual / Botón Play. Ahora siempre mostramos Play o Pausa según el estado */}
                <div className="indicador-reproduccion">
                    <span className="icon-play">
                        {esEsta && isPlaying ? '⏸' : '▶'}
                    </span>
                </div>
            </div>

            <div className="cuerpo-tarjeta">
                {/* ZONA DE NAVEGACIÓN: Al hacer clic en el título, vamos a detalles */}
                <div className='titulo-cancion'>
                    <Link
                        to={`/mostrar/cancion/${id}`}
                        className="enlace-titulo-cancion"
                        onClick={(e) => e.stopPropagation()} // Evita cualquier conflicto de clics
                    >
                        {titulo ? titulo : 'Título no disponible'}
                    </Link>
                </div>
                {/* ZONA DEL DUEÑO: Avatar + Nombre */}
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
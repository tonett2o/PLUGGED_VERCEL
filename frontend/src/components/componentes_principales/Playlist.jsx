import React from "react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { generarPortadaPlaceholder } from "../../utils/imagen.js";
import "./Playlist.css";

const Playlist = (props) => {
    const { id, titulo, portada, usuario } = props.datosPlaylist;
    const imagenPorDefecto = generarPortadaPlaceholder(titulo || 'Playlist');

    return (
        <>
            <article className='tarjeta-playlist' id={id ? id : crypto.randomUUID()}>
                <div className="contenedor-imagen-playlist" style={{ position: 'relative' }}>
                    {portada ? (
                        <img
                            src={portada}
                            alt="Imagen Playlist"
                            className="imagen-playlist"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                const parent = e.target.parentElement;
                                const fallback = parent.querySelector('.gradient-fallback');
                                if (fallback) fallback.style.display = 'block';
                            }}
                        />
                    ) : null}
                    <div
                        className="gradient-fallback"
                        style={{
                            backgroundImage: `url(${imagenPorDefecto})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            width: '100%',
                            height: '100%',
                            borderRadius: '6px',
                            display: portada ? 'none' : 'block'
                        }}
                    />
                </div>
                <Link to={`/mostrar/playlist/${id}`} className='titulo-playlist-link'>
                    <div className='titulo-playlist'>{titulo ? titulo : 'Titulo no disponible'}</div>
                </Link>
                {/* ZONA DEL DUEÑO: Avatar + Nombre */}
                <div className='seccion-usuario-playlist'>
                    <Link
                        to={`/mostrar/usuario/${usuario?.id}`}
                        className="enlace-usuario-playlist"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='avatar-usuario-playlist'>
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
                        <span className='nombre-usuario-playlist'>
                            {usuario?.nombre || usuario?.nick || 'Usuario no disponible'}
                        </span>
                    </Link>
                </div>
            </article>
        </>
    );
}

export default Playlist;
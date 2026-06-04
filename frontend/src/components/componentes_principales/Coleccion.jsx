import React from "react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { generarPortadaPlaceholder, resolverRutaArchivo } from "../../utils/imagen.js";
import "./Coleccion.css";

const Coleccion = (props) => {
    const { id, titulo, portada, usuario } = props.datosColeccion;
    const imagenPorDefecto = generarPortadaPlaceholder(titulo || 'Colección');
    const imagenUrl = resolverRutaArchivo(portada);

    return (
        <article className='tarjeta-coleccion' id={id ? id : crypto.randomUUID()}>
            <div className="contenedor-imagen-coleccion">
                <img
                    src={imagenUrl || imagenPorDefecto}
                    alt="Imagen Colección"
                    onError={(e) => (e.target.src = imagenPorDefecto)}
                />
            </div>
            <div className='cuerpo-coleccion'>
                <Link to={`/mostrar/coleccion/${id}`} className='titulo-coleccion-link'>
                    <div className='titulo-coleccion'>{titulo ? titulo : 'Título no disponible'}</div>
                </Link>
                {/* ZONA DEL DUEÑO: Avatar + Nombre */}
                <div className='seccion-usuario-coleccion'>
                    <Link
                        to={`/mostrar/usuario/${usuario?.id}`}
                        className="enlace-usuario-coleccion"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='avatar-usuario-coleccion'>
                            {usuario?.avatar ? (
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
                            ) : (
                                <div className='avatar-placeholder'>
                                    <FaUser />
                                </div>
                            )}
                        </div>
                        <span className='nombre-usuario-coleccion'>
                            {usuario?.nombre || usuario?.nick || 'Usuario no disponible'}
                        </span>
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default Coleccion;
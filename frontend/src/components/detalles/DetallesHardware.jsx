import React from "react";
import { Link } from "react-router-dom";
import API_URL from "../../config/api.js";
import PortadaPorDefecto from "../../assets/portada-default.jpg";
import "./DetallesHardware.css";

const URL_STORAGE = `${API_URL}/storage/`;

const obtenerImagen = (ruta) => {
    if (!ruta) return PortadaPorDefecto;
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
    return `${URL_STORAGE}${ruta.startsWith('/') ? ruta.substring(1) : ruta}`;
};

const DetallesHardware = ({ hwBuscado }) => {
    if (!hwBuscado) return <div>Cargando...</div>;

    const { id, nombre, marca, precio, imagen, descripcion, usuario } = hwBuscado;
    const imagenUrl = obtenerImagen(imagen);

    return (
        <div className="sc-gear-detail-page">
            <div className="sc-gear-detail-container">
                <div className="sc-gear-detail-imagen">
                    <img
                        src={imagenUrl}
                        alt={nombre}
                        onError={(e) => (e.target.src = PortadaPorDefecto)}
                    />
                </div>

                <div className="sc-gear-detail-info">
                    <h1 className="sc-gear-detail-nombre">{nombre}</h1>

                    {marca && <p className="sc-gear-detail-marca"><strong>Marca:</strong> {marca}</p>}
                    {precio && <p className="sc-gear-detail-precio"><strong>Precio:</strong> {precio} €</p>}
                    {usuario && (
                        <p className="sc-gear-detail-usuario">
                            <strong>Añadido por:</strong>
                            <Link to={`/mostrar/usuario/${usuario.id}`} className="sc-user-link">
                                {usuario.nombre || usuario.nick}
                            </Link>
                        </p>
                    )}

                    {descripcion && (
                        <div className="sc-gear-detail-descripcion">
                            <h3>Descripción</h3>
                            <p>{descripcion}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DetallesHardware;
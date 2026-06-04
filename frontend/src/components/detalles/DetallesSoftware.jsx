import React from "react";
import { Link } from "react-router-dom";
import PortadaPorDefecto from "../../assets/portada-default.jpg";
import "./DetallesSoftware.css";

const URL_STORAGE = "http://localhost:8000/storage/";

const obtenerImagen = (ruta) => {
    if (!ruta) return PortadaPorDefecto;
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
    return `${URL_STORAGE}${ruta.startsWith('/') ? ruta.substring(1) : ruta}`;
};

const DetallesSoftware = ({ swBuscado }) => {
    if (!swBuscado) return <div>Cargando...</div>;

    const { id, nombre, version, distribuidor, precio, imagen, tipo_pago, descripcion, usuario } = swBuscado;
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

                    {version && <p className="sc-gear-detail-version"><strong>Versión:</strong> {version}</p>}
                    {distribuidor && <p className="sc-gear-detail-distribuidor"><strong>Distribuidor:</strong> {distribuidor}</p>}
                    {tipo_pago && <p className="sc-gear-detail-pago"><strong>Modalidad:</strong> {tipo_pago}</p>}
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

export default DetallesSoftware;
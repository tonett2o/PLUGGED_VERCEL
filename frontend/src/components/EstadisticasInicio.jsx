import React, { useContext } from "react";
import { contextoMusica } from "../contexts/ProveedorMusica";
import "./EstadisticasInicio.css";

const EstadisticasInicio = () => {
    const { canciones = [], colecciones = [], usuarios = [] } = useContext(contextoMusica) || {};

    // Calcular estadísticas
    const totalCanciones = canciones.length;

    const totalColecciones = colecciones.filter(c =>
        c.tipo && !['album', 'ep'].includes(c.tipo.toLowerCase())
    ).length;

    const totalEPs = colecciones.filter(c =>
        c.tipo && ['ep', 'album'].includes(c.tipo.toLowerCase())
    ).length;

    const artistasUnicos = new Set(
        canciones.map(c => c.usuario?.id).filter(Boolean)
    ).size;

    const estadisticas = [
        { numero: totalCanciones, label: "Canciones" },
        { numero: totalColecciones, label: "Colecciones" },
        { numero: totalEPs, label: "Álbumes & EPs" },
        { numero: artistasUnicos, label: "Artistas" },
    ];

    return (
        <section className="inicio-estadisticas">
            <div className="inicio-estadisticas-grid">
                {estadisticas.map((stat, index) => (
                    <div key={index} className="inicio-estadistica-card">
                        <div className="inicio-estadistica-numero">{stat.numero.toLocaleString()}</div>
                        <div className="inicio-estadistica-label">{stat.label}</div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default EstadisticasInicio;

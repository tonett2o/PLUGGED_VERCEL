import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { contextoMusica } from "../contexts/ProveedorMusica";
import { useAuth } from "../contexts/ProveedorAuth";
import "./HeroEstadisticas.css";

const HeroEstadisticas = () => {
    const { usuario, autenticado } = useAuth();
    const { canciones = [], colecciones = [] } = useContext(contextoMusica) || {};

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
        <section className="hero-estadisticas">
            <div className="hero-estadisticas-contenido">
                {autenticado ? (
                    <>
                        <div className="hero-estadisticas-bienvenida">
                            <h1 className="hero-titulo">
                                ¡Bienvenido de vuelta, <span className="acento">{usuario?.nombre || usuario?.nick || "Artista"}</span>!
                            </h1>
                            <p className="hero-subtitulo">
                                Descubre nueva música, comparte tus tracks y conecta con otros artistas.
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="hero-estadisticas-bienvenida">
                            <h1 className="hero-titulo">
                                La plataforma para <span className="acento">artistas</span> y amantes de la música
                            </h1>
                            <p className="hero-subtitulo">
                                Comparte tus tracks, crea colecciones y playlists, descubre eventos y conecta con otros músicos.
                            </p>
                            <div className="hero-ctas">
                                <Link to="/registrarse" className="hero-btn primario">
                                    Únete gratis
                                </Link>
                                <Link to="/login" className="hero-btn secundario">
                                    Iniciar sesión
                                </Link>
                            </div>
                        </div>
                    </>
                )}

                <div className="hero-estadisticas-grid">
                    {estadisticas.map((stat, index) => (
                        <div key={index} className="hero-estadistica-card">
                            <div className="hero-estadistica-numero">{stat.numero.toLocaleString()}</div>
                            <div className="hero-estadistica-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroEstadisticas;

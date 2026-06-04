import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { contextoMusica } from "../contexts/ProveedorMusica";
import "./HeroSection.css";

const HeroSection = () => {
    const contexto = useContext(contextoMusica);
    const usuarioLogeado = contexto?.usuarioLogeado || contexto?.usuario?.id;
    const nombreUsuario = contexto?.usuario?.nombre || contexto?.usuario?.nick || "Artista";

    return (
        <header className="inicio-hero">
            <div className="inicio-hero-glow"></div>

            <div className="inicio-hero-contenido">
                {usuarioLogeado ? (
                    <>
                        <h1 className="inicio-hero-titulo">
                            ¡Bienvenido de vuelta, <span className="acento">{nombreUsuario}</span>!
                        </h1>
                        <p className="inicio-hero-sub">
                            Descubre nueva música, comparte tus tracks y conecta con otros artistas.
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="inicio-hero-titulo">
                            La plataforma para <span className="acento">artistas</span> y amantes de la música
                        </h1>
                        <p className="inicio-hero-sub">
                            Comparte tus tracks, crea colecciones y playlists, descubre eventos y conecta con otros músicos.
                        </p>
                        <div className="inicio-hero-cta">
                            <Link to="/registrarse" className="inicio-btn primario grande">
                                Únete gratis
                            </Link>
                            <Link to="/login" className="inicio-btn secundario grande">
                                Iniciar sesión
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
};

export default HeroSection;

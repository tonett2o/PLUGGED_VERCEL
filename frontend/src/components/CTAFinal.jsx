import React from "react";
import { Link } from "react-router-dom";
import "./CTAFinal.css";

const CTAFinal = () => {
    return (
        <section className="inicio-cta-final">
            <h2>¿Listo para compartir tu música?</h2>
            <p>Únete a miles de artistas y amantes de la música en PLUGGED</p>
            <Link to="/registrarse" className="inicio-btn primario grande">
                Comenzar ahora
            </Link>
        </section>
    );
};

export default CTAFinal;

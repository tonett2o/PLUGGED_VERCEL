// ListarCanciones.jsx (Fragmento actualizado)
import React, { useContext, useRef } from "react";
import { contextoMusica } from "../../contexts/ProveedorMusica.jsx";
import Cancion from "../componentes_principales/Cancion.jsx";
// Ya no necesitamos importar Link aquí, lo haremos en Cancion.jsx
import "./ListarCanciones.css";

const ListarCanciones = () => {
    const { canciones } = useContext(contextoMusica);
    const carruselRef = useRef(null);

    const hacerScroll = (desplazamiento) => {
        if (carruselRef.current) {
            carruselRef.current.scrollBy({ 
                left: desplazamiento, 
                behavior: 'smooth' 
            });
        }
    };

    return (
        <section className="listado-canciones">
            {canciones.length > 0 ? (
                <div className="carrusel-wrapper">
                    <button 
                        className="flecha-carrusel izquierda" 
                        onClick={() => hacerScroll(-300)}
                    >
                        &#10094;
                    </button>
                    
                    <div className="carrusel-contenedor" ref={carruselRef}>
                        {canciones.map((cancion) => {
                            return (
                                /* Cambiamos el <Link> por un <div> */
                                <div key={cancion.id} className="carrusel-item"> 
                                    <Cancion datosCancion={cancion} /> 
                                </div>
                            );
                        })}
                    </div>

                    <button 
                        className="flecha-carrusel derecha" 
                        onClick={() => hacerScroll(300)}
                    >
                        &#10095;
                    </button>
                </div>
            ) : (
                <p>No hay Canciones disponibles</p>
            )}
        </section>
    );
}

export default ListarCanciones;
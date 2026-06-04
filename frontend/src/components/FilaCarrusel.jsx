import React, { useRef } from "react";
import "./FilaCarrusel.css";

const FilaCarrusel = ({ titulo, subtitulo, items = [], render, vacio = "No hay elementos" }) => {
    const carruselRef = useRef(null);

    const hacerScroll = (desplazamiento) => {
        if (carruselRef.current) {
            carruselRef.current.scrollBy({ left: desplazamiento, behavior: "smooth" });
        }
    };

    return (
        <section className="inicio-seccion">
            <div className="inicio-seccion-cabecera">
                <div>
                    <h2 className="inicio-seccion-titulo">{titulo}</h2>
                    {subtitulo && <p className="inicio-seccion-subtitulo">{subtitulo}</p>}
                </div>
            </div>

            {items && items.length > 0 ? (
                <div className="inicio-carrusel-wrapper">
                    <button
                        className="inicio-flecha izquierda"
                        onClick={() => hacerScroll(-360)}
                        aria-label="Anterior"
                    >
                        &#10094;
                    </button>

                    <div className="inicio-carrusel" ref={carruselRef}>
                        {items.map((item) => (
                            <div key={item.id} className="inicio-carrusel-item">
                                {render(item)}
                            </div>
                        ))}
                    </div>

                    <button
                        className="inicio-flecha derecha"
                        onClick={() => hacerScroll(360)}
                        aria-label="Siguiente"
                    >
                        &#10095;
                    </button>
                </div>
            ) : (
                <p className="inicio-seccion-vacio">{vacio}</p>
            )}
        </section>
    );
};

export default FilaCarrusel;

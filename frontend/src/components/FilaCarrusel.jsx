/**
 * FilaCarrusel.jsx - Seccion de carrusel horizontal reutilizable
 *
 * Componente generico que muestra un titulo, un subtitulo opcional y una fila
 * de items desplazables horizontalmente con botones de navegacion (flechas).
 *
 * Usa un patron de render prop (prop "render") para que el componente padre
 * decida como se visualiza cada item, permitiendo reutilizar el carrusel para
 * canciones, colecciones, playlists, eventos, etc.
 *
 * El desplazamiento se hace mediante scrollBy con comportamiento suave,
 * sin necesidad de gestionar el indice activo manualmente.
 *
 * Props:
 *   titulo    {string}   - Titulo de la seccion
 *   subtitulo {string}   - Descripcion opcional bajo el titulo
 *   items     {Array}    - Lista de objetos a renderizar (cada uno debe tener .id)
 *   render    {Function} - Funcion que recibe un item y retorna el JSX a mostrar
 *   vacio     {string}   - Mensaje a mostrar cuando la lista esta vacia
 */
import React, { useRef } from "react";
import "./FilaCarrusel.css";

const FilaCarrusel = ({ titulo, subtitulo, items = [], render, vacio = "No hay elementos" }) => {
    // Referencia al contenedor scrollable para controlar el desplazamiento
    const carruselRef = useRef(null);

    /**
     * Desplaza el carrusel horizontalmente la cantidad indicada (en pixeles).
     * Negativo = izquierda, positivo = derecha.
     *
     * @param {number} desplazamiento - Pixeles a desplazar
     */
    const hacerScroll = (desplazamiento) => {
        if (carruselRef.current) {
            carruselRef.current.scrollBy({ left: desplazamiento, behavior: "smooth" });
        }
    };

    return (
        <section className="inicio-seccion">
            {/* Cabecera con titulo y subtitulo opcional */}
            <div className="inicio-seccion-cabecera">
                <div>
                    <h2 className="inicio-seccion-titulo">{titulo}</h2>
                    {subtitulo && <p className="inicio-seccion-subtitulo">{subtitulo}</p>}
                </div>
            </div>

            {items && items.length > 0 ? (
                <div className="inicio-carrusel-wrapper">
                    {/* Boton de navegacion izquierda */}
                    <button
                        className="inicio-flecha izquierda"
                        onClick={() => hacerScroll(-360)}
                        aria-label="Anterior"
                    >
                        &#10094;
                    </button>

                    {/* Contenedor scrollable: cada item se renderiza mediante la render prop */}
                    <div className="inicio-carrusel" ref={carruselRef}>
                        {items.map((item) => (
                            <div key={item.id} className="inicio-carrusel-item">
                                {render(item)}
                            </div>
                        ))}
                    </div>

                    {/* Boton de navegacion derecha */}
                    <button
                        className="inicio-flecha derecha"
                        onClick={() => hacerScroll(360)}
                        aria-label="Siguiente"
                    >
                        &#10095;
                    </button>
                </div>
            ) : (
                // Mensaje de lista vacia
                <p className="inicio-seccion-vacio">{vacio}</p>
            )}
        </section>
    );
};

export default FilaCarrusel;

import React from "react";
import "./BuscadorGenero.css";

const BuscadorGenero = ({ seleccionado, onSelect, onClear }) => {
    const handleInputChange = (e) => {
        onSelect(e.target.value);
    };

    const handleClear = () => {
        onClear();
    };

    return (
        <section className="inicio-seccion">
            <div className="inicio-seccion-cabecera">
                <h2 className="inicio-seccion-titulo">Buscar por Género</h2>
                <p className="inicio-seccion-subtitulo">Escribe el género que te interesa</p>
            </div>

            <div className="inicio-generos-container">
                <div className="inicio-generos-search-wrapper">
                    <input
                        type="text"
                        placeholder="Ej: House, Techno, Trance..."
                        value={seleccionado || ""}
                        onChange={handleInputChange}
                        className="inicio-generos-search"
                    />
                    {seleccionado && (
                        <button
                            className="inicio-generos-clear"
                            onClick={handleClear}
                            title="Limpiar búsqueda"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default BuscadorGenero;

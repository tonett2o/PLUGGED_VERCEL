import React, { useState, useRef, useEffect } from 'react';
import './MultiSelectEstilos.css';

const MultiSelectEstilos = ({ estilosDisponibles = [], estilosSeleccionados = [], onChange, error = false }) => {
    const [abierto, setAbierto] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const containerRef = useRef(null);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickFuera = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setAbierto(false);
            }
        };

        document.addEventListener('mousedown', handleClickFuera);
        return () => document.removeEventListener('mousedown', handleClickFuera);
    }, []);

    const toggleEstilo = (estiloId) => {
        if (estilosSeleccionados.includes(estiloId)) {
            onChange(estilosSeleccionados.filter(id => id !== estiloId));
        } else {
            onChange([...estilosSeleccionados, estiloId]);
        }
    };

    const removeEstilo = (estiloId) => {
        onChange(estilosSeleccionados.filter(id => id !== estiloId));
    };

    const estilosFiltrados = estilosDisponibles.filter(estilo =>
        estilo.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    const estilosSeleccionadosData = estilosDisponibles.filter(e =>
        estilosSeleccionados.includes(e.id)
    );

    return (
        <div
            className={`multi-select-container ${error ? 'error' : ''}`}
            ref={containerRef}
        >
            {/* Chips de estilos seleccionados */}
            {estilosSeleccionadosData.length > 0 && (
                <div className="estilos-chips">
                    {estilosSeleccionadosData.map(estilo => (
                        <div
                            key={estilo.id}
                            className="estilo-chip"
                            style={{
                                backgroundColor: `${estilo.color}20`,
                                borderColor: estilo.color,
                                color: estilo.color,
                            }}
                        >
                            <span>{estilo.nombre}</span>
                            <button
                                type="button"
                                onClick={() => removeEstilo(estilo.id)}
                                className="chip-close"
                                title="Remover"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Dropdown trigger */}
            <div
                className={`multi-select-trigger ${abierto ? 'abierto' : ''}`}
                onClick={() => setAbierto(!abierto)}
            >
                <span className="placeholder">
                    {estilosSeleccionados.length === 0
                        ? 'Selecciona géneros...'
                        : `${estilosSeleccionados.length} seleccionado${estilosSeleccionados.length !== 1 ? 's' : ''}`}
                </span>
                <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            {/* Dropdown menu */}
            {abierto && (
                <div className="multi-select-menu">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar géneros..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        autoFocus
                    />

                    <div className="estilos-list">
                        {estilosFiltrados.length > 0 ? (
                            estilosFiltrados.map(estilo => (
                                <label
                                    key={estilo.id}
                                    className={`estilo-option ${
                                        estilosSeleccionados.includes(estilo.id) ? 'selected' : ''
                                    }`}
                                    style={{
                                        backgroundColor: estilosSeleccionados.includes(estilo.id)
                                            ? `${estilo.color}15`
                                            : 'transparent',
                                        borderLeftColor: estilo.color,
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={estilosSeleccionados.includes(estilo.id)}
                                        onChange={() => toggleEstilo(estilo.id)}
                                    />
                                    <span
                                        className="estilo-nombre"
                                        style={{ color: estilo.color }}
                                    >
                                        {estilo.nombre}
                                    </span>
                                </label>
                            ))
                        ) : (
                            <div className="no-resultados">No se encontraron géneros</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiSelectEstilos;

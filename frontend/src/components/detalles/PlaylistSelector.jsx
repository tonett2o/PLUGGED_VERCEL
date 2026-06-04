import React, { useState, useRef, useEffect } from 'react';
import './PlaylistSelector.css';

const PlaylistSelector = ({ playlists = [], onConfirm, onClose }) => {
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
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

    const handleConfirm = async () => {
        if (selectedPlaylist) {
            await onConfirm(selectedPlaylist.id);
            setSelectedPlaylist(null);
            setBusqueda('');
            setAbierto(false);
        }
    };

    const handleClose = () => {
        setSelectedPlaylist(null);
        setBusqueda('');
        setAbierto(false);
        onClose?.();
    };

    const playlistsFiltradas = playlists.filter(pl =>
        pl.titulo.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="playlist-selector-container" ref={containerRef}>
            {/* Trigger/Header */}
            <div className="playlist-selector-header">
                <h3>Agregar a Playlist</h3>
                <button className="btn-close" onClick={handleClose} title="Cerrar">✕</button>
            </div>

            {/* Playlist seleccionada (como chip) */}
            {selectedPlaylist && (
                <div className="playlist-selected-chip">
                    <svg className="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="playlist-name">{selectedPlaylist.titulo}</span>
                    <button
                        className="chip-remove"
                        onClick={() => setSelectedPlaylist(null)}
                        title="Deseleccionar"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Dropdown trigger */}
            <div
                className={`playlist-selector-trigger ${abierto ? 'abierto' : ''} ${selectedPlaylist ? 'selected' : ''}`}
                onClick={() => setAbierto(!abierto)}
            >
                <span className="placeholder">
                    {selectedPlaylist ? selectedPlaylist.titulo : 'Selecciona una playlist...'}
                </span>
                <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            {/* Dropdown menu */}
            {abierto && (
                <div className="playlist-selector-menu">
                    {/* Search input */}
                    <div className="search-wrapper">
                        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="11" cy="11" r="8" strokeWidth="2" />
                            <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar playlist..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Playlist options */}
                    <div className="playlists-list">
                        {playlistsFiltradas.length > 0 ? (
                            playlistsFiltradas.map(pl => (
                                <label
                                    key={pl.id}
                                    className={`playlist-option ${selectedPlaylist?.id === pl.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedPlaylist(pl)}
                                >
                                    <input
                                        type="radio"
                                        name="playlist-select"
                                        value={pl.id}
                                        checked={selectedPlaylist?.id === pl.id}
                                        onChange={() => setSelectedPlaylist(pl)}
                                    />
                                    <span className="playlist-titulo">{pl.titulo}</span>
                                    {pl.canciones?.length > 0 && (
                                        <span className="playlist-count">
                                            {pl.canciones.length} {pl.canciones.length === 1 ? 'canción' : 'canciones'}
                                        </span>
                                    )}
                                </label>
                            ))
                        ) : (
                            <div className="no-resultados">
                                {playlists.length === 0
                                    ? 'No tienes playlists. Crea una para agregar canciones.'
                                    : 'No se encontraron playlists'}
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    {playlists.length > 0 && (
                        <div className="playlist-selector-actions">
                            <button
                                className="btn-cancel"
                                onClick={handleClose}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-confirm"
                                onClick={handleConfirm}
                                disabled={!selectedPlaylist}
                                title={selectedPlaylist ? 'Agregar canción' : 'Selecciona una playlist primero'}
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                </svg>
                                Confirmar
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PlaylistSelector;

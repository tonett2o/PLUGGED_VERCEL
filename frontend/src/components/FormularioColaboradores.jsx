import React, { useState, useEffect } from 'react';
import API_URL from '../config/api.js';
import { useAuth } from '../contexts/ProveedorAuth';
import './FormularioColaboradores.css';

const FormularioColaboradores = ({ colaboradoresSeleccionados = [], onColaboradoresChange }) => {
    const { usuario } = useAuth();
    const [amigos, setAmigos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mostrarLista, setMostrarLista] = useState(false);

    useEffect(() => {
        const obtenerAmigos = async () => {
            if (!usuario?.id) return;
            try {
                const response = await fetch(`${API_URL}/api/usuarios/${usuario.id}/amigos`);
                if (response.ok) {
                    const datos = await response.json();
                    setAmigos(Array.isArray(datos) ? datos : (datos.amigos || []));
                }
            } catch (error) {
                console.error('Error al obtener amigos:', error);
            } finally {
                setCargando(false);
            }
        };
        obtenerAmigos();
    }, [usuario?.id]);

    const toggleColaborador = (amigoId) => {
        const nuevosList = colaboradoresSeleccionados.includes(amigoId)
            ? colaboradoresSeleccionados.filter(id => id !== amigoId)
            : [...colaboradoresSeleccionados, amigoId];
        onColaboradoresChange(nuevosList);
    };

    const colaboradoresActuales = amigos.filter(amigo =>
        colaboradoresSeleccionados.includes(amigo.id)
    );

    if (!usuario?.id) {
        return <div style={{ color: '#888', fontSize: '0.9rem' }}>Debes estar autenticado para agregar colaboradores</div>;
    }

    return (
        <div className="fc-container">
            <label className="fc-label">Colaboradores (Opcional):</label>

            {/* Mostrar colaboradores seleccionados */}
            <div className="fc-selected">
                {colaboradoresActuales.length > 0 ? (
                    <div className="fc-chips">
                        {colaboradoresActuales.map(amigo => (
                            <div key={amigo.id} className="fc-chip">
                                <span>{amigo.nick || amigo.nombre}</span>
                                <button
                                    type="button"
                                    onClick={() => toggleColaborador(amigo.id)}
                                    className="fc-chip-close"
                                    title="Remover colaborador"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>
                        No hay colaboradores seleccionados
                    </span>
                )}
            </div>

            {/* Selector de amigos */}
            <div className="fc-selector">
                <button
                    type="button"
                    onClick={() => setMostrarLista(!mostrarLista)}
                    className="fc-toggle-btn"
                    disabled={amigos.length === 0 && !cargando}
                >
                    {cargando ? 'Cargando amigos...' : `Agregar Colaborador (${amigos.length})`}
                </button>

                {mostrarLista && (
                    <div className="fc-dropdown">
                        {amigos.length === 0 ? (
                            <div style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>
                                No tienes amigos para agregar
                            </div>
                        ) : (
                            <div className="fc-list">
                                {amigos.map(amigo => (
                                    <label key={amigo.id} className="fc-item">
                                        <input
                                            type="checkbox"
                                            checked={colaboradoresSeleccionados.includes(amigo.id)}
                                            onChange={() => toggleColaborador(amigo.id)}
                                        />
                                        <span className="fc-item-content">
                                            {amigo.avatar && (
                                                <img src={amigo.avatar} alt={amigo.nick} className="fc-avatar" />
                                            )}
                                            <span>
                                                <strong>{amigo.nick || amigo.nombre}</strong>
                                                {amigo.nombre && amigo.nick !== amigo.nombre && (
                                                    <small>{amigo.nombre}</small>
                                                )}
                                            </span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormularioColaboradores;

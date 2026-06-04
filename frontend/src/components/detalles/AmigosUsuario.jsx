import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../../config/api.js';
import AvatarPorDefecto from '../../assets/user-default.jpg';
import './AmigosUsuario.css';

const AmigosUsuario = ({ datosUsuario }) => {
    const [amigos, setAmigos] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        if (datosUsuario?.id) {
            const obtenerAmigos = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                    const url = `${API_URL}/api/usuarios/${datosUsuario.id}/amigos`;
                    const response = await fetch(url, { headers });
                    if (response.ok) {
                        const data = await response.json();
                        setAmigos(Array.isArray(data) ? data : []);
                    } else {
                        console.error('Error al cargar amigos:', response.status);
                    }
                } catch (error) {
                    console.error('Error fetching amigos:', error);
                    setAmigos([]);
                } finally {
                    setCargando(false);
                }
            };
            obtenerAmigos();
        } else {
            setCargando(false);
        }
    }, [datosUsuario?.id]);

    if (cargando) {
        return <div className="au-loader">Cargando amigos...</div>;
    }

    return (
        <div className="amigos-usuario-container">
            <div className="au-header">
                <h1 className="au-title">Amigos de {datosUsuario?.nick}</h1>
                <p className="au-count">{amigos.length} {amigos.length === 1 ? 'amigo' : 'amigos'}</p>
            </div>

            {amigos.length > 0 ? (
                <div className="au-grid">
                    {amigos.map(amigo => (
                        <Link
                            key={amigo.id}
                            to={`/mostrar/usuario/${amigo.id}`}
                            className="au-card"
                        >
                            <div className="au-avatar">
                                <img
                                    src={amigo.avatar || AvatarPorDefecto}
                                    alt={amigo.nick}
                                    className="au-img"
                                    onError={(e) => (e.target.src = AvatarPorDefecto)}
                                />
                            </div>
                            <div className="au-info">
                                <p className="au-nick">{amigo.nick}</p>
                                <p className="au-nombre">{amigo.nombre}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="au-empty">
                    <p>{datosUsuario?.nick} aún no tiene amigos</p>
                </div>
            )}
        </div>
    );
};

export default AmigosUsuario;

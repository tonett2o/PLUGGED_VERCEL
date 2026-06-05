import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaCompactDisc, FaLaptop, FaHeadphones } from 'react-icons/fa';
import API_URL from '../../config/api.js';
import { generarPortadaPlaceholder } from '../../utils/imagen.js';
import './Explorar.css';

const Explorar = () => {
    const [activeTab, setActiveTab] = useState('musica');
    const [topUsuarios, setTopUsuarios] = useState([]);
    const [topColecciones, setTopColecciones] = useState([]);
    const [topSoftware, setTopSoftware] = useState([]);
    const [topHardware, setTopHardware] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [usuarios, colecciones, software, hardware] = await Promise.all([
                fetch(`${API_URL}/api/usuarios/top-oyentes`).then(r => r.json()),
                fetch(`${API_URL}/api/colecciones/top-colecciones`).then(r => r.json()),
                fetch(`${API_URL}/api/software/top-software`).then(r => r.json()),
                fetch(`${API_URL}/api/hardware/top-hardware`).then(r => r.json()),
            ]);

            setTopUsuarios(usuarios || []);
            setTopColecciones(colecciones || []);
            setTopSoftware(software || []);
            setTopHardware(hardware || []);
        } catch (error) {
            console.error('Error cargando datos de explorar:', error);
        } finally {
            setCargando(false);
        }
    };

    if (cargando) {
        return <div className="explorar-container"><p>Cargando...</p></div>;
    }

    return (
        <div className="explorar-page-container">
            <div className="explorar-header">
                <h1>Explorar</h1>

                {/* TABS */}
                <div className="explorar-tabs">
                    <button
                        className={`tab-button ${activeTab === 'musica' ? 'active' : ''}`}
                        onClick={() => setActiveTab('musica')}
                    >
                        Música
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'equipamiento' ? 'active' : ''}`}
                        onClick={() => setActiveTab('equipamiento')}
                    >
                        Equipamiento
                    </button>
                </div>
            </div>

            {/* TAB MÚSICA */}
            {activeTab === 'musica' && (
                <div className="tab-content">
                    <section className="explorar-section">
                        <h2 className="section-title">Artistas Destacados</h2>
                        <div className="explorar-list">
                            {topUsuarios.slice(0, 5).map((usuario, index) => (
                                <Link
                                    key={usuario.id}
                                    to={`/mostrar/usuario/${usuario.id}`}
                                    className="explorar-item"
                                >
                                    <div className="item-number">{index + 1}</div>
                                    <div className="item-image">
                                        {usuario.avatar ? (
                                            <>
                                                <img
                                                    src={usuario.avatar}
                                                    alt={usuario.nick}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const fallback = e.target.parentElement.querySelector('.item-placeholder');
                                                        if (fallback) fallback.style.display = 'block';
                                                    }}
                                                />
                                                <FaUser className="item-placeholder" style={{ display: 'none' }} />
                                            </>
                                        ) : (
                                            <FaUser className="item-placeholder" />
                                        )}
                                    </div>
                                    <div className="item-info">
                                        <h3>{usuario.nick}</h3>
                                        <p>{usuario.nombre}</p>
                                    </div>
                                    <div className="item-stat">{usuario.reproducciones_total?.toLocaleString() || 0}</div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section className="explorar-section">
                        <h2 className="section-title">Álbumes Populares</h2>
                        <div className="explorar-list">
                            {topColecciones.slice(0, 5).map((coleccion, index) => {
                                const gradientUrl = generarPortadaPlaceholder(coleccion.titulo || 'Colección');
                                return (
                                    <Link
                                        key={coleccion.id}
                                        to={`/mostrar/coleccion/${coleccion.id}`}
                                        className="explorar-item"
                                    >
                                        <div className="item-number">{index + 1}</div>
                                        <div className="item-image" style={{ position: 'relative' }}>
                                            {coleccion.portada ? (
                                                <img
                                                    src={coleccion.portada}
                                                    alt={coleccion.titulo}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const parent = e.target.parentElement;
                                                        const fallback = parent.querySelector('.gradient-fallback');
                                                        if (fallback) fallback.style.display = 'block';
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className="gradient-fallback"
                                                style={{
                                                    backgroundImage: `url(${gradientUrl})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: '4px',
                                                    display: coleccion.portada ? 'none' : 'block'
                                                }}
                                            />
                                        </div>
                                        <div className="item-info">
                                            <h3>{coleccion.titulo}</h3>
                                            <p>{coleccion.usuario?.nombre || coleccion.artista}</p>
                                        </div>
                                        <div className="item-stat">{coleccion.reproducciones_total?.toLocaleString() || 0}</div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                </div>
            )}

            {/* TAB EQUIPAMIENTO */}
            {activeTab === 'equipamiento' && (
                <div className="tab-content">
                    <section className="explorar-section">
                        <h2 className="section-title">Software Utilizado</h2>
                        <div className="explorar-list">
                            {topSoftware.slice(0, 5).map((soft, index) => (
                                <Link key={soft.id} to={`/mostrar/software/${soft.id}`} className="explorar-item explorar-link">
                                    <div className="item-number">{index + 1}</div>
                                    <div className="item-image">
                                        {soft.imagen ? (
                                            <>
                                                <img
                                                    src={soft.imagen}
                                                    alt={soft.nombre}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const fallback = e.target.parentElement.querySelector('.item-placeholder');
                                                        if (fallback) fallback.style.display = 'block';
                                                    }}
                                                />
                                                <FaLaptop className="item-placeholder" style={{ display: 'none' }} />
                                            </>
                                        ) : (
                                            <FaLaptop className="item-placeholder" />
                                        )}
                                    </div>
                                    <div className="item-info">
                                        <h3>{soft.nombre}</h3>
                                        <p>{soft.distribuidor || 'Software'}</p>
                                    </div>
                                    <div className="item-stat">{soft.usuarios_count}</div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section className="explorar-section">
                        <h2 className="section-title">Hardware Utilizado</h2>
                        <div className="explorar-list">
                            {topHardware.slice(0, 5).map((hw, index) => (
                                <Link key={hw.id} to={`/mostrar/hardware/${hw.id}`} className="explorar-item explorar-link">
                                    <div className="item-number">{index + 1}</div>
                                    <div className="item-image">
                                        {hw.imagen ? (
                                            <>
                                                <img
                                                    src={hw.imagen}
                                                    alt={hw.nombre}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const fallback = e.target.parentElement.querySelector('.item-placeholder');
                                                        if (fallback) fallback.style.display = 'block';
                                                    }}
                                                />
                                                <FaHeadphones className="item-placeholder" style={{ display: 'none' }} />
                                            </>
                                        ) : (
                                            <FaHeadphones className="item-placeholder" />
                                        )}
                                    </div>
                                    <div className="item-info">
                                        <h3>{hw.nombre}</h3>
                                        <p>{hw.marca || 'Hardware'}</p>
                                    </div>
                                    <div className="item-stat">{hw.usuarios_count}</div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default Explorar;

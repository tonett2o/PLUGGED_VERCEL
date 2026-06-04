import React, { useContext, useState, useEffect } from "react";
import API_URL from "../config/api.js";
import { contextoEquipamiento } from "../contexts/ProveedorEquipamiento.jsx";
import { contextoNotificaciones } from "../contexts/ProveedorNotificaciones.jsx";
import "./GestionarEquipamiento.css";

const URL_STORAGE = `${API_URL}/storage/`;

const GestionarEquipamiento = ({ alFinalizar, hardwaresActuales = [], softwaresActuales = [] }) => {
    const {
        catalogoHardware,
        catalogoSoftware,
        loadingGear,
        guardarEquipamiento
    } = useContext(contextoEquipamiento);

    const notificaciones = useContext(contextoNotificaciones);

    // Inicializar CON LOS DATOS QUE EL USUARIO YA TIENE (pasados como props)
    // Hardware: { id: cantidad, ... } para soportar múltiples unidades
    const [hardwareSeleccionado, setHardwareSeleccionado] = useState(() => {
        const hw = {};
        if (hardwaresActuales && hardwaresActuales.length > 0) {
            hardwaresActuales.forEach(h => {
                hw[h.id] = h.pivot?.cantidad || 1;
            });
        }
        return hw;
    });

    // Software: [id, id, ...] simple array
    const [softwareSeleccionado, setSoftwareSeleccionado] = useState(() =>
        softwaresActuales && softwaresActuales.length > 0
            ? softwaresActuales.map(s => s.id)
            : []
    );

    const [idHardwareSelect, setIdHardwareSelect] = useState("");
    const [idSoftwareSelect, setIdSoftwareSelect] = useState("");
    const [guardando, setGuardando] = useState(false);

    const agregarHardware = () => {
        if (!idHardwareSelect) return;
        const idInt = parseInt(idHardwareSelect, 10);

        setHardwareSeleccionado(prev => ({
            ...prev,
            [idInt]: prev[idInt] ? prev[idInt] + 1 : 1
        }));

        setIdHardwareSelect("");
    };

    const agregarSoftware = () => {
        if (!idSoftwareSelect) return;
        const idInt = parseInt(idSoftwareSelect, 10);
        if (!softwareSeleccionado.includes(idInt)) {
            setSoftwareSeleccionado([...softwareSeleccionado, idInt]);
        }
        setIdSoftwareSelect("");
    };

    const quitarHardware = (id) => {
        setHardwareSeleccionado(prev => {
            const nuevo = { ...prev };
            delete nuevo[id];
            return nuevo;
        });
    };

    const cambiarCantidadHardware = (id, newCantidad) => {
        const cantidad = Math.max(1, parseInt(newCantidad, 10) || 1);
        setHardwareSeleccionado(prev => ({
            ...prev,
            [id]: cantidad
        }));
    };

    const quitarSoftware = (id) => {
        setSoftwareSeleccionado(softwareSeleccionado.filter(sId => sId !== id));
    };

    const handleGuardarSetup = async () => {
        setGuardando(true);
        // Convertir objeto de hardware a arrays de IDs
        const hardwareIds = Object.keys(hardwareSeleccionado).map(Number);
        const hardware_cantidades = hardwareSeleccionado;

        const res = await guardarEquipamiento(hardwareIds, softwareSeleccionado, hardware_cantidades);
        setGuardando(false);

        if (res && !res.error) {
            notificaciones.exito("Tu setup ha sido actualizado correctamente");
            if (alFinalizar) alFinalizar();
        } else {
            notificaciones.error(res?.message || "No se pudo actualizar el setup");
        }
    };

    const obtenerImagen = (ruta) => {
        if (!ruta) return null;
        if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
        return `${URL_STORAGE}${ruta.startsWith('/') ? ruta.substring(1) : ruta}`;
    };

    if (loadingGear) return <p className="sc-loading-gear">Cargando tu equipamiento...</p>;

    // Mostrar un mensaje si los catálogos no están listos
    if (catalogoHardware.length === 0 || catalogoSoftware.length === 0) {
        return <p className="sc-loading-gear">Cargando catálogos de equipamiento...</p>;
    }

    return (
        <div className="sc-gear-manager-container">
            <h2>Configurar mi Setup</h2>
            <p className="sc-subtext">Define tu equipamiento de estudio y DJ. El hardware y software que selecciones aparecerá en tu perfil.</p>

            <div className="sc-gear-sections-stack">

                {/* ========== HARDWARE ========== */}
                <div className="sc-gear-section">
                    <div className="sc-section-header">
                        <h3>Hardware</h3>
                        <span className="sc-counter">{Object.keys(hardwareSeleccionado).length}</span>
                    </div>

                    <div className="sc-add-gear-row">
                        <select
                            value={idHardwareSelect}
                            onChange={(e) => setIdHardwareSelect(e.target.value)}
                            className="sc-select"
                        >
                            <option value="">-- Selecciona un aparato --</option>
                            {catalogoHardware.map(h => (
                                <option key={h.id} value={h.id}>{h.nombre} {h.marca ? `- ${h.marca}` : ''}</option>
                            ))}
                        </select>
                        <button type="button" onClick={agregarHardware} className="sc-add-btn">Añadir</button>
                    </div>

                    <div className="sc-items-grid hardware-grid">
                        {Object.keys(hardwareSeleccionado).length > 0 ? (
                            Object.entries(hardwareSeleccionado).map(([hIdStr, cantidad]) => {
                                const hId = parseInt(hIdStr);
                                const aparato = catalogoHardware.find(h => h.id === hId);
                                if (!aparato) return null;
                                const imgUrl = obtenerImagen(aparato.imagen);
                                return (
                                    <div key={hId} className="sc-item-card hardware">
                                        {imgUrl && (
                                            <div className="sc-item-image">
                                                <img src={imgUrl} alt={aparato.nombre} onError={(e) => e.target.style.display = 'none'} />
                                            </div>
                                        )}
                                        <div className="sc-item-info">
                                            <p className="sc-item-name">{aparato.nombre}</p>
                                            {aparato.marca && <p className="sc-item-brand">{aparato.marca}</p>}
                                        </div>
                                        <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '6px', minHeight: '32px' }}>
                                            <input
                                                type="number"
                                                min="1"
                                                max="99"
                                                value={cantidad}
                                                onChange={(e) => cambiarCantidadHardware(hId, e.target.value)}
                                                style={{ width: '40px', padding: '4px 6px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '4px', textAlign: 'center' }}
                                            />
                                            <span style={{ fontSize: '0.8rem', color: '#999' }}>unid.</span>
                                        </div>
                                        <button type="button" onClick={() => quitarHardware(hId)} className="sc-remove-btn">×</button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="sc-empty-state">No hay hardware seleccionado</div>
                        )}
                    </div>
                </div>

                {/* ========== SOFTWARE ========== */}
                <div className="sc-gear-section">
                    <div className="sc-section-header">
                        <h3>Software</h3>
                        <span className="sc-counter">{softwareSeleccionado.length}</span>
                    </div>

                    <div className="sc-add-gear-row">
                        <select
                            value={idSoftwareSelect}
                            onChange={(e) => setIdSoftwareSelect(e.target.value)}
                            className="sc-select"
                        >
                            <option value="">-- Selecciona un programa --</option>
                            {catalogoSoftware.map(s => (
                                <option key={s.id} value={s.id}>{s.nombre} {s.distribuidor ? `- ${s.distribuidor}` : ''}</option>
                            ))}
                        </select>
                        <button type="button" onClick={agregarSoftware} className="sc-add-btn">Añadir</button>
                    </div>

                    <div className="sc-items-grid software-grid">
                        {softwareSeleccionado.length > 0 ? (
                            softwareSeleccionado.map(sId => {
                                const programa = catalogoSoftware.find(s => s.id === sId);
                                if (!programa) return null;
                                const imgUrl = obtenerImagen(programa.imagen);
                                return (
                                    <div key={sId} className="sc-item-card software">
                                        {imgUrl && (
                                            <div className="sc-item-image">
                                                <img src={imgUrl} alt={programa.nombre} onError={(e) => e.target.style.display = 'none'} />
                                            </div>
                                        )}
                                        <div className="sc-item-info">
                                            <p className="sc-item-name">{programa.nombre}</p>
                                            {programa.distribuidor && <p className="sc-item-brand">{programa.distribuidor}</p>}
                                        </div>
                                        <button type="button" onClick={() => quitarSoftware(sId)} className="sc-remove-btn">×</button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="sc-empty-state">No hay software seleccionado</div>
                        )}
                    </div>
                </div>

            </div>

            <button
                type="button"
                onClick={handleGuardarSetup}
                className="sc-save-btn"
                disabled={guardando}
            >
                {guardando ? "Sincronizando..." : "Guardar Setup"}
            </button>
        </div>
    );
};

export default GestionarEquipamiento;

import React, { createContext, useState, useCallback } from 'react';

export const contextoNotificaciones = createContext();

export const ProveedorNotificaciones = ({ children }) => {
    const [notificaciones, setNotificaciones] = useState([]);

    const agregarNotificacion = useCallback((mensaje, tipo = 'info', duracion = 4000) => {
        const id = Date.now();
        setNotificaciones(prev => [...prev, { id, mensaje, tipo, duracion }]);
        setTimeout(() => {
            setNotificaciones(prev => prev.filter(notif => notif.id !== id));
        }, duracion);
        return id;
    }, []);

    const removerNotificacion = useCallback((id) => {
        setNotificaciones(prev => prev.filter(notif => notif.id !== id));
    }, []);

    const valor = {
        agregarNotificacion,
        removerNotificacion,
        exito: (msg, dur = 4000) => agregarNotificacion(msg, 'success', dur),
        error: (msg, dur = 4000) => agregarNotificacion(msg, 'error', dur),
        info: (msg, dur = 4000) => agregarNotificacion(msg, 'info', dur),
        advertencia: (msg, dur = 4000) => agregarNotificacion(msg, 'warning', dur),
        notificaciones
    };

    return (
        <contextoNotificaciones.Provider value={valor}>
            {children}
        </contextoNotificaciones.Provider>
    );
};

export default ProveedorNotificaciones;

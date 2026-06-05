/**
 * ProveedorNotificaciones.jsx - Sistema global de notificaciones (toasts)
 *
 * Proporciona un mecanismo centralizado para mostrar mensajes temporales
 * al usuario (toasts) sin necesidad de pasar callbacks entre componentes.
 *
 * Cada notificacion tiene un id unico (timestamp), un mensaje, un tipo
 * y una duracion. Al cumplirse la duracion se elimina automaticamente.
 *
 * Exporta a traves del contexto:
 *   agregarNotificacion(mensaje, tipo, duracion) - Metodo generico de adicion
 *   removerNotificacion(id)  - Cierre manual por el usuario
 *   exito(msg, dur)      - Shortcut para tipo 'success'
 *   error(msg, dur)      - Shortcut para tipo 'error'
 *   info(msg, dur)       - Shortcut para tipo 'info'
 *   advertencia(msg, dur) - Shortcut para tipo 'warning'
 *   notificaciones        - Array de notificaciones activas (para el renderizador)
 */
import React, { createContext, useState, useCallback } from 'react';

export const contextoNotificaciones = createContext();

export const ProveedorNotificaciones = ({ children }) => {
    const [notificaciones, setNotificaciones] = useState([]);

    /**
     * Agrega una notificacion y programa su eliminacion automatica.
     * Usa useCallback para que la referencia sea estable y no genere
     * re-renders innecesarios en componentes que la consuman.
     *
     * @param {string} mensaje  - Texto a mostrar
     * @param {string} tipo     - 'info' | 'success' | 'error' | 'warning'
     * @param {number} duracion - Milisegundos hasta la eliminacion automatica
     * @returns {number} id de la notificacion creada
     */
    const agregarNotificacion = useCallback((mensaje, tipo = 'info', duracion = 4000) => {
        const id = Date.now();
        setNotificaciones(prev => [...prev, { id, mensaje, tipo, duracion }]);
        setTimeout(() => {
            setNotificaciones(prev => prev.filter(notif => notif.id !== id));
        }, duracion);
        return id;
    }, []);

    /**
     * Elimina una notificacion por su id (para el boton de cierre manual).
     */
    const removerNotificacion = useCallback((id) => {
        setNotificaciones(prev => prev.filter(notif => notif.id !== id));
    }, []);

    const valor = {
        agregarNotificacion,
        removerNotificacion,
        // Shortcuts semanticos para los tipos mas comunes
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

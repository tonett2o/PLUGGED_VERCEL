import React, { useContext } from 'react';
import { contextoNotificaciones } from '../contexts/ProveedorNotificaciones.jsx';
import './ContenedorNotificaciones.css';

const ContenedorNotificaciones = () => {
    const { notificaciones, removerNotificacion } = useContext(contextoNotificaciones);

    const getIcon = (tipo) => {
        switch (tipo) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
                return 'ℹ';
            default:
                return '•';
        }
    };

    return (
        <div className="contenedor-notificaciones">
            {notificaciones.map(notif => (
                <div 
                    key={notif.id} 
                    className={`notificacion notificacion-${notif.tipo}`}
                >
                    <span className="notificacion-icon">{getIcon(notif.tipo)}</span>
                    <span className="notificacion-texto">{notif.mensaje}</span>
                    <button 
                        className="notificacion-cerrar"
                        onClick={() => removerNotificacion(notif.id)}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ContenedorNotificaciones;

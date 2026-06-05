/**
 * ProveedorAuth.jsx - Contexto de autenticacion global
 *
 * Gestiona el estado de sesion del usuario en toda la aplicacion.
 * Al montar, intenta restaurar la sesion desde localStorage (token + datos de usuario)
 * para que al refrescar la pagina el usuario siga logueado.
 *
 * Exporta a traves del contexto:
 *   usuario    - Objeto con los datos del usuario autenticado, o null si no hay sesion
 *   conectar   - Guarda token y usuario en localStorage y actualiza el estado
 *   desconectar - Limpia localStorage y resetea el estado a null
 *   autenticado - Booleano derivado de si usuario != null
 *   cargando   - Indica que la sesion se esta restaurando (evita flashes de UI)
 *
 * Hook de conveniencia:
 *   useAuth()  - Shortcut para useContext(AuthContext) desde cualquier componente hijo
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const ProveedorAuth = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    // Mientras se restaura la sesion, no se renderizan los hijos
    // para evitar un parpadeo entre el estado "no autenticado" y el "autenticado"
    const [cargando, setCargando] = useState(true);

    /**
     * Al montar el proveedor, comprueba si existen credenciales guardadas.
     * Si el JSON del usuario esta corrupto, limpia el almacenamiento.
     */
    useEffect(() => {
        const usuarioGuardado = localStorage.getItem('usuario');
        const tokenGuardado = localStorage.getItem('token');

        if (usuarioGuardado && tokenGuardado) {
            try {
                setUsuario(JSON.parse(usuarioGuardado));
            } catch (e) {
                // JSON invalido: limpiar para evitar estado inconsistente
                localStorage.clear();
            }
        }
        setCargando(false);
    }, []);

    /**
     * Persiste la sesion tras un login o registro exitoso.
     * Acepta la respuesta de la API (acceso_token + user/usuario).
     */
    const conectar = (data) => {
        const datosUser = data.user || data.usuario;
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('usuario', JSON.stringify(datosUser));
        setUsuario(datosUser);
    };

    /**
     * Cierra la sesion: borra todo el localStorage y resetea el estado.
     * El ProveedorUsuario reaccionara a este cambio y recargara la lista.
     */
    const desconectar = () => {
        localStorage.clear();
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{
            usuario,
            conectar,
            desconectar,
            autenticado: !!usuario,
            cargando
        }}>
            {/* No renderizar hijos hasta que la restauracion de sesion termine */}
            {!cargando && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default ProveedorAuth;

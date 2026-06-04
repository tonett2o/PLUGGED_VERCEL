import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const ProveedorAuth = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem('usuario');
        const tokenGuardado = localStorage.getItem('token');

        if (usuarioGuardado && tokenGuardado) {
            try {
                setUsuario(JSON.parse(usuarioGuardado));
            } catch (e) {
                localStorage.clear();
            }
        }
        setCargando(false);
    }, []);

    const conectar = (data) => {
        const datosUser = data.user || data.usuario;
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('usuario', JSON.stringify(datosUser));
        setUsuario(datosUser); 
        // Al actualizar este estado, el ProveedorUsuario (que es hijo) se enterará
    };

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
            {!cargando && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default ProveedorAuth;
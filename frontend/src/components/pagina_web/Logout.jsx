import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/ProveedorAuth.jsx';
import { contextoMusica } from '../../contexts/ProveedorMusica.jsx';
import useApiLogout from '../../hooks/Auth/useApiLogout.js';

export const Logout = () => {
    const { desconectar } = useAuth();
    const { limpiarMusica } = useContext(contextoMusica);
    const navigate = useNavigate();

    useEffect(() => {
        const cerrarSesion = async () => {
            await useApiLogout(); // Avisa a Laravel (Axios pone el token solo)
            limpiarMusica();      // Limpia el reproductor
            desconectar();        // Limpia React y LocalStorage
            navigate('/login');   // Te echa al login
        };

        cerrarSesion();
    }, [desconectar, navigate, limpiarMusica]);

    return <p>Cerrando sesión...</p>;
};
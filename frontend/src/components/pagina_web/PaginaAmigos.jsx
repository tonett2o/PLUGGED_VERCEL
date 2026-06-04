import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/ProveedorAuth';
import AmigosUsuario from '../detalles/AmigosUsuario';

const PaginaAmigos = () => {
    const { usuarioId } = useParams();
    const { usuario: usuarioAutenticado } = useAuth();
    const navigate = useNavigate();
    const [datosUsuario, setDatosUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        console.log('PaginaAmigos: usuarioId =', usuarioId, 'usuarioAutenticado =', usuarioAutenticado?.id);

        // Si el usuarioId coincide con el usuario autenticado, usamos esos datos
        if (usuarioAutenticado && String(usuarioAutenticado.id) === usuarioId) {
            console.log('PaginaAmigos: User authenticated, using context data');
            setDatosUsuario(usuarioAutenticado);
            setCargando(false);
        } else {
            console.log('PaginaAmigos: Fetching user data for userId:', usuarioId);
            // Si no, intentamos obtener los datos del usuario
            const obtenerDatosUsuario = async () => {
                try {
                    const response = await fetch(`http://localhost:8000/api/usuarios/${usuarioId}`);
                    console.log('PaginaAmigos: Fetch response status:', response.status);
                    if (response.ok) {
                        const datos = await response.json();
                        console.log('PaginaAmigos: Datos recibidos:', datos);
                        setDatosUsuario(datos);
                    } else {
                        console.error('PaginaAmigos: Response not ok, redirecting');
                        navigate('/');
                    }
                } catch (error) {
                    console.error('PaginaAmigos: Error fetching datos del usuario:', error);
                    navigate('/');
                } finally {
                    setCargando(false);
                }
            };
            obtenerDatosUsuario();
        }
    }, [usuarioId]);

    if (cargando) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: '#0ADAF5' }}>Cargando...</div>;
    }

    if (!datosUsuario) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Usuario no encontrado</div>;
    }

    return <AmigosUsuario datosUsuario={datosUsuario} />;
};

export default PaginaAmigos;

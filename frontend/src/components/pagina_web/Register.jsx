import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/ProveedorAuth.jsx';
import useApiRegister from '../../hooks/Auth/useApiRegister.js';
import './Register.css';

export const Register = () => {
    const { conectar } = useAuth();
    const navigate = useNavigate();
    
    // 1. Ampliamos estados para biografía, rol y archivos
    const [datos, setDatos] = useState({
        nick: '',
        nombre: '',
        email: '',
        password: '',
        password_confirmation: '',
        ubicacion: '',
        biografia: '',
        rol: 'usuario'
    });
    
    const [archivos, setArchivos] = useState({ banner: null, avatar: null });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setDatos({ ...datos, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setArchivos({ ...archivos, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (datos.password !== datos.password_confirmation) {
            setError("Las contraseñas no coinciden");
            return;
        }

        // 2. Usamos FormData para enviar texto + archivos
        const formData = new FormData();
        Object.keys(datos).forEach(key => formData.append(key, datos[key]));
        if (archivos.banner) formData.append('banner', archivos.banner);
        if (archivos.avatar) formData.append('avatar', archivos.avatar);

        // 🚨 IMPORTANTE: Asegúrate de que useApiRegister acepte FormData
        const respuesta = await useApiRegister(formData);

        if (respuesta && respuesta.usuario) {
            conectar(respuesta);
            navigate('/');
        } else {
            setError("Error en el registro. Revisa los datos.");
        }
    };

    return (
        <div className="auth-container">
            <h2>Crear Cuenta</h2>
            {error && <div className="error-msg">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <input type="text" name="nick" placeholder="Nick" onChange={handleChange} required />
                <input type="text" name="nombre" placeholder="Nombre real" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="text" name="ubicacion" placeholder="Ubicación" onChange={handleChange} />
                <textarea name="biografia" placeholder="Biografía" onChange={handleChange} />
                
                <select name="rol" onChange={handleChange}>
                    <option value="usuario">Usuario</option>
                    <option value="dj">DJ</option>
                    <option value="productor">Productor</option>
                </select>

                <label>Avatar:</label>
                <input type="file" name="avatar" onChange={handleFileChange} />
                
                <label>Banner:</label>
                <input type="file" name="banner" onChange={handleFileChange} />

                <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} required />
                <input type="password" name="password_confirmation" placeholder="Repite contraseña" onChange={handleChange} required />
                
                <button type="submit">Registrarse</button>
            </form>
        </div>
    );
};
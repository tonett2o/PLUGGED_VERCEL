import React, { createContext, useState, useEffect, useCallback } from "react";
import useApiGetAll_Usuarios from "../hooks/Usuario/useApiGetAll.js";
// 🚨 IMPORTAMOS TU HOOK PERSONALIZADO
import useApiPut_Usuario from "../hooks/Usuario/useApiPut.js";
import { useAuth } from "./ProveedorAuth"; // Importamos el hook del padre

const contextoUsuario = createContext();

const ProveedorUsuario = ({ children }) => {
    const [usuarios, setUsuarios] = useState([]);
    const { usuario } = useAuth(); // Escuchamos al padre

    const iniciarUsuarios = useCallback(async () => {
        try {
            const data = await useApiGetAll_Usuarios();
            const lista = data?.usuarios || data || [];
            setUsuarios(lista);
        } catch (error) {
        }
    }, []);

    // Dentro de ProveedorUsuario.jsx
    const actualizarPerfilUsuario = async (idUsuario, datosFormulario) => {
        const token = localStorage.getItem('token');

        if (!token) return { error: true, message: "No hay sesión activa" };

        try {
            // 🛠️ Le pasamos directamente el objeto plano 'datosFormulario'
            const respuesta = await useApiPut_Usuario(idUsuario, datosFormulario, token);

            if (respuesta && !respuesta.error) {
                // Actualizar localStorage con TODOS los datos del usuario devueltos por la API
                // La respuesta contiene el usuario actualizado completo desde el servidor
                const usuarioActualizado = respuesta.usuario || respuesta.user || respuesta;

                if (usuarioActualizado && typeof usuarioActualizado === 'object') {
                    localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
                }

                await iniciarUsuarios(); // Refrescamos el contexto global
            }

            return respuesta;

        } catch (error) {
            console.error("Error en actualizarPerfilUsuario:", error);
            return { error: true, message: "Error crítico al actualizar el perfil" };
        }
    };

    // SINCRONIZACIÓN AUTOMÁTICA:
    // Cada vez que el usuario de AuthContext cambie (login/registro/logout),
    // este proveedor refrescará la lista completa de la API.
    useEffect(() => {
        iniciarUsuarios();
    }, [usuario, iniciarUsuarios]);

    const buscarUsuario = (idEntrada) => {
        return usuarios.find(u => u.id == idEntrada);
    }

    const exportacion = {
        usuarios,
        iniciarUsuarios,
        buscarUsuario,
        actualizarPerfilUsuario // 🚨 AÑADIMOS LA FUNCIÓN AQUÍ PARA QUE LOS COMPONENTES LA PUEDAN USAR
    }

    return (
        <contextoUsuario.Provider value={exportacion}>
            {children}
        </contextoUsuario.Provider>
    );
}

export default ProveedorUsuario;
export { contextoUsuario };
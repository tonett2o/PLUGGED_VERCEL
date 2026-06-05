/**
 * ProveedorUsuario.jsx - Contexto global de usuarios
 *
 * Mantiene la lista completa de usuarios cargada desde la API y expone
 * metodos para consultarla y actualizarla.
 *
 * Sincronizacion automatica con ProveedorAuth:
 *   Cada vez que el usuario autenticado cambia (login, logout, registro),
 *   este proveedor relanza la carga de usuarios desde el backend para
 *   que la lista siempre refleje el estado real de la base de datos.
 *
 * Exporta a traves del contexto:
 *   usuarios                - Array de todos los usuarios de la plataforma
 *   iniciarUsuarios()       - Recarga la lista desde el backend
 *   buscarUsuario(id)       - Busqueda local por id (sin peticion adicional)
 *   actualizarPerfilUsuario - Envia los cambios de perfil al backend y refresca
 */
import React, { createContext, useState, useEffect, useCallback } from "react";
import useApiGetAll_Usuarios from "../hooks/Usuario/useApiGetAll.js";
import useApiPut_Usuario from "../hooks/Usuario/useApiPut.js";
import { useAuth } from "./ProveedorAuth";

const contextoUsuario = createContext();

const ProveedorUsuario = ({ children }) => {
    const [usuarios, setUsuarios] = useState([]);
    // Escuchamos el estado de autenticacion para disparar recargas
    const { usuario } = useAuth();

    /**
     * Carga todos los usuarios desde la API y actualiza el estado.
     * Envuelto en useCallback para que la referencia sea estable y pueda
     * usarse como dependencia de useEffect sin bucles infinitos.
     */
    const iniciarUsuarios = useCallback(async () => {
        try {
            const data = await useApiGetAll_Usuarios();
            const lista = data?.usuarios || data || [];
            setUsuarios(lista);
        } catch (error) {
            // Error silencioso: la lista queda vacia pero no rompe la app
        }
    }, []);

    /**
     * Envia los datos del formulario de edicion de perfil al backend.
     * Si la respuesta es exitosa, actualiza localStorage con los nuevos
     * datos del usuario y recarga la lista global de usuarios.
     *
     * @param {number} idUsuario     - ID del usuario a actualizar
     * @param {FormData|object} datosFormulario - Datos del perfil a guardar
     * @returns {object} Respuesta de la API con { error, mensaje } o detalle de error
     */
    const actualizarPerfilUsuario = async (idUsuario, datosFormulario) => {
        const token = localStorage.getItem('token');

        if (!token) return { error: true, message: "No hay sesion activa" };

        try {
            const respuesta = await useApiPut_Usuario(idUsuario, datosFormulario, token);

            if (respuesta && !respuesta.error) {
                // Sincronizar localStorage con los datos frescos del servidor
                const usuarioActualizado = respuesta.usuario || respuesta.user || respuesta;

                if (usuarioActualizado && typeof usuarioActualizado === 'object') {
                    localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
                }

                // Refrescar el contexto global para que todos los componentes
                // vean los datos actualizados sin recargar la pagina
                await iniciarUsuarios();
            }

            return respuesta;

        } catch (error) {
            console.error("Error en actualizarPerfilUsuario:", error);
            return { error: true, message: "Error critico al actualizar el perfil" };
        }
    };

    /**
     * Cada vez que cambia el usuario autenticado (login / logout / registro),
     * se recarga la lista completa desde el backend para mantenerla actualizada.
     */
    useEffect(() => {
        iniciarUsuarios();
    }, [usuario, iniciarUsuarios]);

    /**
     * Busca un usuario en el array local por su id.
     * Util para obtener datos basicos sin hacer una peticion adicional al backend.
     *
     * @param {number|string} idEntrada - ID del usuario a buscar
     * @returns {object|undefined} Objeto usuario o undefined si no existe
     */
    const buscarUsuario = (idEntrada) => {
        return usuarios.find(u => u.id == idEntrada);
    }

    const exportacion = {
        usuarios,
        iniciarUsuarios,
        buscarUsuario,
        actualizarPerfilUsuario
    }

    return (
        <contextoUsuario.Provider value={exportacion}>
            {children}
        </contextoUsuario.Provider>
    );
}

export default ProveedorUsuario;
export { contextoUsuario };

import React, { createContext, useState, useEffect } from "react";

import useApiGetAll_Eventos from "../hooks/Evento/useApiGetAll.js";
import useApiPost_Evento from "../hooks/Evento/useApiPost.js";
// 🚨 1. IMPORTAMOS EL NUEVO HOOK DE EDICIÓN
import useApiPut_Evento from "../hooks/Evento/useApiPut.js";
import useApiDelete_Evento from "../hooks/Evento/useApiDelete.js";

const contextoEvento = createContext();

const ProveedorEventos = (props) => {
    const [listaEventos, setListaEventos] = useState([]);
    const [loadingEventos, setLoadingEventos] = useState(false);

    // --- MÉTODOS: CARGAR TODOS LOS EVENTOS ---
    const cargarTodosLosEventos = async () => {
        setLoadingEventos(true);
        try {
            const datos = await useApiGetAll_Eventos();
            if (datos) setListaEventos([...datos]);
        } catch (error) {
            console.error("Error al cargar el catálogo de eventos:", error);
        } finally {
            setLoadingEventos(false);
        }
    };

    // --- MÉTODO: CREAR ---
    const guardarNuevoEvento = async (objetoEvento) => {
        const token = localStorage.getItem('token');
        if (!token) return { error: true, message: "No estás autenticado" };

        try {
            const res = await useApiPost_Evento(objetoEvento, token);

            if (res && !res.error) {
                // Refrescamos la lista para traer el evento nuevo con su ID real
                await cargarTodosLosEventos();
                return { error: false, mensaje: res.mensaje || "¡Evento publicado con éxito!" };
            }
            return {
                error: true,
                message: res?.message || "No se pudo procesar la subida.",
                detalles: res?.detalles || {}
            };
        } catch (error) {
            console.error("Error en guardarNuevoEvento:", error);
            return { error: true, message: "Error interno en el cliente." };
        }
    };

    // 🚨 2. NUEVO MÉTODO: ACTUALIZAR EVENTO
    const actualizarEvento = async (idEvento, datosFormulario) => {
        const token = localStorage.getItem('token');
        if (!token) return { error: true, message: "No hay sesión activa" };

        try {
            const respuesta = await useApiPut_Evento(idEvento, datosFormulario, token);

            if (respuesta && !respuesta.error) {
                console.log("Evento actualizado correctamente");
                await cargarTodosLosEventos(); // 🔄 Refrescamos la lista global
            }
            return respuesta;
        } catch (error) {
            console.error("Error en actualizarEvento del proveedor:", error);
            return { error: true, message: "Error crítico al actualizar el evento", detalles: {} };
        }
    };

    // 🚨 3. NUEVO MÉTODO: ELIMINAR EVENTO
    const eliminarEvento = async (idEvento) => {
        const token = localStorage.getItem('token');
        if (!token) return { error: true, message: "No hay sesión activa" };

        try {
            const respuesta = await useApiDelete_Evento(idEvento, token);

            if (respuesta && !respuesta.error) {
                console.log("Evento eliminado correctamente");
                await cargarTodosLosEventos(); // 🔄 Refrescamos la lista global para actualizar mapa
            }
            return respuesta;
        } catch (error) {
            console.error("Error en eliminarEvento del proveedor:", error);
            return { error: true, message: "Error crítico al eliminar el evento", detalles: {} };
        }
    };

    useEffect(() => {
        cargarTodosLosEventos();
    }, []);

    // 🚨 4. EXPORTAMOS TODAS LAS FUNCIONES
    const exportacion = {
        listaEventos,
        loadingEventos,
        cargarTodosLosEventos,
        guardarNuevoEvento,
        actualizarEvento,
        eliminarEvento
    };

    return (
        <contextoEvento.Provider value={exportacion}>
            {props.children}
        </contextoEvento.Provider>
    );
};

export default ProveedorEventos;
export { contextoEvento };
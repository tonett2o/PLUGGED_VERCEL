/**
 * ProveedorEquipamiento.jsx - Contexto global de hardware y software
 *
 * Gestiona dos tipos de datos:
 *   1. Catalogos globales: listas completas de todo el hardware y software
 *      disponibles en la plataforma (para los modales de seleccion).
 *   2. Equipamiento del usuario: los items que tiene asociados el usuario
 *      cuyo perfil se esta visualizando en ese momento.
 *
 * La separacion entre catalogo y setup de usuario permite que:
 *   - El catalogo se cargue una sola vez al montar el proveedor.
 *   - El equipamiento por usuario se cargue bajo demanda desde DetallesUsuario.
 *
 * Exporta a traves del contexto:
 *   catalogoHardware           - Array de todo el hardware registrado
 *   catalogoSoftware           - Array de todo el software registrado
 *   misHardwares               - Hardware del usuario actualmente visualizado
 *   misSoftwares               - Software del usuario actualmente visualizado
 *   loadingGear                - Indica que se esta cargando el equipamiento
 *   cargarEquipamientoUsuario(id) - Carga el setup de un usuario concreto
 *   guardarEquipamiento(...)   - Sincroniza el setup completo con el backend
 *   eliminarEquipamientoPorId  - Desvincula un item del usuario en tiempo real
 */
import React, { createContext, useState, useEffect } from "react";
import API_URL from '../config/api.js';

import useApiGetAll_Hardware from "../hooks/Hardware/useApiGetAll.js";
import useApiGet_Hardware from "../hooks/Hardware/useApiGet.js";
import useApiGetMy_Hardware from "../hooks/Hardware/useApiGetMy.js";
import useApiDelete_Hardware from "../hooks/Hardware/useApiDelete.js";

import useApiGetAll_Software from "../hooks/Software/useApiGetAll.js";
import useApiGet_Software from "../hooks/Software/useApiGet.js";
import useApiGetMy_Software from "../hooks/Software/useApiGetMy.js";
import useApiDelete_Software from "../hooks/Software/useApiDelete.js";

const contextoEquipamiento = createContext();

const ProveedorEquipamiento = (props) => {
    const [catalogoHardware, setCatalogoHardware] = useState([]);
    const [catalogoSoftware, setCatalogoSoftware] = useState([]);
    // Setup del usuario visualizado actualmente
    const [misHardwares, setMisHardwares] = useState([]);
    const [misSoftwares, setMisSoftwares] = useState([]);
    const [loadingGear, setLoadingGear] = useState(false);

    /**
     * Carga los catalogos completos de hardware y software.
     * Se ejecuta una sola vez al montar el proveedor.
     */
    const iniciarCatalogosGlobales = async () => {
        try {
            const datosH = await useApiGetAll_Hardware();
            if (datosH) setCatalogoHardware([...datosH]);

            const datosS = await useApiGetAll_Software();
            if (datosS) setCatalogoSoftware([...datosS]);
        } catch (error) {
            console.error("Error al iniciar catalogos globales:", error);
        }
    };

    /**
     * Carga el equipamiento de un usuario especifico por su ID.
     * Se llama desde DetallesUsuario cuando se visualiza un perfil.
     *
     * @param {number} usuarioId - ID del usuario cuyo setup se quiere cargar
     */
    const cargarEquipamientoUsuario = async (usuarioId) => {
        if (!usuarioId) return;

        setLoadingGear(true);
        try {
            const respuestaHW = await useApiGetMy_Hardware(usuarioId);
            const respuestaSW = await useApiGetMy_Software(usuarioId);

            if (respuestaHW && Array.isArray(respuestaHW)) setMisHardwares([...respuestaHW]);
            if (respuestaSW && Array.isArray(respuestaSW)) setMisSoftwares([...respuestaSW]);
        } catch (error) {
            console.error("Error al cargar equipamiento del usuario:", error);
        } finally {
            setLoadingGear(false);
        }
    };

    /**
     * Sincroniza el equipamiento completo del usuario con el backend.
     * Recibe la lista definitiva de IDs que el usuario quiere tener asociados
     * (ya incluye los existentes mas los nuevos que haya agregado en el modal).
     * El backend reemplaza la asociacion completa, no hace merge parcial.
     *
     * @param {number[]} hardwareIdsDelModal  - IDs de hardware seleccionados
     * @param {number[]} softwareIdsDelModal  - IDs de software seleccionados
     * @param {object}   hardware_cantidades  - Mapa id -> cantidad para hardware
     * @returns {object} Resultado con { error, mensaje }
     */
    const guardarEquipamiento = async (hardwareIdsDelModal, softwareIdsDelModal, hardware_cantidades = {}) => {
        const token = localStorage.getItem('token');
        if (!token) return { error: true, message: "No estas autenticado" };

        try {
            const peticion = await fetch(`${API_URL}/api/usuarios/equipamiento`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    hardware_ids: hardwareIdsDelModal,
                    software_ids: softwareIdsDelModal,
                    hardware_cantidades: hardware_cantidades
                })
            });

            const datos = await peticion.json();

            if (peticion.ok && !datos.error) {
                // Actualizar el estado local con la respuesta fresca del servidor
                setMisHardwares(datos.hardwares || []);
                setMisSoftwares(datos.softwares || []);

                return { error: false, mensaje: datos.mensaje };
            }

            return { error: true, message: datos.mensaje || "Error al sincronizar." };

        } catch (error) {
            console.error("Error en guardarEquipamiento:", error);
            return { error: true, message: "Error interno en el cliente." };
        }
    };

    /**
     * Desvincula un item de equipamiento del usuario autenticado.
     * Actualiza el estado local de forma optimista eliminando el item
     * una vez que el backend confirma el borrado.
     *
     * @param {'hardware'|'software'} tipo - Tipo de equipamiento a eliminar
     * @param {number} idElemento          - ID del item a desvincular
     * @returns {object} Resultado con { error }
     */
    const eliminarEquipamientoPorId = async (tipo, idElemento) => {
        const token = localStorage.getItem('token');
        if (!token) return { error: true, message: "No estas autenticado" };

        try {
            if (tipo === 'hardware') {
                const res = await useApiDelete_Hardware(idElemento, token);
                if (res && !res.error) {
                    setMisHardwares(prev => prev.filter(hw => hw.id !== idElemento));
                    return { error: false };
                }
            } else if (tipo === 'software') {
                const res = await useApiDelete_Software(idElemento, token);
                if (res && !res.error) {
                    setMisSoftwares(prev => prev.filter(sw => sw.id !== idElemento));
                    return { error: false };
                }
            }
            return { error: true, message: "No se pudo desvincular el componente." };
        } catch (error) {
            console.error("Error al ejecutar delete desde el hook:", error);
            return { error: true, message: "Error interno del servidor." };
        }
    };

    // Carga los catalogos globales al montar el proveedor.
    // cargarEquipamientoUsuario se llama desde DetallesUsuario cuando tiene el ID.
    useEffect(() => {
        iniciarCatalogosGlobales();
    }, []);

    const exportacion = {
        catalogoHardware,
        catalogoSoftware,
        misHardwares,
        misSoftwares,
        loadingGear,
        cargarEquipamientoUsuario,
        guardarEquipamiento,
        eliminarEquipamientoPorId
    };

    return (
        <contextoEquipamiento.Provider value={exportacion}>
            {props.children}
        </contextoEquipamiento.Provider>
    );
};

export default ProveedorEquipamiento;
export { contextoEquipamiento };

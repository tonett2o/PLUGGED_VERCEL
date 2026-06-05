import React, { createContext, useState, useEffect } from "react";
import API_URL from '../config/api.js';

// Hooks de Carga y Borrado Atómico (Estos sí acoplan perfectamente con tu patrón)
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
    // --- ESTADOS GLOBALES DE EQUIPAMIENTO ---
    const [catalogoHardware, setCatalogoHardware] = useState([]);
    const [catalogoSoftware, setCatalogoSoftware] = useState([]);
    const [misHardwares, setMisHardwares] = useState([]);
    const [misSoftwares, setMisSoftwares] = useState([]);
    const [loadingGear, setLoadingGear] = useState(false);

    // --- MÉTODOS: CARGA DE CATÁLOGOS GLOBALES (GET ALL) ---
    const iniciarCatalogosGlobales = async () => {
        try {
            const datosH = await useApiGetAll_Hardware();
            if (datosH) setCatalogoHardware([...datosH]);

            const datosS = await useApiGetAll_Software();
            if (datosS) setCatalogoSoftware([...datosS]);
        } catch (error) {
            console.error("Error al iniciar catálogos globales:", error);
        }
    };

    // --- MÉTODOS: CARGA DEL SETUP DEL USUARIO PERFIL (GET) ---
    const cargarEquipamientoUsuario = async (usuarioId) => {
        if (!usuarioId) return;

        setLoadingGear(true);
        try {
            // Consumimos hooks que traen el equipamiento del usuario especificado por ID
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

    // ==========================================
    // 🛠️ FUNCIÓN: Guardar Setup - Recibe lista COMPLETA del modal y guarda tal cual
    // ==========================================
    const guardarEquipamiento = async (hardwareIdsDelModal, softwareIdsDelModal, hardware_cantidades = {}) => {
        const token = localStorage.getItem('token');
        if (!token) return { error: true, message: "No estás autenticado" };

        try {
            // 🎯 SIMPLE: Los IDs que vienen del modal son TODOS los que el usuario quiere tener
            // (ya contienen los viejos + los nuevos que agregó)
            // NO necesitamos hacer merge aquí, el modal ya tiene la lista completa

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
                // Actualizamos los estados globales con la respuesta fresca de Laravel
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

    // --- MÉTODOS: ELIMINACIÓN ATÓMICA EN HOVER (DELETE) ---
    const eliminarEquipamientoPorId = async (tipo, idElemento) => {
        const token = localStorage.getItem('token');
        if (!token) return { error: true, message: "No estás autenticado" };

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

    // --- DISPARADOR DE CARGA INICIAL ---
    useEffect(() => {
        iniciarCatalogosGlobales();
        // cargarEquipamientoUsuario se llamará desde DetallesUsuario cuando tenga el ID del usuario
    }, []);

    // --- EXPORTACIÓN SIMÉTRICA DEL CONTEXTO ---
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
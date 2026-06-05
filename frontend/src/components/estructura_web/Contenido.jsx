/**
 * Contenido.jsx - Envoltorio semantico del area principal de la pagina
 *
 * Envuelve el componente Rutas dentro de un elemento <main> para
 * mantener la semantica HTML correcta. Actua como puente entre
 * la estructura de App y el sistema de rutas.
 */
import {React} from "react";
import Rutas from "./Rutas.jsx"

export const Contenido = () => {
    return (
        <>
            <main>
                <Rutas />
            </main>
        </>
    )
}

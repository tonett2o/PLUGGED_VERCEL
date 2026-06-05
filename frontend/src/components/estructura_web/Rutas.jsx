/**
 * Rutas.jsx - Tabla de rutas del cliente (SPA)
 *
 * Define el mapeo entre URL y componente de pagina usando React Router.
 * Todas las rutas son accesibles sin autenticacion previa; la proteccion
 * de acceso a contenido privado se gestiona dentro de cada componente.
 *
 * Rutas disponibles:
 *   /                          - Pagina de inicio con carruseles y estadisticas
 *   /explorar                  - Rankings de artistas, albumes y equipamiento
 *   /eventos                   - Mapa y listado de eventos musicales
 *   /amigos/:usuarioId         - Lista de amigos de un usuario concreto
 *   /mostrar/:tipo/:identificador - Vista de detalle dinamica (cancion, usuario, evento, etc.)
 *   /iniciar-sesion o /login   - Formulario de inicio de sesion
 *   /registro                  - Formulario de creacion de cuenta
 *   /logout                    - Accion de cierre de sesion y redireccion
 */
import { React } from 'react';
import { Routes, Route } from "react-router-dom"
import { Inicio } from '../pagina_web/Inicio.jsx';
import Mostrar from '../pagina_web/Mostrar.jsx';
import ExplorarEventos from '../pagina_web/ExplorarEventos.jsx';
import Explorar from '../pagina_web/Explorar.jsx';
import { Login } from '../pagina_web/Login.jsx';
import Registro from '../Registro.jsx';
import { Logout } from '../pagina_web/Logout.jsx';
import PaginaAmigos from '../pagina_web/PaginaAmigos.jsx';

const Rutas = () => {
    return (
        <>
            <Routes>
                <Route path='/' element={<Inicio />} />
                <Route path="/explorar" element={<Explorar />} />
                <Route path="/eventos" element={<ExplorarEventos />} />
                <Route path="/amigos/:usuarioId" element={<PaginaAmigos />} />
                {/* Ruta dinamica: tipo puede ser cancion, usuario, evento, coleccion, etc. */}
                <Route path="/mostrar/:tipo/:identificador" element={<Mostrar />} />
                {/* Dos rutas apuntan al mismo componente de login */}
                <Route path="/iniciar-sesion" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/logout" element={<Logout />} />
            </Routes>
        </>
    )
}

export default Rutas;

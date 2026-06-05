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
                <Route path="/mostrar/:tipo/:identificador" element={<Mostrar />} />
                <Route path="/iniciar-sesion" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/logout" element={<Logout />} />
            </Routes>
        </>
    )
}

export default Rutas;
/**
 * App.jsx - Componente raiz de la aplicacion
 *
 * Define la jerarquia de proveedores de contexto y la estructura global:
 *
 *  ProveedorNotificaciones   - Sistema de toasts y alertas globales
 *    ContenedorNotificaciones - Renderiza los toasts en pantalla
 *    ProveedorAuth            - Gestion de sesion y token JWT
 *      ProveedorUsuario       - Lista y actualizacion de usuarios
 *        NavBar               - Barra de navegacion superior (siempre visible)
 *        ProveedorMusica      - Canciones, colecciones, playlists y reproductor
 *          AppContent         - Contenido de ruta + reproductor (condicional)
 *          Footer             - Pie de pagina
 *
 * AppContent esta separado de App para poder consumir useAuth y decidir si
 * mostrar el reproductor (solo cuando hay usuario autenticado).
 * ProveedorEquipamiento y ProveedorEvento se anidan dentro de AppContent
 * para no cargar datos de equipamiento/eventos antes de que el usuario exista.
 */
import { useState, useContext } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

import { Header } from './components/estructura_web/Header.jsx'
import { NavBar } from './components/estructura_web/NavBar.jsx'
import { Footer } from './components/estructura_web/Footer.jsx'
import { Contenido } from './components/estructura_web/Contenido.jsx'

import Reproductor from './components/Reproductor.jsx'
import ContenedorNotificaciones from './components/ContenedorNotificaciones.jsx'
import ProveedorAuth, { useAuth } from './contexts/ProveedorAuth.jsx';
import ProveedorUsuario from './contexts/ProveedorUsuario.jsx';
import ProveedorMusica from './contexts/ProveedorMusica.jsx';
import ProveedorEquipamiento from './contexts/ProveedorEquipamiento.jsx';
import ProveedorEvento from './contexts/ProveedorEvento.jsx';
import ProveedorNotificaciones from './contexts/ProveedorNotificaciones.jsx';

import './App.css'

import { BrowserRouter } from 'react-router-dom'

/**
 * AppContent - Subcomponente que consume el contexto de autenticacion
 *
 * Separado de App porque necesita acceder a useAuth, que solo funciona
 * dentro de ProveedorAuth. Envuelve ProveedorEquipamiento y ProveedorEvento
 * para que sus cargas ocurran solo cuando la sesion ya esta resuelta.
 */
function AppContent() {
  const { usuario } = useAuth();
  const [count, setCount] = useState(0)

  return (
    <ProveedorEquipamiento>
      <ProveedorEvento>
        {/* Renderiza la pagina activa segun la ruta */}
        <Contenido />
        {/* El reproductor solo aparece si hay sesion iniciada */}
        {usuario && <Reproductor />}
      </ProveedorEvento>
    </ProveedorEquipamiento>
  )
}

function App() {
  return (
    <BrowserRouter>
      <>
        <ProveedorNotificaciones>
          {/* Renderiza los toasts sobre todo el contenido */}
          <ContenedorNotificaciones />
          <ProveedorAuth>
            <ProveedorUsuario>
              {/* NavBar siempre visible independientemente de la ruta */}
              <NavBar />
              <ProveedorMusica>
                <AppContent />
                <Footer />
              </ProveedorMusica>
            </ProveedorUsuario>
          </ProveedorAuth>
        </ProveedorNotificaciones>
      </>
    </BrowserRouter>
  )
}

export default App

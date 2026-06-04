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

// Componente interno que puede usar el contexto de Auth
function AppContent() {
  const { usuario } = useAuth();
  const [count, setCount] = useState(0)

  return (
    <ProveedorEquipamiento>
      <ProveedorEvento>
        <Contenido />
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
          <ContenedorNotificaciones />
          <ProveedorAuth>
            <ProveedorUsuario>
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

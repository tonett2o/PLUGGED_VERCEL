/**
 * main.jsx - Punto de entrada de la aplicacion
 *
 * Monta el componente raiz App dentro de StrictMode, que activa comprobaciones
 * adicionales de React en desarrollo (doble renderizado, warnings de API obsoleta).
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

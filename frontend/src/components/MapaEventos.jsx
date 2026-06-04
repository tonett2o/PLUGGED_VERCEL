import React, { useState, useEffect } from 'react';
import './MapaEventos.css';

const MapaEventos = ({ latitud, longitud, ubicacion, onUbicacionChange, nombreSala, theme = 'dark' }) => {
  // Convertir ubicacion a string si viene como objeto
  const obtenerUbicacionTexto = (ub) => {
    if (!ub) return '';
    if (typeof ub === 'object') {
      return ub.direccion || ub.direction || '';
    }
    return String(ub);
  };

  const [busqueda, setBusqueda] = useState(obtenerUbicacionTexto(ubicacion));
  const [lat, setLat] = useState(latitud || 40.4168);
  const [lng, setLng] = useState(longitud || -3.7038);
  const [buscando, setBuscando] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);

  // Sincronizar coordenadas cuando cambian las props (edición de evento)
  useEffect(() => {
    if (latitud) setLat(parseFloat(latitud));
    if (longitud) setLng(parseFloat(longitud));
    if (ubicacion) setBusqueda(obtenerUbicacionTexto(ubicacion));
  }, [latitud, longitud, ubicacion]);

  // Búsqueda de ubicación por texto (Nominatim API)
  const buscarUbicacion = async (texto) => {
    if (!texto || texto.length < 3) {
      setSugerencias([]);
      return;
    }

    setBuscando(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(texto)}&limit=5`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const datos = await response.json();
      setSugerencias(datos);
    } catch (error) {
      console.error('Error buscando ubicación:', error);
      setSugerencias([]);
    } finally {
      setBuscando(false);
    }
  };

  // Debounce para búsqueda
  useEffect(() => {
    const timeout = setTimeout(() => {
      buscarUbicacion(busqueda);
    }, 500);
    return () => clearTimeout(timeout);
  }, [busqueda]);

  const seleccionarSugerencia = (sugerencia) => {
    const newLat = parseFloat(sugerencia.lat);
    const newLng = parseFloat(sugerencia.lon);
    const newUbicacion = sugerencia.display_name || busqueda;

    setBusqueda(newUbicacion);
    setLat(newLat);
    setLng(newLng);
    setSugerencias([]);
    onUbicacionChange(newLat, newLng, newUbicacion);
  };

  return (
    <div className={`mapa-eventos-container ${theme === 'light' ? 'mapa-light' : 'mapa-dark'}`}>
      <div className="mapa-header">
        <h3>📍 Ubicación</h3>
        <p className="mapa-subtitle">Busca o selecciona tu ubicación</p>
      </div>

      {/* Búsqueda de ubicación */}
      <div className="mapa-search">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Ej: Madrid, Sala Clamores, Plaza Mayor..."
          className="mapa-search-input"
        />
        {buscando && <span className="mapa-loading">Buscando...</span>}
      </div>

      {/* Sugerencias */}
      {sugerencias.length > 0 && (
        <div className="mapa-sugerencias">
          {sugerencias.map((sug, idx) => (
            <button
              key={idx}
              className="mapa-sugerencia"
              onClick={() => seleccionarSugerencia(sug)}
            >
              <span className="sug-nombre">{sug.name}</span>
              <span className="sug-direccion">{sug.address_type}</span>
            </button>
          ))}
        </div>
      )}

      {/* Preview del mapa */}
      <div className="mapa-preview">
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05},${lat - 0.05},${lng + 0.05},${lat + 0.05}&layer=mapnik&marker=${lat},${lng}`}
          style={{ width: '100%', height: '250px', borderRadius: '8px', border: 'none' }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      {/* Coordenadas actuales */}
      <div className="mapa-coords">
        <div className="coord-item">
          <label>Ubicación:</label>
          <span>{busqueda || 'No seleccionada'}</span>
        </div>
        <div className="coord-item">
          <label>Coordenadas:</label>
          <span>{parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
};

export default MapaEventos;

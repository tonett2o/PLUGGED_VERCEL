import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './MapaUbicacion.css';

const MapaUbicacion = ({ latitud, longitud, ubicacion, onUbicacionChange }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [busqueda, setBusqueda] = useState(ubicacion || '');
  const [buscando, setBuscando] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  const [coordActuales, setCoordActuales] = useState({
    lat: parseFloat(latitud) || 40.4168,
    lng: parseFloat(longitud) || -3.7038
  });

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current) return;

    // Limpiar mapa anterior si existe
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    // Crear nuevo mapa con las coordenadas actuales
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [coordActuales.lng, coordActuales.lat],
      zoom: 12,
      pitch: 0,
      bearing: 0
    });

    map.current.on('load', () => {
      console.log('🗺️ Mapa cargado');
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Agregar marcador inicial
    crearMarcador();

    // Click en el mapa para seleccionar ubicación
    const handleMapClick = (e) => {
      const newLat = e.lngLat.lat;
      const newLng = e.lngLat.lng;
      actualizarUbicacion(newLat, newLng);
    };
    map.current.on('click', handleMapClick);

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
        map.current.remove();
        map.current = null;
      }
    };
  }, [coordActuales.lat, coordActuales.lng]);

  const crearMarcador = () => {
    if (marker.current) marker.current.remove();

    const el = document.createElement('div');
    el.className = 'mapa-marker';
    el.innerHTML = `
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.16 0 0 7.16 0 16C0 26 16 40 16 40S32 26 32 16C32 7.16 24.84 0 16 0Z" fill="#0ADAF5"/>
        <circle cx="16" cy="16" r="6" fill="#fff"/>
      </svg>
    `;

    marker.current = new maplibregl.Marker({ element: el })
      .setLngLat([coordActuales.lng, coordActuales.lat])
      .addTo(map.current);
  };

  const actualizarUbicacion = (lat, lng) => {
    setCoordActuales({ lat, lng });
    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: 14,
        duration: 1000
      });
    }
    crearMarcador();
    onUbicacionChange(lat, lng, busqueda);
  };

  // Búsqueda de ubicación
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

  // Debounce en búsqueda
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
    setSugerencias([]);
    actualizarUbicacion(newLat, newLng);
    onUbicacionChange(newLat, newLng, newUbicacion);
  };

  return (
    <div className="mapa-ubicacion-container">
      <div className="mapa-ubicacion-header">
        <h3>📍 Selecciona tu ubicación</h3>
        <p className="mapa-ubicacion-subtitle">Busca o haz clic en el mapa</p>
      </div>

      {/* Búsqueda */}
      <div className="mapa-ubicacion-search">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Ej: Madrid, Barcelona, mi ciudad..."
          className="mapa-ubicacion-search-input"
        />
        {buscando && <span className="mapa-ubicacion-loading">Buscando...</span>}
      </div>

      {/* Sugerencias */}
      {sugerencias.length > 0 && (
        <div className="mapa-ubicacion-sugerencias">
          {sugerencias.map((sug, idx) => (
            <button
              key={idx}
              className="mapa-ubicacion-sugerencia"
              onClick={() => seleccionarSugerencia(sug)}
            >
              <span className="sug-nombre">{sug.name}</span>
              <span className="sug-direccion">{sug.address_type}</span>
            </button>
          ))}
        </div>
      )}

      {/* Mapa */}
      <div className="mapa-ubicacion-canvas" ref={mapContainer}></div>

      {/* Coordenadas actuales */}
      <div className="mapa-ubicacion-coords">
        <div className="coord-item">
          <label>Ubicación:</label>
          <span>{busqueda || 'No seleccionada'}</span>
        </div>
        <div className="coord-item">
          <label>Coordenadas:</label>
          <span>{coordActuales.lat.toFixed(4)}, {coordActuales.lng.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
};

export default MapaUbicacion;

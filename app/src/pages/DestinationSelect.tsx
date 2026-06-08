import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Search, X, MapPin, Navigation, Train } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { useAlarmContext } from '../contexts/AlarmContext';
import { useGeolocation } from '../hooks/useGeolocation';
import type { Destination, LatLng, SearchResult } from '../types';

const defaultLocation: LatLng = { lat: -23.5505, lng: -46.6333 };

const destinationIcon = new L.DivIcon({
  className: 'custom-destination-marker',
  html: `<div style="
    width: 40px; 
    height: 48px; 
    background: linear-gradient(135deg, #E8A93F, #F0BC5E);
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  ">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg);">
      <path d="M8 6v6"/>
      <path d="M15 6v6"/>
      <path d="M2 12h19.6"/>
      <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.5-5.7c-.1-.4-.2-.8-.2-1.2 0-.4-.1-.8-.2-1.2L18 3"/>
      <path d="M2 12V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/>
    </svg>
  </div>`,
  iconSize: [40, 48],
  iconAnchor: [20, 48],
});

const pulseIcon = new L.DivIcon({
  className: 'custom-location-marker',
  html: `<div style="position: relative; width: 40px; height: 40px;">
    <div style="
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 40px; height: 40px;
      border-radius: 50%;
      border: 2px solid rgba(229, 57, 53, 0.3);
      animation: pulse-ring 2s linear infinite;
    "></div>
    <div style="
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 12px; height: 12px;
      border-radius: 50%;
      background: #E53935;
      border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      z-index: 2;
    "></div>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function MapController({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom() || 15);
  }, [center, map]);
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

const mockSearchResults: SearchResult[] = [
  { id: '1', name: 'Estacao Paulista', address: 'Av. Paulista, 1578 - Bela Vista, Sao Paulo', location: { lat: -23.5617, lng: -46.656 } },
  { id: '2', name: 'Metro Se', address: 'Pca da Se, s/n - Centro, Sao Paulo', location: { lat: -23.5503, lng: -46.6339 } },
  { id: '3', name: 'Terminal Bandeira', address: 'Pca Fernando Costa, s/n - Centro, Sao Paulo', location: { lat: -23.5478, lng: -46.638 } },
  { id: '4', name: 'Estacao Bras', address: 'R. Domingos de Morais, 238 - Vila Mariana, Sao Paulo', location: { lat: -23.5445, lng: -46.6237 } },
  { id: '5', name: 'Metro Consolacao', address: 'R. da Consolacao, 2365 - Consolacao, Sao Paulo', location: { lat: -23.5576, lng: -46.6609 } },
];

export default function DestinationSelect() {
  const navigate = useNavigate();
  const { setDestination } = useAlarmContext();
  const { latitude, longitude, error: geoError } = useGeolocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLng>(
    latitude && longitude ? { lat: latitude, lng: longitude } : defaultLocation
  );
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const userLocation = latitude && longitude ? { lat: latitude, lng: longitude } : null;

  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
    }
  }, [userLocation?.lat, userLocation?.lng]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const filtered = mockSearchResults.filter(
        (r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.address.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, []);

  const handleSelectResult = useCallback((result: SearchResult) => {
    const dest: Destination = {
      id: result.id,
      name: result.name,
      address: result.address,
      location: result.location,
    };
    setSelectedDestination(dest);
    setMapCenter(result.location);
    setSearchQuery(result.name);
    setSearchResults([]);
    setShowBottomSheet(true);
  }, []);

  const handleMapClick = useCallback((latlng: LatLng) => {
    const dest: Destination = {
      id: `map-${Date.now()}`,
      name: 'Local selecionado',
      address: `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`,
      location: latlng,
    };
    setSelectedDestination(dest);
    setShowBottomSheet(true);
  }, []);

  const handleSetDestination = useCallback(() => {
    if (selectedDestination) {
      setDestination(selectedDestination);
      navigate('/config');
    }
  }, [selectedDestination, setDestination, navigate]);

  const handleMyLocation = useCallback(() => {
    if (userLocation) {
      setMapCenter(userLocation);
    }
  }, [userLocation]);

  return (
    <motion.div
      className="relative h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={15}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <MapController center={mapCenter} />
        <MapClickHandler onMapClick={handleMapClick} />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={pulseIcon} />
        )}

        {selectedDestination && (
          <Marker
            position={[selectedDestination.location.lat, selectedDestination.location.lng]}
            icon={destinationIcon}
          />
        )}
      </MapContainer>

      <motion.div
        className="absolute top-4 left-4 right-4 z-[1000]"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center gap-3 bg-app-card rounded-xl px-4 py-3 shadow-lg border border-app-border">
          <Search className="w-5 h-5 text-app-text-secondary flex-shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar parada de onibus ou estacao..."
            className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-app-text-secondary"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}>
              <X className="w-5 h-5 text-app-text-secondary" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              className="mt-2 bg-app-card rounded-xl shadow-lg border border-app-border max-h-[300px] overflow-y-auto no-scrollbar"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {searchResults.map((result, i) => (
                <button
                  key={result.id}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-app-accent/15 transition-colors"
                  style={{ borderBottom: i < searchResults.length - 1 ? '1px solid #333' : 'none' }}
                  onClick={() => handleSelectResult(result)}
                >
                  <MapPin className="w-5 h-5 text-app-accent mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white font-medium text-[15px] truncate">{result.name}</p>
                    <p className="text-app-text-secondary text-[13px] truncate">{result.address}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {geoError && (
        <motion.div
          className="absolute top-20 left-4 right-4 z-[1000] bg-app-danger/20 border border-app-danger/40 rounded-xl px-4 py-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-app-danger text-sm">{geoError}. Usando localizacao padrao.</p>
        </motion.div>
      )}

      <motion.button
        className="absolute bottom-28 right-4 z-[1000] w-12 h-12 bg-app-card rounded-full shadow-lg border border-app-border flex items-center justify-center"
        onClick={handleMyLocation}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Navigation className="w-5 h-5 text-app-accent" />
      </motion.button>

      <AnimatePresence>
        {showBottomSheet && selectedDestination && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-[1000] bg-app-card rounded-t-3xl shadow-2xl border-t border-app-border"
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            exit={{ y: 300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="w-10 h-1 bg-app-border rounded-full mx-auto mt-3 mb-4" />
            <div className="px-5 pb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-app-accent/15 flex items-center justify-center flex-shrink-0">
                  <Train className="w-5 h-5 text-app-accent" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-lg truncate">{selectedDestination.name}</h3>
                  <p className="text-app-text-secondary text-sm truncate">{selectedDestination.address}</p>
                </div>
              </div>
              <button
                onClick={handleSetDestination}
                className="w-full h-14 bg-gradient-to-r from-app-accent to-app-accent-hover rounded-2xl font-semibold text-white text-base shadow-lg shadow-app-accent/30 active:scale-[0.97] transition-transform"
              >
                Definir como Destino
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

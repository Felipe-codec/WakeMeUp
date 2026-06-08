import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Target, ShieldCheck, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { useAlarmContext } from '../contexts/AlarmContext';
import { formatDistance, calculateDistance } from '../utils/distance';
import { useGeolocation } from '../hooks/useGeolocation';

const destinationIcon = new L.DivIcon({
  className: 'custom-dest-marker-travel',
  html: `<div style="width:36px;height:44px;background:linear-gradient(135deg,#E8A93F,#F0BC5E);border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.4);animation:float 1.5s ease-in-out infinite;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(45deg)"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.5-5.7c-.1-.4-.2-.8-.2-1.2 0-.4-.1-.8-.2-1.2L18 3"/><path d="M2 12V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/></svg></div>`,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
});

const userIcon = new L.DivIcon({
  className: 'user-location-dot',
  html: `<div style="position:relative;width:40px;height:40px;">
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;border-radius:50%;border:2px solid rgba(229,57,53,0.3);animation:pulse-ring 2s linear infinite;"></div>
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:14px;height:14px;border-radius:50%;background:#E53935;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);z-index:2;"></div>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

export default function TravelMode() {
  const navigate = useNavigate();
  const { config, cancelAlarm, setUserLocation, distance } = useAlarmContext();
  const { latitude, longitude } = useGeolocation((loc) => setUserLocation(loc));
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!config) {
      navigate('/');
      return;
    }
    if (latitude && longitude && !initialDistance) {
      const dist = calculateDistance({ lat: latitude, lng: longitude }, config.destination.location);
      setInitialDistance(dist);
    }
  }, [config, latitude, longitude, initialDistance, navigate]);

  const userLocation = latitude && longitude ? { lat: latitude, lng: longitude } : null;

  const progress = useMemo(() => {
    if (initialDistance && distance !== null && initialDistance > 0) {
      const p = Math.max(0, Math.min(1, 1 - distance / initialDistance));
      return p;
    }
    return 0;
  }, [initialDistance, distance]);

  const handleCancel = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  const confirmCancel = useCallback(() => {
    cancelAlarm();
    navigate('/');
  }, [cancelAlarm, navigate]);

  if (!config) return null;

  const pathPositions: [number, number][] = userLocation
    ? [
        [userLocation.lat, userLocation.lng],
        [config.destination.location.lat, config.destination.location.lng],
      ]
    : [];

  return (
    <motion.div
      className="h-full w-full relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute top-0 left-0 right-0 h-16 z-[1000] pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(18,18,18,0.8), transparent)' }}
      >
        <button
          onClick={handleCancel}
          className="pointer-events-auto mt-3 ml-3 w-10 h-10 bg-app-card/80 backdrop-blur rounded-full flex items-center justify-center border border-app-border"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-[1000]">
        <div className="w-3 h-3 rounded-full bg-app-success animate-pulse-dot shadow-lg shadow-app-success/50" />
      </div>

      <MapContainer
        center={[config.destination.location.lat, config.destination.location.lng]}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        <Marker
          position={[config.destination.location.lat, config.destination.location.lng]}
          icon={destinationIcon}
        />
        <Circle
          center={[config.destination.location.lat, config.destination.location.lng]}
          radius={config.radius}
          pathOptions={{
            color: '#E8A93F',
            fillColor: '#E8A93F',
            fillOpacity: 0.08,
            weight: 2,
            dashArray: '6, 6',
          }}
        />
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />
            <Polyline
              positions={pathPositions}
              pathOptions={{
                color: '#E8A93F',
                weight: 2,
                opacity: 0.4,
                dashArray: '8, 8',
              }}
            />
          </>
        )}
      </MapContainer>

      <motion.div
        className="absolute bottom-28 left-4 right-4 z-[1000]"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="bg-app-card/95 backdrop-blur rounded-3xl p-6 border border-app-border shadow-2xl">
          <p className="text-app-text-secondary text-sm uppercase tracking-widest text-center mb-1">
            Distancia restante
          </p>
          <p className="text-white font-bold text-5xl text-center tabular-nums mb-3">
            {distance !== null ? formatDistance(distance) : '---'}
          </p>

          <div className="w-full h-1.5 bg-app-border rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(to right, #E8A93F, #F0BC5E)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-app-text-secondary">
              <Target className="w-4 h-4" />
              <span>Raio: {formatDistance(config.radius)}</span>
            </div>
            <div className="flex items-center gap-2 text-app-success">
              <ShieldCheck className="w-4 h-4" />
              <span>Ativo</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.button
        className="absolute bottom-6 left-4 right-4 z-[1000] h-14 rounded-2xl border-2 border-app-border bg-transparent text-app-text-secondary font-semibold active:bg-app-danger/20 active:border-app-danger active:text-app-danger transition-all"
        onClick={handleCancel}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        whileTap={{ scale: 0.97 }}
      >
        Cancelar Alarme
      </motion.button>

      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            className="absolute inset-0 z-[2000] flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-app-card rounded-3xl p-6 max-w-sm w-full border border-app-border shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-app-warning/20 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-app-warning" />
                </div>
              </div>
              <h3 className="text-white font-semibold text-xl text-center mb-2">
                Cancelar Viagem?
              </h3>
              <p className="text-app-text-secondary text-base text-center mb-6">
                O alarme sera desativado e voce nao sera alertado ao chegar no destino.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 h-12 rounded-xl bg-app-border text-white font-semibold active:scale-[0.97] transition-transform"
                >
                  Voltar
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 h-12 rounded-xl bg-app-danger text-white font-semibold active:scale-[0.97] transition-transform"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

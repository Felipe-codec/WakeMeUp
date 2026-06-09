import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Radar, BellRing, BellOff, MapPin } from 'lucide-react';
import { Map, AdvancedMarker, useMap, ColorScheme } from '@vis.gl/react-google-maps';
import { useAlarmContext } from '../contexts/AlarmContext';
import { useTheme } from '../contexts/ThemeContext';
import { formatDistance, calculateDistance } from '../utils/distance';
import { useGeolocation } from '../hooks/useGeolocation';

function MapCircle({ center, radius, color = '#E8A93F' }: { center: google.maps.LatLngLiteral, radius: number, color?: string }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const circle = new google.maps.Circle({
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: 0.08,
      map,
      center,
      radius
    });
    return () => circle.setMap(null);
  }, [map, center, radius, color]);
  return null;
}

function MapPolyline({ path, color = '#E8A93F' }: { path: google.maps.LatLngLiteral[], color?: string }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    
    const lineSymbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      scale: 2
    };

    const polyline = new google.maps.Polyline({
      path,
      strokeColor: color,
      strokeOpacity: 0,
      strokeWeight: 2,
      icons: [{
        icon: lineSymbol,
        offset: '0',
        repeat: '12px'
      }],
      map
    });

    return () => polyline.setMap(null);
  }, [map, path, color]);
  return null;
}

export default function TravelMode() {
  const navigate = useNavigate();
  const { config, cancelAlarm, setUserLocation, distance } = useAlarmContext();
  const { theme } = useTheme();
  const { latitude, longitude } = useGeolocation((loc) => setUserLocation(loc));
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);

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

  const pathPositions = userLocation
    ? [userLocation, config.destination.location]
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
          <ArrowLeft className="w-5 h-5 text-app-text-primary" />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-[1000]">
        <div className="w-3 h-3 rounded-full bg-app-success animate-pulse-dot shadow-lg shadow-app-success/50" />
      </div>

      <Map
        defaultZoom={13}
        center={config.destination.location}
        mapId="DEMO_MAP_ID"
        colorScheme={theme === 'dark' ? ColorScheme.DARK : ColorScheme.LIGHT}
        disableDefaultUI={true}
        gestureHandling="greedy"
        style={{ width: '100%', height: '100%' }}
      >
        <AdvancedMarker position={config.destination.location}>
          <div style={{
             width: '36px', height: '36px', background: 'linear-gradient(135deg, #E8A93F, #F0BC5E)',
             borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', display: 'flex',
             alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
             animation: 'float 1.5s ease-in-out infinite', position: 'relative', top: '-22px'
          }}>
            <MapPin size={16} color="white" style={{ transform: 'rotate(45deg)' }} />
          </div>
        </AdvancedMarker>

        <MapCircle center={config.destination.location} radius={config.radius} color="#E8A93F" />

        {userLocation && (
          <>
            <AdvancedMarker position={userLocation}>
              <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40px', height: '40px', borderRadius: '50%', border: '2px solid rgba(229, 57, 53, 0.3)', animation: 'pulse-ring 2s linear infinite' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '14px', height: '14px', borderRadius: '50%', background: '#E53935', border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.3)', zIndex: 2 }} />
              </div>
            </AdvancedMarker>
            
            <MapPolyline path={pathPositions} color="#E8A93F" />
          </>
        )}
      </Map>

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
          <p className="text-app-text-primary font-bold text-5xl text-center tabular-nums mb-3">
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
              <Radar className="w-4 h-4" />
              <span>Raio: {formatDistance(config.radius)}</span>
            </div>
            <div className="flex items-center gap-2 text-app-success">
              <BellRing className="w-4 h-4" />
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
                  <BellOff className="w-7 h-7 text-app-warning" />
                </div>
              </div>
              <h3 className="text-app-text-primary font-semibold text-xl text-center mb-2">
                Cancelar Viagem?
              </h3>
              <p className="text-app-text-secondary text-base text-center mb-6">
                O alarme sera desativado e voce nao sera alertado ao chegar no destino.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 h-12 rounded-xl bg-app-border text-app-text-primary font-semibold active:scale-[0.97] transition-transform"
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

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Smartphone, MapPin } from 'lucide-react';
import { Map, AdvancedMarker, useMap, ColorScheme } from '@vis.gl/react-google-maps';
import { useEffect, useMemo } from 'react';
import { useAlarmContext } from '../contexts/AlarmContext';
import { useTheme } from '../contexts/ThemeContext';
import { formatDistance, calculateDistance } from '../utils/distance';
import { useGeolocation } from '../hooks/useGeolocation';

const RADIUS_OPTIONS = [
  { value: 100, label: '100m' },
  { value: 200, label: '200m' },
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
  { value: 2000, label: '2km' },
];

function MapCircle({ center, radius, color = '#E8A93F' }: { center: google.maps.LatLngLiteral, radius: number, color?: string }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const circle = new google.maps.Circle({
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: 0.1,
      map,
      center,
      radius
    });
    return () => circle.setMap(null);
  }, [map, center, radius, color]);
  return null;
}

export default function AlarmConfig() {
  const navigate = useNavigate();
  const { config, setRadius, setSoundEnabled, setVibrationEnabled, startMonitoring } = useAlarmContext();
  const { theme } = useTheme();
  const { latitude, longitude } = useGeolocation();

  if (!config) {
    navigate('/');
    return null;
  }

  const userLocation = latitude && longitude ? { lat: latitude, lng: longitude } : null;
  const currentDistance = useMemo(() => {
    if (userLocation) {
      return calculateDistance(userLocation, config.destination.location);
    }
    return null;
  }, [userLocation?.lat, userLocation?.lng, config.destination.location.lat, config.destination.location.lng]);

  const handleStartTrip = () => {
    startMonitoring();
    navigate('/travel');
  };

  return (
    <motion.div
      className="h-full w-full flex flex-col bg-app-bg"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center h-14 px-4 border-b border-app-border flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-app-card transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-app-text-primary" />
        </button>
        <h1 className="absolute left-0 right-0 text-center text-app-text-primary font-semibold text-lg pointer-events-none">
          Configurar Alarme
        </h1>
      </div>

      <div className="h-[35%] flex-shrink-0 relative">
        <Map
          defaultZoom={14}
          center={config.destination.location}
          mapId="DEMO_MAP_ID"
          colorScheme={theme === 'dark' ? ColorScheme.DARK : ColorScheme.LIGHT}
          disableDefaultUI={true}
          gestureHandling="none"
        >
          <AdvancedMarker position={config.destination.location}>
             <div style={{
               width: '36px', height: '36px', background: 'linear-gradient(135deg, #E8A93F, #F0BC5E)',
               borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', display: 'flex',
               alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
               position: 'relative', top: '-22px'
             }}>
               <MapPin size={16} color="white" style={{ transform: 'rotate(45deg)' }} />
             </div>
          </AdvancedMarker>

          <MapCircle center={config.destination.location} radius={config.radius} color="#E8A93F" />

          {userLocation && (
            <AdvancedMarker position={userLocation}>
              <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#E53935', border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.3)'}} />
            </AdvancedMarker>
          )}
        </Map>

        <div className="absolute bottom-3 right-3 flex flex-col gap-2">
          <div className="w-8 h-8 bg-app-card/90 rounded-lg flex items-center justify-center border border-app-border">
            <span className="text-app-text-primary text-xs font-bold">+</span>
          </div>
          <div className="w-8 h-8 bg-app-card/90 rounded-lg flex items-center justify-center border border-app-border">
            <span className="text-app-text-primary text-xs font-bold">-</span>
          </div>
        </div>
      </div>

      <motion.div
        className="flex-1 overflow-y-auto no-scrollbar"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <div className="p-4 space-y-4">
          <div className="bg-app-card rounded-2xl p-5 text-center border border-app-border">
            <p className="text-app-text-secondary text-sm uppercase tracking-wider mb-1">
              Distancia ate o destino
            </p>
            <p className="text-app-accent font-bold text-4xl tabular-nums">
              {currentDistance !== null ? formatDistance(currentDistance) : '---'}
            </p>
            <p className="text-app-text-secondary text-xs mt-1">
              Voce sera alertado ao se aproximar
            </p>
          </div>

          <div className="bg-app-card rounded-2xl p-5 border border-app-border">
            <h2 className="text-app-text-primary font-semibold text-base mb-1">Raio de Alerta</h2>
            <p className="text-app-text-secondary text-sm mb-4">
              Quao longe do destino voce quer ser alertado?
            </p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {RADIUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRadius(option.value)}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    config.radius === option.value
                      ? 'bg-app-accent text-app-text-primary shadow-lg shadow-app-accent/25'
                      : 'bg-transparent border border-app-border text-app-text-secondary hover:border-app-accent/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-app-card rounded-2xl p-5 border border-app-border space-y-4">
            <h2 className="text-app-text-primary font-semibold text-base">Alerta</h2>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-app-text-secondary" />
                <span className="text-app-text-primary text-base">Som de Alarme</span>
              </div>
              <button
                onClick={() => setSoundEnabled(!config.soundEnabled)}
                className={`relative w-[52px] h-8 rounded-full transition-colors ${
                  config.soundEnabled ? 'bg-app-success' : 'bg-app-border'
                }`}
              >
                <div
                  className={`absolute top-[2px] w-7 h-7 bg-white rounded-full shadow-md transition-transform ${
                    config.soundEnabled ? 'translate-x-[22px]' : 'translate-x-[2px]'
                  }`}
                />
              </button>
            </div>

            <div className="h-px bg-app-border" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-app-text-secondary" />
                <span className="text-app-text-primary text-base">Vibracao</span>
              </div>
              <button
                onClick={() => setVibrationEnabled(!config.vibrationEnabled)}
                className={`relative w-[52px] h-8 rounded-full transition-colors ${
                  config.vibrationEnabled ? 'bg-app-success' : 'bg-app-border'
                }`}
              >
                <div
                  className={`absolute top-[2px] w-7 h-7 bg-white rounded-full shadow-md transition-transform ${
                    config.vibrationEnabled ? 'translate-x-[22px]' : 'translate-x-[2px]'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="h-20" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-6 left-4 right-4 z-10"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.25, type: 'spring', stiffness: 300, damping: 25 }}
      >
        <button
          onClick={handleStartTrip}
          className="w-full h-14 bg-gradient-to-r from-app-accent to-app-accent-hover rounded-2xl font-semibold text-white text-lg shadow-xl shadow-app-accent/40 active:scale-[0.97] transition-transform"
        >
          Iniciar Viagem
        </button>
      </motion.div>
    </motion.div>
  );
}

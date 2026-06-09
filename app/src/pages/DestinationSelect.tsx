import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, AdvancedMarker, useMapsLibrary, ColorScheme } from '@vis.gl/react-google-maps';
import { Search, X, MapPin, LocateFixed, MapPinned, Loader2, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlarmContext } from '../contexts/AlarmContext';
import { useGeolocation } from '../hooks/useGeolocation';
import type { Destination, LatLng, SearchResult } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const defaultLocation: LatLng = { lat: -23.5505, lng: -46.6333 };

export default function DestinationSelect() {
  const navigate = useNavigate();
  const { setDestination } = useAlarmContext();
  const { latitude, longitude, error: geoError } = useGeolocation();
  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLng>(
    latitude && longitude ? { lat: latitude, lng: longitude } : defaultLocation
  );
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isSelectingRef = useRef(false);

  const userLocation = latitude && longitude ? { lat: latitude, lng: longitude } : null;

  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
    }
  }, [userLocation?.lat, userLocation?.lng]);

  const placesLib = useMapsLibrary('places');
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    if (!placesLib) return;
    setAutocompleteService(new placesLib.AutocompleteService());
    // Create a dummy div to initialize PlacesService
    setPlacesService(new placesLib.PlacesService(document.createElement('div')));
  }, [placesLib]);

  // Busca de endereços usando o Google Places API
  useEffect(() => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    if (!autocompleteService) return;

    const delayDebounce = setTimeout(() => {
      setIsLoading(true);
      autocompleteService.getPlacePredictions(
        { input: searchQuery, componentRestrictions: { country: 'br' } },
        (predictions: any, status: any) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const results: SearchResult[] = predictions.map((p: google.maps.places.AutocompletePrediction) => ({
              id: p.place_id,
              name: p.structured_formatting.main_text,
              address: p.structured_formatting.secondary_text,
              location: { lat: 0, lng: 0 }, // Serão preenchidos ao selecionar
            }));
            setSearchResults(results);
          } else {
            setSearchResults([]);
          }
          setIsLoading(false);
        }
      );
    }, 400); // Aguarda 400ms de inatividade

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, autocompleteService]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      if (!placesService) return;
      setIsLoading(true);
      
      placesService.getDetails(
        { placeId: result.id, fields: ['geometry', 'formatted_address', 'name'] },
        (place, status) => {
          setIsLoading(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
            const loc = place.geometry.location;
            const dest: Destination = {
              id: result.id,
              name: place.name || result.name,
              address: place.formatted_address || result.address,
              location: { lat: loc.lat(), lng: loc.lng() },
            };
            isSelectingRef.current = true;
            setSelectedDestination(dest);
            setMapCenter(dest.location);
            setSearchQuery(dest.name);
            setSearchResults([]);
            setShowBottomSheet(true);
          } else {
            console.error("Falha ao obter detalhes do local:", status);
            alert("Não foi possível carregar os detalhes desse local.");
          }
        }
      );
    },
    [placesService]
  );

  const handleMapClick = useCallback(
    (e: any) => {
      if (!e.detail.latLng) return;
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      
      const dest: Destination = {
        id: `map-${Date.now()}`,
        name: 'Local selecionado no mapa',
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        location: { lat, lng },
      };

      setSelectedDestination(dest);
      setShowBottomSheet(true);
    },
    []
  );

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
      <div className="h-full w-full absolute inset-0">
        <Map
          defaultZoom={15}
          center={mapCenter}
          onCenterChanged={(e) => setMapCenter(e.detail.center)}
          onClick={handleMapClick}
          mapId="DEMO_MAP_ID"
          colorScheme={theme === 'dark' ? ColorScheme.DARK : ColorScheme.LIGHT}
          disableDefaultUI={true}
          gestureHandling="greedy"
          style={{ width: '100%', height: '100%' }}
        >
          {userLocation && (
            <AdvancedMarker position={userLocation}>
              <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid rgba(229, 57, 53, 0.3)',
                    animation: 'pulse-ring 2s linear infinite',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#E53935',
                    border: '2px solid white',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    zIndex: 2,
                  }}
                />
              </div>
            </AdvancedMarker>
          )}

          {selectedDestination && (
            <AdvancedMarker position={selectedDestination.location}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #E8A93F, #F0BC5E)',
                  borderRadius: '50% 50% 50% 0',
                  transform: 'rotate(-45deg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  position: 'relative',
                  top: '-24px', // Ajuste para centralizar o ponto do pino
                }}
              >
                <MapPin size={20} color="white" style={{ transform: 'rotate(45deg)' }} />
              </div>
            </AdvancedMarker>
          )}
        </Map>
      </div>

      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <motion.div
          className="flex gap-2"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
        <div className="flex-1 flex items-center gap-3 bg-app-card rounded-xl px-4 py-3 shadow-lg border border-app-border">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-app-accent animate-spin flex-shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-app-text-secondary flex-shrink-0" />
          )}
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar endereço ou parada..."
            className="flex-1 bg-transparent text-app-text-primary text-base outline-none placeholder:text-app-text-secondary"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}>
              <X className="w-5 h-5 text-app-text-secondary" />
            </button>
          )}
        </div>
        
        <button
          onClick={toggleTheme}
          className="w-12 flex-shrink-0 bg-app-card rounded-xl shadow-lg border border-app-border flex items-center justify-center hover:bg-app-accent/10 transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-app-accent" />
          ) : (
            <Moon className="w-5 h-5 text-app-text-primary" />
          )}
        </button>
        </motion.div>

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
                    <p className="text-app-text-primary font-medium text-[15px] truncate">{result.name}</p>
                    <p className="text-app-text-secondary text-[13px] truncate">{result.address}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
        className={`absolute right-4 z-[1001] w-12 h-12 bg-app-card rounded-full shadow-lg border border-app-border flex items-center justify-center transition-all duration-300 ${showBottomSheet ? 'bottom-60' : 'bottom-28'}`}
        onClick={handleMyLocation}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <LocateFixed className="w-5 h-5 text-app-accent" />
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
                  <MapPinned className="w-5 h-5 text-app-accent" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-app-text-primary font-semibold text-lg truncate">{selectedDestination.name}</h3>
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

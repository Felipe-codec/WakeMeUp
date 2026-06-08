import { useState, useEffect, useRef, useCallback } from 'react';
import type { GeolocationState, LatLng } from '../types';

export function useGeolocation(onLocationUpdate?: (loc: LatLng) => void) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: true,
    error: null,
  });
  const watchIdRef = useRef<number | null>(null);
  const onUpdateRef = useRef(onLocationUpdate);
  onUpdateRef.current = onLocationUpdate;

  const startWatching = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState((s) => ({ ...s, loading: false, error: 'Geolocalizacao nao suportada' }));
      return;
    }

    setState((s) => ({ ...s, loading: true }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setState({
          latitude,
          longitude,
          accuracy,
          loading: false,
          error: null,
        });
        onUpdateRef.current?.({ lat: latitude, lng: longitude });
      },
      (err) => {
        let errorMsg = 'Erro ao obter localizacao';
        if (err.code === 1) errorMsg = 'Permissao de localizacao negada';
        else if (err.code === 2) errorMsg = 'Localizacao indisponivel';
        else if (err.code === 3) errorMsg = 'Timeout ao obter localizacao';
        setState((s) => ({ ...s, loading: false, error: errorMsg }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    startWatching();
    return () => {
      stopWatching();
    };
  }, [startWatching, stopWatching]);

  return { ...state, startWatching, stopWatching };
}

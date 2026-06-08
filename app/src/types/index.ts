export interface LatLng {
  lat: number;
  lng: number;
}

export interface Destination {
  id: string;
  name: string;
  address: string;
  location: LatLng;
}

export interface AlarmConfig {
  destination: Destination;
  radius: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export type AlarmStatus = 'idle' | 'configuring' | 'monitoring' | 'ringing' | 'stopped';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

export interface SearchResult {
  id: string;
  name: string;
  address: string;
  location: LatLng;
}

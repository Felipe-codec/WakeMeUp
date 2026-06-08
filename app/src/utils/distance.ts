import { getDistance } from 'geolib';
import type { LatLng } from '../types';

export function calculateDistance(from: LatLng, to: LatLng): number {
  return getDistance(
    { latitude: from.lat, longitude: from.lng },
    { latitude: to.lat, longitude: to.lng }
  );
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatDistanceLarge(meters: number): { value: string; unit: string } {
  if (meters < 1000) {
    return { value: `${Math.round(meters)}`, unit: 'm' };
  }
  return { value: `${(meters / 1000).toFixed(1)}`, unit: 'km' };
}

export function isWithinRadius(
  userLocation: LatLng,
  destination: LatLng,
  radius: number
): boolean {
  const distance = calculateDistance(userLocation, destination);
  return distance <= radius;
}

export function getInitialDistance(
  userLocation: LatLng,
  destination: LatLng
): number {
  return calculateDistance(userLocation, destination);
}

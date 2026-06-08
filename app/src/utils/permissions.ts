export async function requestLocationPermission(): Promise<PermissionState> {
  if ('permissions' in navigator) {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state as PermissionState;
    } catch {
      return 'prompt';
    }
  }
  return 'prompt';
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if ('Notification' in window) {
    return await Notification.requestPermission();
  }
  return 'denied';
}

export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator;
}

export function isVibrationSupported(): boolean {
  return 'vibrate' in navigator;
}

export function isWakeLockSupported(): boolean {
  return 'wakeLock' in navigator;
}

export async function requestWakeLock(): Promise<WakeLockSentinel | null> {
  if (!isWakeLockSupported()) return null;
  try {
    return await navigator.wakeLock.request('screen');
  } catch {
    return null;
  }
}

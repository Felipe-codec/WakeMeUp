import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { AlarmConfig, AlarmStatus, Destination, LatLng } from '../types';
import { calculateDistance, isWithinRadius } from '../utils/distance';
import { createAlarmSound } from '../utils/sounds';

interface AlarmContextType {
  config: AlarmConfig | null;
  status: AlarmStatus;
  userLocation: LatLng | null;
  distance: number | null;
  setDestination: (dest: Destination) => void;
  setRadius: (radius: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  startMonitoring: () => void;
  stopAlarm: () => void;
  cancelAlarm: () => void;
  setUserLocation: (loc: LatLng) => void;
}

const AlarmContext = createContext<AlarmContextType | null>(null);

export function AlarmProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AlarmConfig | null>(null);
  const [status, setStatus] = useState<AlarmStatus>('idle');
  const [userLocation, setUserLocationState] = useState<LatLng | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const alarmSoundRef = useRef(createAlarmSound());
  const vibrateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const configRef = useRef(config);
  const statusRef = useRef(status);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const setDestination = useCallback((dest: Destination) => {
    setConfig((prev) =>
      prev
        ? { ...prev, destination: dest }
        : { destination: dest, radius: 500, soundEnabled: true, vibrationEnabled: true }
    );
    setStatus('configuring');
  }, []);

  const setRadius = useCallback((radius: number) => {
    setConfig((prev) => (prev ? { ...prev, radius } : null));
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setConfig((prev) => (prev ? { ...prev, soundEnabled: enabled } : null));
  }, []);

  const setVibrationEnabled = useCallback((enabled: boolean) => {
    setConfig((prev) => (prev ? { ...prev, vibrationEnabled: enabled } : null));
  }, []);

  const startVibration = useCallback(() => {
    if ('vibrate' in navigator) {
      const pattern = [500, 200, 500, 200, 500];
      navigator.vibrate(pattern);
      vibrateIntervalRef.current = setInterval(() => {
        navigator.vibrate(pattern);
      }, 2000);
    }
  }, []);

  const stopVibration = useCallback(() => {
    if (vibrateIntervalRef.current) {
      clearInterval(vibrateIntervalRef.current);
      vibrateIntervalRef.current = null;
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
  }, []);

  const triggerAlarm = useCallback(() => {
    setStatus('ringing');
    const currentConfig = configRef.current;
    if (currentConfig?.soundEnabled) {
      alarmSoundRef.current.play();
    }
    if (currentConfig?.vibrationEnabled) {
      startVibration();
    }
  }, [startVibration]);

  const setUserLocation = useCallback(
    (loc: LatLng) => {
      setUserLocationState(loc);
      const currentConfig = configRef.current;
      const currentStatus = statusRef.current;

      if (currentConfig && (currentStatus === 'monitoring' || currentStatus === 'configuring')) {
        const dist = calculateDistance(loc, currentConfig.destination.location);
        setDistance(dist);

        if (currentStatus === 'monitoring' && isWithinRadius(loc, currentConfig.destination.location, currentConfig.radius)) {
          triggerAlarm();
        }
      }
    },
    [triggerAlarm]
  );

  const startMonitoring = useCallback(() => {
    setStatus('monitoring');
    if (userLocation && config) {
      const dist = calculateDistance(userLocation, config.destination.location);
      setDistance(dist);
      if (isWithinRadius(userLocation, config.destination.location, config.radius)) {
        triggerAlarm();
      }
    }
  }, [userLocation, config, triggerAlarm]);

  const stopAlarm = useCallback(() => {
    alarmSoundRef.current.stop();
    stopVibration();
    setStatus('stopped');
  }, [stopVibration]);

  const cancelAlarm = useCallback(() => {
    alarmSoundRef.current.stop();
    stopVibration();
    setStatus('idle');
    setConfig(null);
    setDistance(null);
  }, [stopVibration]);

  useEffect(() => {
    return () => {
      alarmSoundRef.current.stop();
      stopVibration();
    };
  }, [stopVibration]);

  return (
    <AlarmContext.Provider
      value={{
        config,
        status,
        userLocation,
        distance,
        setDestination,
        setRadius,
        setSoundEnabled,
        setVibrationEnabled,
        startMonitoring,
        stopAlarm,
        cancelAlarm,
        setUserLocation,
      }}
    >
      {children}
    </AlarmContext.Provider>
  );
}

export const useAlarmContext = () => {
  const ctx = useContext(AlarmContext);
  if (!ctx) throw new Error('useAlarmContext must be used within AlarmProvider');
  return ctx;
};

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BellRing } from 'lucide-react';
import { useAlarmContext } from '../contexts/AlarmContext';
import { formatDistance } from '../utils/distance';

export default function AlarmRinging() {
  const navigate = useNavigate();
  const { status, config, stopAlarm, distance } = useAlarmContext();

  useEffect(() => {
    if (status !== 'ringing') {
      navigate('/');
    }
  }, [status, navigate]);

  const handleStop = useCallback(() => {
    stopAlarm();
    navigate('/');
  }, [stopAlarm, navigate]);

  if (!config) return null;

  return (
    <motion.div
      className="h-full w-full relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-app-danger pointer-events-none animate-alarm-flash"
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          <div className="w-24 h-24 rounded-full bg-app-danger/20 flex items-center justify-center mb-6 animate-bell-shake">
            <BellRing className="w-12 h-12 text-app-danger" />
          </div>
        </motion.div>

        <motion.h1
          className="text-app-text-primary font-bold text-4xl text-center mb-2"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Voce chegou!
        </motion.h1>

        <motion.p
          className="text-app-text-secondary text-lg text-center mb-1"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          Sua parada esta proxima.
        </motion.p>

        <motion.p
          className="text-app-accent text-base text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {distance !== null ? `~${formatDistance(distance)} do destino` : 'Destino proximo'}
        </motion.p>

        <motion.button
          className="absolute bottom-12 left-6 right-6 h-[72px] bg-app-danger rounded-3xl font-bold text-white text-xl tracking-wider shadow-2xl"
          style={{
            boxShadow: '0 8px 32px rgba(232, 93, 63, 0.5)',
          }}
          onClick={handleStop}
          initial={{ y: 40, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            boxShadow: [
              '0 8px 32px rgba(232, 93, 63, 0.5)',
              '0 8px 48px rgba(232, 93, 63, 0.8)',
              '0 8px 32px rgba(232, 93, 63, 0.5)',
            ],
          }}
          transition={{
            y: { type: 'spring', stiffness: 300, damping: 25, delay: 0.2 },
            opacity: { duration: 0.3, delay: 0.2 },
            boxShadow: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
          }}
          whileTap={{ scale: 0.95 }}
        >
          PARAR ALARME
        </motion.button>
      </div>
    </motion.div>
  );
}

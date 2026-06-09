import { Routes, Route, Navigate } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import { AlarmProvider } from './contexts/AlarmContext';
import DestinationSelect from './pages/DestinationSelect';
import AlarmConfig from './pages/AlarmConfig';
import TravelMode from './pages/TravelMode';
import AlarmRinging from './pages/AlarmRinging';

import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <ThemeProvider>
      <APIProvider apiKey={apiKey}>
        <AlarmProvider>
          <div className="h-screen w-screen bg-app-bg text-app-text-primary overflow-hidden">
            <Routes>
              <Route path="/" element={<DestinationSelect />} />
              <Route path="/config" element={<AlarmConfig />} />
              <Route path="/travel" element={<TravelMode />} />
              <Route path="/alarm" element={<AlarmRinging />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AlarmProvider>
      </APIProvider>
    </ThemeProvider>
  );
}

export default App;


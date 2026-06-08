import { Routes, Route, Navigate } from 'react-router-dom';
import { AlarmProvider } from './contexts/AlarmContext';
import DestinationSelect from './pages/DestinationSelect';
import AlarmConfig from './pages/AlarmConfig';
import TravelMode from './pages/TravelMode';
import AlarmRinging from './pages/AlarmRinging';

function App() {
  return (
    <AlarmProvider>
      <div className="h-screen w-screen bg-app-bg text-white overflow-hidden">
        <Routes>
          <Route path="/" element={<DestinationSelect />} />
          <Route path="/config" element={<AlarmConfig />} />
          <Route path="/travel" element={<TravelMode />} />
          <Route path="/alarm" element={<AlarmRinging />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AlarmProvider>
  );
}

export default App;

import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PowerBIDashboard from './components/PowerBIDashboard';

function App() {
  return (
    <Routes>
      {/* Main Modern Dashboard */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      
      {/* Power BI-Style Dashboard */}
      <Route path="/powerbi" element={<PowerBIDashboard />} />
    </Routes>
  );
}

export default App;
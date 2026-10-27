import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import EvidenceImport from './pages/EvidenceImport';
import Timeline from './pages/Timeline';
import Correlation from './pages/Correlation';
import Report from './pages/Report';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/investigation" element={<Dashboard />} />
        <Route path="/investigation/import" element={<EvidenceImport />} />
        <Route path="/investigation/timeline" element={<Timeline />} />
        <Route path="/investigation/correlation" element={<Correlation />} />
        <Route path="/investigation/report" element={<Report />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

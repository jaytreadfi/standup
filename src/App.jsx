import { Routes, Route, Navigate } from 'react-router-dom';
import MysteryPage from './pages/MysteryPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/mystery" element={<MysteryPage />} />
      <Route path="*" element={<Navigate to="/mystery" replace />} />
    </Routes>
  );
}

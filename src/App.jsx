import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Toast from './components/Toast';
import Loader from './components/Loader';
import ProtectedRoute from "./routes/ProtectedRoute";
import './App.css';

export default function App() {
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <Router>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      {loading && <Loader />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setToast={setToast} setLoading={setLoading} />} />
        <Route path="/signup" element={<Signup setToast={setToast} setLoading={setLoading} />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

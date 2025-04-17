import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  return session ? children : <Navigate to="/login" />;
}

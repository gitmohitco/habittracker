import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import './Login.css';

export default function Signup({ setToast, setLoading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setToast("❌ Passwords do not match");

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      await supabase.from('profiles').insert([
        { id: data.user.id, email, is_first_time: true }
      ]);

      setToast("✅ Registered! Check your email for OTP.");
      navigate("/login");
    } catch (err) {
      setToast(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
          <form onSubmit={handleSignup} className="auth-form">
              <h2>Register</h2>
              <input type="email" value={email} required placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)} />
              <input type="password" value={password} required placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)} />
              <input type="password" value={confirm} required placeholder="Confirm Password"
                  onChange={(e) => setConfirm(e.target.value)} />
              <button type="submit">Register</button>
          </form>
  );
}

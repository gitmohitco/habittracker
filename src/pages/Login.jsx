import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import './Login.css';

export default function Login({ setToast, setLoading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if first-time user
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_first_time')
        .eq('email', email)
        .single();

      if (profile?.is_first_time) {
        setToast('🛡️ First-time login, please check your email to verify via OTP.');
      }

      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Set is_first_time = false
      await supabase
        .from('profiles')
        .update({ is_first_time: false })
        .eq('email', email);

      setToast('✅ Logged in successfully');
      navigate('/dashboard');
    } catch (err) {
      // Custom message for invalid credentials
      if (err.message.includes('Invalid login credentials')) {
        setToast('❌ Incorrect email or password. Please try again.');
      } else {
        setToast(`❌ ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <button onClick={handleHome} className="home-button">
        Home
      </button>
      <form onSubmit={handleLogin} className="auth-form">
        <h2>Login</h2>
        <input
          type="email"
          value={email}
          required
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
        />
        <input
          type="password"
          value={password}
          required
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Password"
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
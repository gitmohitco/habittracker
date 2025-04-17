// import { Link } from 'react-router-dom';

import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <main className="home">
      <section className="hero">
        <h1>Daily Habits Tracker</h1>
        <p>Track your daily routines, build streaks, and stay motivated!</p>
        <nav className="cta-buttons">
          <Link to="/login" className="btn btn-primary">Login</Link>
          <Link to="/signup" className="btn btn-secondary">Register</Link>
        </nav>
      </section>
    </main>
  );
}
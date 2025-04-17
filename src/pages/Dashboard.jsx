import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HabitList from '../features/Habits/HabitList';
import Heatmap from '../features/Heatmap/Heatmap';
import { supabase } from '../services/supabase';
import { requestNotificationPermission, sendNotification } from '../utils/notifications';
import './Dashboard.css';

export default function Dashboard({ setToast }) {
  const navigate = useNavigate();
  const [hasUncheckedTasks, setHasUncheckedTasks] = useState(false);

  // Check if there are unchecked tasks for today
  const checkTasksForToday = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const { data: habits, error } = await supabase
        .from('habits')
        .select('completed')
        .eq('user_id', user.user.id)
        .eq('date', today);

      if (error) throw error;

      // If no habits exist or any are unchecked, set hasUncheckedTasks to true
      const unchecked = !habits.length || habits.some((habit) => !habit.completed);
      setHasUncheckedTasks(unchecked);
    } catch (err) {
      setToast(`❌ Failed to check tasks: ${err.message}`);
    }
  };

  // Schedule notification
  useEffect(() => {
    requestNotificationPermission();
    checkTasksForToday();

    let timer;

    if (hasUncheckedTasks) {
      // If unchecked tasks exist, send reminder after 20 seconds
      timer = setTimeout(() => {
        sendNotification('🌟 Habit Reminder', 'Remember to check in today!');
      }, 20000);
    } else {
      // If all tasks are checked, schedule for next day at 6:00 AM
      const now = new Date();
      const nextDay = new Date(now);
      nextDay.setDate(now.getDate() + 1);
      nextDay.setHours(6, 0, 0, 0); // 6:00 AM next day

      const timeUntilNextDay = nextDay - now;

      timer = setTimeout(() => {
        sendNotification('🌟 Habit Reminder', 'Start your day with your habits!');
      }, timeUntilNextDay);
    }

    return () => clearTimeout(timer);
  }, [hasUncheckedTasks, setToast]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setToast(`❌ Logout failed: ${error.message}`);
    } else {
      navigate('/login');
      setToast('✅ Logged out.');
    }
  };

  return (
    <div className="dashboard">
      <header>
        <h1>Daily Habits Tracker</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <HabitList />
      {/* <Heatmap /> */}
    </div>
  );
}
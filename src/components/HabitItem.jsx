import React, { useState } from 'react';
import { useSupabaseClient } from '@supabase/supabase-js';
import { sendNotification } from './utils/notifications'; // Add this import for notifications
import { getRandomQuote } from './utils/motivation'; // Add this import for motivational quotes
import Loader from './components/Loader';

const HabitItem = ({ habit, onDelete, onComplete, isLoading }) => {
  const [completed, setCompleted] = useState(habit.completed);
  const [loading, setLoading] = useState(isLoading);
  const supabase = useSupabaseClient();

  const handleHabitCompletion = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('habits')
        .update({ completed: true })
        .eq('id', habit.id);
      if (error) throw error;

      setCompleted(true);
      sendNotification('Habit Completed', getRandomQuote());

      // If the habit is marked as completed, trigger the onComplete callback
      if (onComplete) onComplete(habit.id);
    } catch (error) {
      console.error('Error completing habit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="habit-item">
      {loading && <Loader />}
      <h3>{habit.name}</h3>
      <p>{habit.frequency}</p>
      <p>{habit.start_date}</p>

      <button
        onClick={handleHabitCompletion}
        disabled={completed || loading}
        className={completed ? 'completed' : 'complete-btn'}
      >
        {completed ? 'Completed' : 'Mark as Completed'}
      </button>

      <button onClick={() => onDelete(habit.id)} className="delete-btn">
        Delete
      </button>
    </div>
  );
};

export default HabitItem;

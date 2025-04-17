import { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import './Heatmap.css';
import { supabase } from '../../services/supabase';

export default function Heatmap() {
  const [values, setValues] = useState([]);
  const [userId, setUserId] = useState(null);
  const today = new Date();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchHabitCheckins();

      // Subscribe to checkins table for real-time updates
      const subscription = supabase
        .channel('checkins-channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'checkins',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            fetchHabitCheckins(); // Refresh heatmap on new check-in
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [userId]);

  const fetchHabitCheckins = async () => {
    try {
      if (!userId) return;

      const { data, error } = await supabase
        .from('checkins')
        .select('checkin_date, count')
        .eq('user_id', userId)
        .gte('checkin_date', shiftDate(today, -100).toISOString().slice(0, 10))
        .lte('checkin_date', today.toISOString().slice(0, 10));

      if (error) throw error;

      // Aggregate check-ins by date
      const aggregatedData = data.reduce((acc, item) => {
        const date = item.checkin_date;
        if (!acc[date]) {
          acc[date] = { date, count: 0 };
        }
        acc[date].count += item.count;
        return acc;
      }, {});

      // Convert to array for heatmap
      const formattedData = Object.values(aggregatedData);
      setValues(formattedData);
    } catch (error) {
      console.error("Error fetching habit check-ins: ", error);
    }
  };

  return (
    <div className="heatmap">
      <h3>Your Progress</h3>
      <CalendarHeatmap
        startDate={shiftDate(today, -100)}
        endDate={today}
        values={values}
        classForValue={(value) => {
          if (!value) return 'color-empty';
          if (value.count >= 4) return 'color-github-4';
          if (value.count === 3) return 'color-github-3';
          if (value.count === 2) return 'color-github-2';
          return 'color-github-1';
        }}
      />
    </div>
  );
}

function shiftDate(date, numDays) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + numDays);
  return newDate;
}
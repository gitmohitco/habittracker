import { useEffect, useState } from "react";
import HabitForm from "./HabitForm";
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { supabase } from "../../services/supabase";
import { format, parseISO } from "date-fns";
import '../Habits/HabitList.css';

export default function HabitList() {
  const [habits, setHabits] = useState([]);
  const [toast, setToast] = useState("");
  const [userId, setUserId] = useState(null);
  const [editingHabit, setEditingHabit] = useState(null);
  const [checkedInToday, setCheckedInToday] = useState({});
  const [progressVisible, setProgressVisible] = useState(false);
  const [progressData, setProgressData] = useState([]);
  const [today, setToday] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) {
          setUserId(user.id);
        } else {
          setToast("❌ No user authenticated");
          console.error("No user authenticated");
        }
      } catch (error) {
        console.error("Error fetching user:", error.message);
        setToast("❌ Failed to authenticate user");
      }
    };
    getUser();

    // Check for day change every minute
    const interval = setInterval(() => {
      const newToday = format(new Date(), "yyyy-MM-dd");
      if (newToday !== today) {
        setToday(newToday);
        setCheckedInToday({});
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [today]);

  useEffect(() => {
    if (userId) {
      fetchHabits();
      fetchProgressData();
    }
  }, [userId, today]);

  async function fetchHabits() {
    try {
      if (!userId) {
        console.warn("fetchHabits: No userId, skipping fetch");
        return;
      }

      console.log("Fetching habits for user:", userId);
      const { data: habitsData, error: habitsError } = await supabase
        .from("habits")
        .select("id, name, frequency, start_date")
        .eq("user_id", userId);

      if (habitsError) {
        console.error("Supabase habits error:", habitsError);
        throw new Error(habitsError.message);
      }

      if (!habitsData || habitsData.length === 0) {
        console.log("No habits found for user");
        setHabits([]);
        setCheckedInToday({});
        return;
      }

      setHabits(habitsData);
      console.log("Habits fetched:", habitsData);

      const habitIds = habitsData.map(h => h.id);
      const { data: checkinData, error: checkinError } = await supabase
        .from("checkins")
        .select("habit_id")
        .eq("checkin_date", today)
        .eq("user_id", userId)
        .in("habit_id", habitIds);

      if (checkinError) {
        console.error("Supabase checkins error:", checkinError);
        throw new Error(checkinError.message);
      }

      const checkedInMap = {};
      checkinData?.forEach(({ habit_id }) => {
        checkedInMap[habit_id] = true;
      });
      setCheckedInToday(checkedInMap);
      console.log("Check-ins for today:", checkedInMap);
    } catch (error) {
      console.error("Error fetching habits:", error.message);
      setToast(`❌ Failed to fetch habits: ${error.message}`);
    }
  }

  async function fetchProgressData() {
    try {
      if (!userId) return;

      const todayDate = new Date();
      const { data, error } = await supabase
        .from('checkins')
        .select('checkin_date, count')
        .eq('user_id', userId)
        .gte('checkin_date', shiftDate(todayDate, -100).toISOString().slice(0, 10))
        .lte('checkin_date', todayDate.toISOString().slice(0, 10));

      if (error) {
        console.error("Supabase progress error:", error);
        throw new Error(error.message);
      }

      const aggregatedData = data.reduce((acc, item) => {
        const date = item.checkin_date;
        if (!acc[date]) {
          acc[date] = { date, count: 0 };
        }
        acc[date].count += item.count;
        return acc;
      }, {});

      const formattedData = Object.values(aggregatedData);
      setProgressData(formattedData);
      console.log("Progress data fetched:", formattedData);
    } catch (error) {
      console.error("Error fetching progress data:", error.message);
      setToast(`❌ Failed to fetch progress: ${error.message}`);
    }
  }

  async function handleAddHabit(habit) {
    if (!userId) {
      setToast("❌ No user authenticated");
      return;
    }
    const { name, frequency, start_date } = habit;

    try {
      const { data, error } = await supabase
        .from("habits")
        .insert([{ user_id: userId, name, frequency, start_date }])
        .select();

      if (error) throw new Error(error.message);

      setToast("✅ Habit added!");
      setHabits((prev) => [...prev, ...data]);
      fetchProgressData(); // Refresh progress data
    } catch (error) {
      console.error("Error adding habit:", error.message);
      setToast(`❌ Failed to add habit: ${error.message}`);
    }

    setTimeout(() => setToast(""), 3000);
  }

  async function handleEditHabit(id, updatedHabit) {
    const { name, frequency } = updatedHabit;

    try {
      const { data, error } = await supabase
        .from("habits")
        .update({ name, frequency })
        .eq("id", id)
        .select();

      if (error) throw new Error(error.message);

      setToast("✅ Habit updated!");
      const updated = data?.[0];
      setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updated } : h)));
      setEditingHabit(null);
    } catch (error) {
      console.error("Error updating habit:", error.message);
      setToast(`❌ Failed to update habit: ${error.message}`);
    }

    setTimeout(() => setToast(""), 3000);
  }

  async function handleDeleteHabit(id) {
    try {
      const { error } = await supabase.from("habits").delete().eq("id", id);

      if (error) throw new Error(error.message);

      setToast("✅ Habit deleted!");
      setHabits(habits.filter((habit) => habit.id !== id));
      fetchProgressData(); // Refresh progress data
    } catch (error) {
      console.error("Error deleting habit:", error.message);
      setToast(`❌ Failed to delete habit: ${error.message}`);
    }

    setTimeout(() => setToast(""), 3000);
  }

  async function handleCheckIn(id) {
    try {
      const { error } = await supabase
        .from("checkins")
        .upsert([{ habit_id: id, checkin_date: today, user_id: userId, count: 1 }]);

      if (error) throw new Error(error.message);

      setToast("✅ Checked in for today!");
      setCheckedInToday((prev) => ({ ...prev, [id]: true }));
      fetchProgressData(); // Refresh progress data
    } catch (error) {
      console.error("Error checking in:", error.message);
      setToast(`❌ Failed to check in: ${error.message}`);
    }

    setTimeout(() => setToast(""), 3000);
  }

  function renderProgressModal() {
    if (!progressVisible) return null;

    return (
      <div className="modal-overlay">
        <div className="modal">
          <h2 className="text-lg font-bold mb-2">Your Daily Progress</h2>
          <div className="heatmap">
            <CalendarHeatmap
              startDate={shiftDate(new Date(), -100)}
              endDate={new Date()}
              values={progressData}
              classForValue={(value) => {
                if (!value) return 'color-empty';
                if (value.count >= 4) return 'color-github-4';
                if (value.count === 3) return 'color-github-3';
                if (value.count === 2) return 'color-github-2';
                return 'color-github-1';
              }}
            />
          </div>
          <button
            onClick={() => setProgressVisible(false)}
            className="text-blue-600 hover:underline mt-4"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  function shiftDate(date, numDays) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numDays);
    return newDate;
  }

  return (
    <div className="habit-tracker">
      <HabitForm onAdd={handleAddHabit} setToast={setToast} />
      {toast && <p className="toast">{toast}</p>}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setProgressVisible(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Show Progress
        </button>
      </div>
      <ul>
        {habits.length > 0 ? (
          habits.map((habit) => (
            <li
              key={habit.id}
              className={`p-3 my-2 border rounded ${
                checkedInToday[habit.id] ? "bg-green-100" : "bg-white"
              }`}
            >
              {editingHabit?.id === habit.id ? (
                <div>
                  <input
                    type="text"
                    defaultValue={habit.name}
                    onChange={(e) =>
                      setEditingHabit({ ...editingHabit, name: e.target.value })
                    }
                  />
                  <select
                    defaultValue={habit.frequency}
                    onChange={(e) =>
                      setEditingHabit({ ...editingHabit, frequency: e.target.value })
                    }
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                  <button onClick={() => handleEditHabit(habit.id, editingHabit)}>Save</button>
                </div>
              ) : (
                <div>
                  <p className="font-medium">
                    {habit.name} ({habit.frequency})
                  </p>
                  <button
                    disabled={checkedInToday[habit.id]}
                    onClick={() => handleCheckIn(habit.id)}
                    className={`mr-2 ${
                      checkedInToday[habit.id] ? "text-green-600 font-bold" : "text-black"
                    }`}
                  >
                    {checkedInToday[habit.id] ? "✅ Done" : "Check-in"}
                  </button>
                  {!checkedInToday[habit.id] && (
                    <button onClick={() => setEditingHabit(habit)} className="mr-2">
                      Edit
                    </button>
                  )}
                  <button onClick={() => handleDeleteHabit(habit.id)} className="mr-2">
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))
        ) : (
          <li>No habits yet. Add one above! ✨</li>
        )}
      </ul>
      {renderProgressModal()}
    </div>
  );
}
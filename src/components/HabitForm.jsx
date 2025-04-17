import { useState } from "react";
import { supabase } from "../services/supabase";

export default function HabitForm({ userId, onCreated, setToast }) {
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("habits").insert([
      {
        user_id: userId,
        title,
        frequency,
        start_date: startDate,
      },
    ]);

    if (error) {
      setToast("❌ Error creating habit: " + error.message);
    } else {
      setToast("✅ Habit created successfully!");
      setTitle("");
      setFrequency("daily");
      onCreated(); // Refresh habit list
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="habit-form">
      <input
        type="text"
        placeholder="Habit name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="custom">Custom</option>
      </select>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Habit"}
      </button>
    </form>
  );
}

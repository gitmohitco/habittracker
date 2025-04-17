// 📁 src/features/Habits/HabitForm.jsx
import React, { useState } from "react";
import '../Habits/HabitForm.css'

const HabitForm = ({ onAdd, setToast }) => {
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [customFrequency, setCustomFrequency] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const habitData = {
      name: name.trim(),
      frequency: frequency === "custom" ? customFrequency.trim() : frequency,
      start_date: new Date().toISOString().split("T")[0], // Keep it ISO Date (YYYY-MM-DD) if your DB uses DATE
    };

    onAdd(habitData);
    setToast && setToast("✅ Habit added successfully!");

    // Reset the form
    setName("");
    setCustomFrequency("");
    setFrequency("daily");
  };

  return (
    <form onSubmit={handleSubmit} className="habit-form">
      <input
        type="text"
        placeholder="Enter habit"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <select
        value={frequency}
        onChange={(e) => setFrequency(e.target.value)}
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="custom">Custom</option>
      </select>

      {frequency === "custom" && (
        <input
          type="text"
          placeholder="Enter custom frequency (e.g. Mon/Wed/Fri)"
          value={customFrequency}
          onChange={(e) => setCustomFrequency(e.target.value)}
          required
        />
      )}

      <button type="submit">Add Habit</button>
    </form>
  );
};

export default HabitForm;

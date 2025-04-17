import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function History({ userId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("checkins")
      .select("*, habits(title)")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("checkin_date", { ascending: false });

    if (!error) {
      setHistory(data);
    }
    setLoading(false);
  };

  return (
    <div className="history-section">
      <h2>📜 History</h2>
      {loading ? (
        <p>Loading...</p>
      ) : history.length === 0 ? (
        <p>No completed habits yet.</p>
      ) : (
        <ul>
          {history.map((entry) => (
            <li key={entry.id}>
              ✅ {entry.habits.title} on {entry.checkin_date}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

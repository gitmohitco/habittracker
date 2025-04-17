import { useEffect, useState } from "react";
import HeatMap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { subDays, format } from "date-fns";
import { supabase } from "../services/supabase";
import "./heatmap.css";

export default function Heatmap({ userId }) {
  const [checkins, setCheckins] = useState([]);

  useEffect(() => {
    fetchHeatmap();
  }, []);

  const fetchHeatmap = async () => {
    const fromDate = subDays(new Date(), 180).toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("checkins")
      .select("checkin_date")
      .eq("user_id", userId)
      .eq("status", "completed")
      .gte("checkin_date", fromDate);

    if (!error) {
      const formatted = data.map((item) => ({
        date: item.checkin_date,
        count: 1,
      }));
      setCheckins(formatted);
    }
  };

  return (
    <div className="heatmap-section">
      <h2>🔥 Your Habit Streak</h2>
      <HeatMap
        startDate={subDays(new Date(), 180)}
        endDate={new Date()}
        values={checkins}
        classForValue={(value) => {
          if (!value) return "color-empty";
          if (value.count >= 1) return "color-gitlab-4";
        }}
        tooltipDataAttrs={(value) =>
          value.date ? { "data-tip": `${value.date}: ✅` } : {}
        }
        showWeekdayLabels
      />
    </div>
  );
}

export const createCalendarEvent = async (accessToken, habit) => {
    const event = {
      summary: habit.name,
      description: `Track habit: ${habit.name}`,
      start: {
        dateTime: `${habit.start_date}T09:00:00Z`,
      },
      end: {
        dateTime: `${habit.start_date}T10:00:00Z`,
      },
    };
  
    const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });
  
    return res.json();
  };
  
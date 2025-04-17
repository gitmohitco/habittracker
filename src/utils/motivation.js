const quotes = [
    "🔥 Keep the streak alive!",
    "💪 Great job! Consistency is power.",
    "👏 You’re smashing your goals!",
    "🌱 Small steps every day lead to big changes.",
    "🎯 Stay focused and unstoppable!"
  ];
  
  export const getRandomQuote = () => {
    return quotes[Math.floor(Math.random() * quotes.length)];
  };
  
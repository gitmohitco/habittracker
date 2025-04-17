import "./Toast.css";

export default function Toast({ message, type = "success" }) {
  if (!message) return null;

  return (
    <div className={`toast ${type}`}>
      {message}
    </div>
  );
}

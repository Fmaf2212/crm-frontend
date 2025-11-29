import { useEffect } from "react";

export function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, []);

  const styles = {
    error: "bg-red-100 border-red-300 text-red-800",
    success: "bg-green-100 border-green-300 text-green-800"
  };

  const icons = {
    error: "⚠️",
    success: "✔️"
  };

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 border rounded-lg shadow-lg animate-slideIn ${styles[type]}`}>
      <span className="text-lg">{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}

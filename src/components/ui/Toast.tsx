import { useEffect } from "react";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, []);

  const styles: Record<ToastType, string> = {
    error: "bg-red-100 border-red-300 text-red-800",
    success: "bg-green-100 border-green-300 text-green-800",
    info: "bg-blue-100 border-blue-300 text-blue-800",
  };

  const icons: Record<ToastType, string> = {
    error: "⚠️",
    success: "✔️",
    info: "ℹ️",
  };

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 border rounded-lg shadow-lg animate-slideIn ${styles[type]}`}
    >
      <span className="text-lg">{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}

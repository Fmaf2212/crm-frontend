import { useState } from "react";
import { Toast } from "./Toast";

let externalShowToast = (msg: string, type: "success" | "error") => {};

export function ToastManager() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  externalShowToast = (message, type) => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

// ESTA es la función que podrás usar en cualquier parte:
export function showToast(message: string, type: "success" | "error") {
  externalShowToast(message, type);
}

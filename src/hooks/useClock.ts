import { useEffect, useState } from "react";

export function useClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000); // Actualiza cada 1 segundo

    return () => clearInterval(interval);
  }, []);

  return time;
}

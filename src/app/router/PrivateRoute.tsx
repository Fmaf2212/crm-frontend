import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";

export function PrivateRoute({ children }: { children: ReactElement }) {
  const isLogged = localStorage.getItem("sn_isLogged") === "true";

  if (!isLogged) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

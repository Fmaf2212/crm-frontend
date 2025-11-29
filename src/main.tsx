import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";

import "./styles/globals.css";
import { AppRouter } from "./app/router";
import { AppProviders } from "./app/providers";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProviders>
        <Suspense fallback={<div>Cargando...</div>}>
          <AppRouter />
        </Suspense>
      </AppProviders>
    </BrowserRouter>
  </React.StrictMode>
);

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ToastManager } from "@/components/ui/toastManager";

export function AppLayout({ children, title }: { children: React.ReactNode; title?: string }) {

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">

      {/* SIDEBAR DESKTOP */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* SIDEBAR MOBILE (deslizable) */}
      <div
        className={`
          fixed inset-y-0 left-0 w-64 bg-sidebar z-50 
          transform transition-transform duration-300 lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar />
      </div>

      {/* OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex flex-col flex-1 overflow-x-auto">
        <Header onMenuClick={() => setMobileOpen(true)} title={title}/>

        <main className="p-6 flex-1 overflow-y-auto bg-[#F8F9FA]">
          <ToastManager />
          {children}
        </main>
      </div>
    </div>
  );
}

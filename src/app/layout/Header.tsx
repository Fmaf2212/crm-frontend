import { Menu, LogOut } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const handleLogout = () => {
    localStorage.removeItem("sn_user");
    localStorage.removeItem("sn_isLogged");
    window.location.href = "/login";
  };
  const isLogged = localStorage.getItem("sn_isLogged") === "true";

  return (
    <header className="w-full h-14 bg-[#F8F9FA] border-b border-[var(--border)] flex items-center justify-between px-6">

      {/* IZQUIERDA */}
      <div className="flex items-center space-x-3">
        <button
          className="lg:hidden text-sidebar-foreground p-2"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6" />
        </button>

        {title && <h1 className="text-lg font-medium">{title}</h1>}
      </div>

      {/* DERECHA */}
      <div>
        {isLogged && (
          <button
            onClick={handleLogout}
            className="text-red-600 flex items-center gap-2 hover:opacity-80"
          >
            <LogOut className="w-5 h-5" /> Salir
          </button>
        )}
      </div>

    </header>
  );
}

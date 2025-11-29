import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
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
      <div></div>
    </header>
  );
}

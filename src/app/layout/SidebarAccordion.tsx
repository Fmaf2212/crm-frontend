import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

interface SidebarAccordionProps {
    icon: React.ReactNode;
    label: string;
    items: {
        name: string;
        path: string;
    }[];
}

export function SidebarAccordion({ icon, label, items }: SidebarAccordionProps) {
    const location = useLocation();

    // 1) Detectar si alguna ruta hija coincide con la URL actual
    const isParentActive = items.some(item => location.pathname.startsWith(item.path));

    // 2) Estado del acordeón (abrir si es padre activo)
    const [open, setOpen] = useState(isParentActive);

    // 3) Si cambia la URL, recalculamos si debe abrirse
    useEffect(() => {
        setOpen(isParentActive);
    }, [isParentActive]);

    return (
        <div>
            {/* Header del acordeón */}
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center justify-between w-full text-left px-3 py-2.5 transition rounded-md
          ${isParentActive ? "text-white" : "text-white/80 hover:bg-white/10"}
        `}
            >
                <div className="flex items-center space-x-3">
                    {icon}
                    <span className={`font-normal ${isParentActive ? "font-semibold" : ""}`}>
                        {label}
                    </span>
                </div>

                <ChevronRight
                    className={`w-4 h-4 transition-transform ${open ? "rotate-90" : ""
                        }`}
                />
            </button>

            {/* Subitems */}
            <div className={`collapse ${open ? "open" : ""}`}>
                <div className="mt-1">
                    {items.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                isActive
                                    ? "block ml-12 mb-1 text-sm px-3 py-2 rounded-lg bg-white text-[var(--sidebar)] font-medium"
                                    : "block ml-12 mb-1 text-sm px-3 py-2 rounded-lg text-white/70 hover:text-white/90 hover:bg-white/10"
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
}

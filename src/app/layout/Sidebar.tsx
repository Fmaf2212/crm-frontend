import { Users, ShoppingCart, Package, Settings, ChevronRight, ChevronDown, User } from "lucide-react";
import { useState } from "react";
import { SidebarAccordion } from "./SidebarAccordion";
import { useClock } from "../../hooks/useClock";

export function Sidebar() {
  const [openLead, setOpenLead] = useState(false);
  const now = useClock();
  const nowDate = new Date();

  const fechaFormateada = nowDate.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const fechaCapitalizada =
  fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

  const userLS = localStorage.getItem("sn_user");
  const user = userLS ? JSON.parse(userLS) : null;

  return (
    <aside className="w-64 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] h-screen border-r border-[var(--sidebar-border)] flex flex-col">
      <div className="w-full flex flex-col justify-center p-6 border-b border-white/20">
        <img
          src="/assets/logo-sn.png"
          alt="Santa Natura"
          className="w-full object-contain p-5"
        />
        <div className="text-white/80 text-sm">
          <p className="font-medium mb-1">
            {user ? user.nombres : "Usuario"}
          </p>
          <p className="text-xs mb-1 opacity-90">{fechaCapitalizada}</p>
          <p className="text-xs opacity-90">Hora: {now.toLocaleTimeString("es-PE", { hour12: false })}</p>
        </div>
      </div>

      <nav className="sidebar-scroll space-y-3 p-4 overflow-y-auto flex-1 min-h-0">

          {/* GESTIONAR LEAD */}
          <SidebarAccordion
            icon={<User className="w-4 h-4" />}
            label="GESTIONAR LEAD"
            items={[
              { name: "Crear Lead", path: "/lead/crear" },
              { name: "Seguimiento Lead", path: "/lead/seguimiento" },
            ]}
          />

          {/* GESTIONAR PEDIDOS */}
          <SidebarAccordion
            icon={<ShoppingCart className="w-4 h-4" />}
            label="GESTIONAR PEDIDOS"
            items={[
              // { name: "Crear Pedido", path: "/pedidos/crear" },
              { name: "Seguimiento Pedido", path: "/pedidos/seguimiento" },
            ]}
          />

          {/* GESTIONAR PRODUCTOS */}
          <SidebarAccordion
            icon={<Package className="w-4 h-4" />}
            label="GESTIONAR PRODUCTOS"
            items={[
              { name: "Crear Producto", path: "/productos/crear" },
            ]}
          />

          {/* SISTEMA / CONFIGURACIÓN */}
          <SidebarAccordion
            icon={<Settings className="w-4 h-4" />}
            label="SISTEMA / CONFIGURACIÓN"
            items={[
              { name: "Crear Usuario", path: "/sistema/usuarios" },
              { name: "Asignar Rol", path: "/sistema/asignar-roles" },
              { name: "Roles", path: "/sistema/roles" },
              { name: "Tipo de Documento", path: "/sistema/tipo-documento" },
              { name: "Agregar Canal", path: "/sistema/agregar-canal" },
              { name: "Horarios de Envío", path: "/sistema/horarios-envio" },
              { name: "Agregar Banco", path: "/sistema/agregar-banco" },
              { name: "Método de Pago", path: "/sistema/metodo-pago" },
              { name: "Medio de Envío Delivery", path: "/sistema/medio-envio-delivery" },
              { name: "Medio de Registro de Lead", path: "/sistema/medio-registro-lead" },
              { name: "Estado de Interacción de Lead", path: "/sistema/estado-interaccion-lead" },
              { name: "Estado de Pedido", path: "/sistema/estado-pedido" },
              { name: "Estado de Delivery", path: "/sistema/estado-delivery" },
              { name: "Estado de Pago", path: "/sistema/estado-pago" },
              { name: "Estado de Facturación", path: "/sistema/estado-facturacion" },
            ]}
          />
      </nav>
    </aside>
  );
}
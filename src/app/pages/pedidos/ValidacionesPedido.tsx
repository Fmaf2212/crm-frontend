import { AppLayout } from "@/app/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ShieldCheck } from "lucide-react";
import React, { useState } from "react";

type PedidoValidacion = {
  codigo: string;
  cliente: string;
  fecha: string;
  total: number;
  estado: "Pendiente" | "Validado";
};

const mockPedidos: PedidoValidacion[] = [
  {
    codigo: "PED005",
    cliente: "Rosa Flores",
    fecha: "2025-11-19",
    total: 200.0,
    estado: "Pendiente",
  },
  {
    codigo: "PED006",
    cliente: "Luis Torres",
    fecha: "2025-11-19",
    total: 350.0,
    estado: "Pendiente",
  },
  {
    codigo: "PED007",
    cliente: "Carmen Ruiz",
    fecha: "2025-11-18",
    total: 180.0,
    estado: "Validado",
  },
];

const badgeColors: Record<PedidoValidacion["estado"], string> = {
  Pendiente: "bg-yellow-100 text-yellow-700 border-yellow-300",
  Validado: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const ValidacionesPedido: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");

  const filtered = mockPedidos.filter((p) => {
    const matchSearch =
      p.codigo.toLowerCase().includes(search.toLowerCase()) ||
      p.cliente.toLowerCase().includes(search.toLowerCase());

    const matchEstado =
      filterEstado === "Todos" ? true : p.estado === filterEstado;

    return matchSearch && matchEstado;
  });

  return (
    <AppLayout title="Validaciones Pedido">
      <div className="h-full w-full bg-slate-50">

        {/* Breadcrumb */}
        <div className="text-sm text-gray-500">
          Gestionar Pedidos <span className="mx-1">›</span>
          <span className="text-gray-800">Validaciones Pedido</span>
        </div>

        {/* Card principal */}
        <Card className="mt-6">
          <SectionTitle icon={ShieldCheck}>
            Pedidos Pendientes de Validación
          </SectionTitle>

          <div className="px-6 py-6 bg-white rounded-br-2xl rounded-bl-2xl rounded-tr-none rounded-tl-none space-y-6">

            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Buscador */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Buscar
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por código o cliente..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Estado */}
              <div className="w-full md:w-52">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Estado
                </label>
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="Todos">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Validado">Validado</option>
                </select>
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="text-left text-sm text-slate-600 border-b border-slate-200">
                    <th className="py-3 px-2">Código</th>
                    <th className="py-3 px-2">Cliente</th>
                    <th className="py-3 px-2">Fecha</th>
                    <th className="py-3 px-2">Total</th>
                    <th className="py-3 px-2">Estado</th>
                    <th className="py-3 px-2">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((pedido) => (
                    <tr
                      key={pedido.codigo}
                      className="border-b border-slate-100 text-sm text-slate-800"
                    >
                      <td className="py-3 px-2 text-emerald-700 font-semibold">
                        {pedido.codigo}
                      </td>
                      <td className="py-3 px-2">{pedido.cliente}</td>
                      <td className="py-3 px-2">{pedido.fecha}</td>
                      <td className="py-3 px-2">
                        S/ {pedido.total.toFixed(2)}
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${badgeColors[pedido.estado]}`}
                        >
                          {pedido.estado}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-2 flex gap-2">
                        <button
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-emerald-700"
                        >
                          ✓ Validar
                        </button>
                        <button
                          className="inline-flex items-center gap-1 rounded-xl bg-red-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-red-700"
                        >
                          ✕ Rechazar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ValidacionesPedido;

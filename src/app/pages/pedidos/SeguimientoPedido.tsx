import { AppLayout } from "@/app/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { ListChecks, Search, Printer, X, Tag, Share2, Receipt, Package, MapPin, User, Briefcase, Truck } from "lucide-react";
import React, { useMemo, useState } from "react";
import ReactSelect from "react-select";
import { pdf } from "@react-pdf/renderer";
import PedidoComprobantePDF from "./components/PedidoComprobantePDF";

type EstadoPedido =
  | "Ingresada"
  | "Incidencia"
  | "Confirmada"
  | "Cancelada"
  | "Listo Despacho"
  | "En Ruta"
  | "Cancelada Retornar"
  | "En Retorno"
  | "Retornada"
  | "Entregada"
  | "Liquidada";

type EstadoPago = "Pendiente" | "Pagado";

type EstadoFacturacion = "Pendiente" | "Facturado" | "Anulado" | "Por Anular";

export type Pedido = {
  codigo: string;
  cliente: string;
  telefono: string;
  total: number;
  asesor: string;
  estadoPedido: EstadoPedido;
  estadoPago: EstadoPago;
  estadoFacturacion: EstadoFacturacion;
  fechaIngreso: string;
  fechaConfirmacion: string;
  fechaPactada: string;
  fechaEntrega: string;
};

type SelectOption = { value: string; label: string };

type PedidoHistoryItem = {
  id: number;
  titulo: string;
  fechaHora: string;
  descripcion?: string;
};

type ToastState =
  | {
      msg: string;
      type: "success" | "error";
    }
  | null;

const mockPedidos: Pedido[] = [
  {
    codigo: "PED001",
    cliente: "Juan Pérez",
    telefono: "987654321",
    total: 150,
    asesor: "Carlos Mendoza",
    estadoPedido: "Entregada",
    estadoPago: "Pendiente",
    estadoFacturacion: "Facturado",
    fechaIngreso: "15/11/2025 - 14:30",
    fechaConfirmacion: "15/11/2025 - 15:45",
    fechaPactada: "16/11/2025",
    fechaEntrega: "16/11/2025",
  },
  {
    codigo: "PED002",
    cliente: "María García",
    telefono: "999888777",
    total: 250,
    asesor: "María López",
    estadoPedido: "En Ruta",
    estadoPago: "Pendiente",
    estadoFacturacion: "Facturado",
    fechaIngreso: "16/11/2025 - 09:15",
    fechaConfirmacion: "16/11/2025 - 10:30",
    fechaPactada: "17/11/2025",
    fechaEntrega: "17/11/2025",
  },
  {
    codigo: "PED003",
    cliente: "Carlos López",
    telefono: "955444333",
    total: 180,
    asesor: "Pedro Ramos",
    estadoPedido: "Confirmada",
    estadoPago: "Pendiente",
    estadoFacturacion: "Pendiente",
    fechaIngreso: "17/11/2025 - 11:20",
    fechaConfirmacion: "17/11/2025 - 12:00",
    fechaPactada: "18/11/2025",
    fechaEntrega: "-",
  },
  {
    codigo: "PED004",
    cliente: "Ana Martínez",
    telefono: "912345678",
    total: 320,
    asesor: "Carlos Mendoza",
    estadoPedido: "Cancelada",
    estadoPago: "Pendiente",
    estadoFacturacion: "Anulado",
    fechaIngreso: "18/11/2025 - 16:45",
    fechaConfirmacion: "-",
    fechaPactada: "19/11/2025",
    fechaEntrega: "-",
  },
];

const badgePedidoColors: Record<EstadoPedido, string> = {
  Ingresada: "bg-sky-100 text-sky-700 border-sky-200",
  Incidencia: "bg-orange-100 text-orange-700 border-orange-200",
  Confirmada: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Cancelada: "bg-rose-100 text-rose-700 border-rose-200",
  "Listo Despacho": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "En Ruta": "bg-amber-100 text-amber-700 border-amber-200",
  "Cancelada Retornar": "bg-rose-100 text-rose-700 border-rose-200",
  "En Retorno": "bg-yellow-100 text-yellow-700 border-yellow-200",
  Retornada: "bg-slate-100 text-slate-700 border-slate-200",
  Entregada: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Liquidada: "bg-teal-100 text-teal-700 border-teal-200",
};

const badgeFacturacionColors: Record<EstadoFacturacion, string> = {
  Pendiente: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Facturado: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Anulado: "bg-rose-100 text-rose-700 border-rose-200",
  "Por Anular": "bg-orange-100 text-orange-700 border-orange-200",
};

const estadoPedidoOptions: SelectOption[] = [
  { value: "Todos", label: "Todos" },
  { value: "Ingresada", label: "Ingresada" },
  { value: "Incidencia", label: "Incidencia" },
  { value: "Confirmada", label: "Confirmada" },
  { value: "Cancelada", label: "Cancelada" },
  { value: "Listo Despacho", label: "Listo Despacho" },
  { value: "En Ruta", label: "En Ruta" },
  { value: "Cancelada Retornar", label: "Cancelada Retornar" },
  { value: "En Retorno", label: "En Retorno" },
  { value: "Retornada", label: "Retornada" },
  { value: "Entregada", label: "Entregada" },
  { value: "Liquidada", label: "Liquidada" },
];

const estadoPedidoOptionsModal: SelectOption[] = estadoPedidoOptions.filter(
  (o) => o.value !== "Todos"
);

const estadoFacturacionOptions: SelectOption[] = [
  { value: "Todos", label: "Todos" },
  { value: "Pendiente", label: "Pendiente" },
  { value: "Facturado", label: "Facturado" },
  { value: "Anulado", label: "Anulado" },
  { value: "Por Anular", label: "Por Anular" },
];

const estadoFacturacionOptionsModal: SelectOption[] =
  estadoFacturacionOptions.filter((o) => o.value !== "Todos");

const estadoPagoOptions: SelectOption[] = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "Pagado", label: "Pagado" },
];

const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    borderRadius: 12,
    borderColor: state.isFocused ? "#059669" : "#E5E7EB",
    boxShadow: state.isFocused ? "0 0 0 1px rgba(16,185,129,0.20)" : "none",
    minHeight: 44,
    backgroundColor: "#F9FAFB",
    "&:hover": {
      borderColor: state.isFocused ? "#059669" : "#CBD5F5",
    },
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: "0 10px",
  }),
  multiValue: (base: any) => ({
    ...base,
    borderRadius: 999,
    paddingInline: 4,
    fontSize: 12,
  }),
  option: (base: any, state: any) => ({
    ...base,
    fontSize: 14,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: state.isFocused
      ? "rgba(16,185,129,0.08)"
      : state.isSelected
      ? "rgba(16,185,129,0.15)"
      : "white",
    color: state.isSelected ? "#047857" : "#111827",
  }),
  menu: (base: any) => ({
    ...base,
    borderRadius: 12,
    overflow: "hidden",
  }),
  placeholder: (base: any) => ({
    ...base,
    fontSize: 14,
    color: "#9CA3AF",
  }),
};

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100";

// -------- Helpers de fecha --------
function parseFecha(fechaStr: string): Date | null {
  if (!fechaStr || fechaStr === "-") return null;
  const parts = fechaStr.split(" - ");
  if (parts.length === 2) {
    const [fecha, hora] = parts;
    const [d, m, y] = fecha.split("/");
    return new Date(`${y}-${m}-${d}T${hora}`);
  }
  const [d, m, y] = fechaStr.split("/");
  return new Date(`${y}-${m}-${d}T00:00:00`);
}

function formatNow(): string {
  const date = new Date();
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${d}/${m}/${y} - ${hh}:${mm}`;
}

function getInitialHistory(pedido: Pedido): PedidoHistoryItem[] {
  return [
    {
      id: 1,
      titulo: "Pedido creado",
      fechaHora: pedido.fechaIngreso,
      descripcion: `Estado: ${pedido.estadoPedido} | Pago: ${pedido.estadoPago} | Facturación: ${pedido.estadoFacturacion}`,
    },
    {
      id: 2,
      titulo: "En espera de confirmación de pago",
      fechaHora: "Próximo paso automático",
      descripcion: "",
    },
  ];
}

const SeguimientoPedido: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>(mockPedidos);

  const [codigoSearch, setCodigoSearch] = useState("");
  const [clienteSearch, setClienteSearch] = useState("");
  const [telefonoSearch, setTelefonoSearch] = useState("");
  const [telefonoFilter, setTelefonoFilter] = useState("");

  const [estadoPedidoSelected, setEstadoPedidoSelected] =
    useState<SelectOption[]>([estadoPedidoOptions[0],
  ]);
  const [estadoPagoSelected, setEstadoPagoSelected] =
    useState<SelectOption[]>([estadoPagoOptions[0]]);
  const [estadoFacturacionSelected, setEstadoFacturacionSelected] =
    useState<SelectOption[]>([estadoFacturacionOptions[0]]);

  const [fechaIngresoDesde, setFechaIngresoDesde] = useState("");
  const [fechaIngresoHasta, setFechaIngresoHasta] = useState("");
  const [fechaPactadaDesde, setFechaPactadaDesde] = useState("");
  const [fechaPactadaHasta, setFechaPactadaHasta] = useState("");
  const [fechaConfirmacionDesde, setFechaConfirmacionDesde] = useState("");
  const [fechaConfirmacionHasta, setFechaConfirmacionHasta] = useState("");
  const [fechaEntregaDesde, setFechaEntregaDesde] = useState("");
  const [fechaEntregaHasta, setFechaEntregaHasta] = useState("");

  const [selectedCodigos, setSelectedCodigos] = useState<string[]>([]);

  const [toastMsg, setToastMsg] = useState<ToastState>(null);

  const [modalActualizarOpen, setModalActualizarOpen] = useState(false);
  const [pedidoEnEdicion, setPedidoEnEdicion] = useState<Pedido | null>(null);

  const [estadoPedidoModal, setEstadoPedidoModal] =
    useState<EstadoPedido>("Ingresada");
  const [estadoPagoModal, setEstadoPagoModal] =
    useState<EstadoPago>("Pendiente");
  const [estadoFacturacionModal, setEstadoFacturacionModal] =
    useState<EstadoFacturacion>("Pendiente");

  const [initialEstadoPedido, setInitialEstadoPedido] =
    useState<EstadoPedido>("Ingresada");
  const [initialEstadoPago, setInitialEstadoPago] =
    useState<EstadoPago>("Pendiente");
  const [initialEstadoFacturacion, setInitialEstadoFacturacion] =
    useState<EstadoFacturacion>("Pendiente");

  const [historial, setHistorial] = useState<PedidoHistoryItem[]>([]);

  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);

  const showToast = (msg: string, type: "error" | "success" = "error") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      const allCodes = pedidos.map((p) => p.codigo);
      setSelectedCodigos(allCodes);
    } else {
      setSelectedCodigos([]);
    }
  };

  const handleToggleRow = (codigo: string, checked: boolean) => {
    setSelectedCodigos((prev) => {
      if (checked) {
        if (prev.includes(codigo)) return prev;
        return [...prev, codigo];
      }
      return prev.filter((c) => c !== codigo);
    });
  };

  const applyTelefonoSearch = () => {
    setTelefonoFilter(telefonoSearch.trim());
  };

  const filtered = useMemo(() => {
    const codigoTerms = codigoSearch
      .toLowerCase()
      .split(/\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const clienteTerms = clienteSearch
      .toLowerCase()
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const pedidoValues = estadoPedidoSelected.map((o) => o.value);
    const facturacionValues = estadoFacturacionSelected.map((o) => o.value);
    const pagoValues = estadoPagoSelected.map((o) => o.value);

    const filterByEstadoPedido =
      estadoPedidoSelected.length > 0 && !pedidoValues.includes("Todos");
    const filterByEstadoPago =
      estadoFacturacionSelected.length > 0 && !facturacionValues.includes("Todos");
    const filterByEstadoFacturacion =
      estadoFacturacionSelected.length > 0 && !facturacionValues.includes("Todos");

    return pedidos.filter((p) => {
      if (codigoTerms.length > 0) {
        const matchCodigo = codigoTerms.some((term) =>
          p.codigo.toLowerCase().includes(term)
        );
        if (!matchCodigo) return false;
      }

      if (clienteTerms.length > 0) {
        const matchCliente = clienteTerms.some((term) =>
          p.cliente.toLowerCase().includes(term)
        );
        if (!matchCliente) return false;
      }

      if (telefonoFilter) {
        if (!p.telefono.includes(telefonoFilter)) return false;
      }

      if (filterByEstadoPedido) {
        if (!pedidoValues.includes(p.estadoPedido)) return false;
      }

      if (filterByEstadoPago) {
        if (!pagoValues.includes(p.estadoPago)) return false;
      }

      if (filterByEstadoFacturacion) {
        if (!facturacionValues.includes(p.estadoFacturacion)) return false;
      }

      const ingresoDate = parseFecha(p.fechaIngreso);
      if (fechaIngresoDesde) {
        const from = new Date(`${fechaIngresoDesde}T00:00:00`);
        if (!ingresoDate || ingresoDate < from) return false;
      }
      if (fechaIngresoHasta) {
        const to = new Date(`${fechaIngresoHasta}T23:59:59`);
        if (!ingresoDate || ingresoDate > to) return false;
      }

      const confirmDate = parseFecha(p.fechaConfirmacion);
      if (fechaConfirmacionDesde) {
        const from = new Date(`${fechaConfirmacionDesde}T00:00:00`);
        if (!confirmDate || confirmDate < from) return false;
      }
      if (fechaConfirmacionHasta) {
        const to = new Date(`${fechaConfirmacionHasta}T23:59:59`);
        if (!confirmDate || confirmDate > to) return false;
      }

      const pactadaDate = parseFecha(p.fechaPactada);
      if (fechaPactadaDesde) {
        const from = new Date(`${fechaPactadaDesde}T00:00:00`);
        if (!pactadaDate || pactadaDate < from) return false;
      }
      if (fechaPactadaHasta) {
        const to = new Date(`${fechaPactadaHasta}T23:59:59`);
        if (!pactadaDate || pactadaDate > to) return false;
      }

      const entregaDate = parseFecha(p.fechaEntrega);
      if (fechaEntregaDesde) {
        const from = new Date(`${fechaEntregaDesde}T00:00:00`);
        if (!entregaDate || entregaDate < from) return false;
      }
      if (fechaEntregaHasta) {
        const to = new Date(`${fechaEntregaHasta}T23:59:59`);
        if (!entregaDate || entregaDate > to) return false;
      }

      return true;
    });
  }, [
    pedidos,
    codigoSearch,
    clienteSearch,
    telefonoFilter,
    estadoPedidoSelected,
    estadoFacturacionSelected,
    fechaIngresoDesde,
    fechaIngresoHasta,
    fechaConfirmacionDesde,
    fechaConfirmacionHasta,
    fechaPactadaDesde,
    fechaPactadaHasta,
    fechaEntregaDesde,
    fechaEntregaHasta,
  ]);

  const allSelected =
    filtered.length > 0 &&
    filtered.every((p) => selectedCodigos.includes(p.codigo));

  const hasSelection = selectedCodigos.length > 0;

  const printButtonClasses = hasSelection
    ? "inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
    : "inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-300 border border-emerald-100 cursor-not-allowed";

  const abrirModalActualizar = (pedido: Pedido) => {
    setPedidoEnEdicion(pedido);
    setEstadoPedidoModal(pedido.estadoPedido);
    setEstadoPagoModal(pedido.estadoPago);
    setEstadoFacturacionModal(pedido.estadoFacturacion);

    setInitialEstadoPedido(pedido.estadoPedido);
    setInitialEstadoPago(pedido.estadoPago);
    setInitialEstadoFacturacion(pedido.estadoFacturacion);

    setHistorial(getInitialHistory(pedido));
    setModalActualizarOpen(true);
  };

  const cerrarModalActualizar = () => {
    setModalActualizarOpen(false);
    setPedidoEnEdicion(null);
  };

  const cambiosPendientes =
    pedidoEnEdicion &&
    (estadoPedidoModal !== initialEstadoPedido ||
      estadoPagoModal !== initialEstadoPago ||
      estadoFacturacionModal !== initialEstadoFacturacion);

  const handleClickGuardar = () => {
    if (!cambiosPendientes) {
      showToast("No hay cambios para guardar.", "error");
      return;
    }
    setModalConfirmOpen(true);
  };

  const cancelarConfirmacion = () => {
    setModalConfirmOpen(false);
  };

  const guardarActualizacion = () => {
    if (!pedidoEnEdicion) return;

    try {
      setPedidos((prev) =>
        prev.map((p) =>
          p.codigo === pedidoEnEdicion.codigo
            ? {
                ...p,
                estadoPedido: estadoPedidoModal,
                estadoPago: estadoPagoModal,
                estadoFacturacion: estadoFacturacionModal,
              }
            : p
        )
      );

      setPedidoEnEdicion((prev) =>
        prev
          ? {
              ...prev,
              estadoPedido: estadoPedidoModal,
              estadoPago: estadoPagoModal,
              estadoFacturacion: estadoFacturacionModal,
            }
          : prev
      );

      setHistorial((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          titulo: "Actualización de estados",
          fechaHora: formatNow(),
          descripcion: `Estado: ${estadoPedidoModal} | Pago: ${estadoPagoModal} | Facturación: ${estadoFacturacionModal}`,
        },
      ]);

      setInitialEstadoPedido(estadoPedidoModal);
      setInitialEstadoPago(estadoPagoModal);
      setInitialEstadoFacturacion(estadoFacturacionModal);

      showToast("Estado del pedido actualizado correctamente.", "success");
    } catch (err) {
      console.error(err);
      showToast("Ocurrió un error al actualizar el estado.", "error");
    }
  };

  const confirmarGuardar = () => {
    guardarActualizacion();
    setModalConfirmOpen(false);
  };

  const handleImprimirComprobante = async () => {
    if (!pedidoEnEdicion) return;

    const blob = await pdf(
      <PedidoComprobantePDF pedido={pedidoEnEdicion} />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <AppLayout title="Seguimiento Pedido">
      {toastMsg && (
        <Toast
          message={toastMsg.msg}
          type={toastMsg.type}
          onClose={() => setToastMsg(null)}
        />
      )}

      <div className="h-full w-full bg-slate-50">
        <div className="text-sm text-gray-500">
          Gestionar Pedidos <span className="mx-1">›</span>
          <span className="text-gray-800">Seguimiento Pedido</span>
        </div>

        <Card className="mt-6">
          <SectionTitle icon={ListChecks}>Lista de Pedidos</SectionTitle>

          <div className="px-6 py-6 space-y-6 bg-white rounded-br-2xl rounded-bl-2xl rounded-tr-none rounded-tl-none">
            <div>
              <button className={printButtonClasses} disabled={!hasSelection}>
                <Printer className="w-4 h-4" />
                <span>
                  Imprimir Ordenes: {selectedCodigos.length} seleccionadas
                </span>
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-[1.2fr_1.2fr_1.2fr_auto]">
              <input
                type="text"
                value={codigoSearch}
                onChange={(e) => setCodigoSearch(e.target.value)}
                placeholder="Buscar por código..."
                className={inputClasses}
              />
              <input
                type="text"
                value={clienteSearch}
                onChange={(e) => setClienteSearch(e.target.value)}
                placeholder="Buscar por cliente..."
                className={inputClasses}
              />
              <input
                type="text"
                value={telefonoSearch}
                onChange={(e) => setTelefonoSearch(e.target.value)}
                placeholder="Buscar por teléfono..."
                className={inputClasses}
              />
              <button
                type="button"
                onClick={applyTelefonoSearch}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
              >
                <Search className="w-5 h-5 mr-2" />
                Buscar
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Estado Pedido
                </label>
                <ReactSelect
                  isMulti
                  options={estadoPedidoOptions}
                  value={estadoPedidoSelected}
                  onChange={(value) =>
                    setEstadoPedidoSelected(value as SelectOption[])
                  }
                  styles={selectStyles}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Estado Facturación
                </label>
                <ReactSelect
                  isMulti
                  options={estadoFacturacionOptions}
                  value={estadoFacturacionSelected}
                  onChange={(value) =>
                    setEstadoFacturacionSelected(value as SelectOption[])
                  }
                  styles={selectStyles}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Fecha Ingreso
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={fechaIngresoDesde}
                    onChange={(e) => setFechaIngresoDesde(e.target.value)}
                    className={inputClasses}
                  />
                  <input
                    type="date"
                    value={fechaIngresoHasta}
                    onChange={(e) => setFechaIngresoHasta(e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Fecha Pactada
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={fechaPactadaDesde}
                    onChange={(e) => setFechaPactadaDesde(e.target.value)}
                    className={inputClasses}
                  />
                  <input
                    type="date"
                    value={fechaPactadaHasta}
                    onChange={(e) => setFechaPactadaHasta(e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
              <div className="space-y-1 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  Fecha Confirmación
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={fechaConfirmacionDesde}
                    onChange={(e) =>
                      setFechaConfirmacionDesde(e.target.value)
                    }
                    className={inputClasses}
                  />
                  <input
                    type="date"
                    value={fechaConfirmacionHasta}
                    onChange={(e) =>
                      setFechaConfirmacionHasta(e.target.value)
                    }
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="space-y-1 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  Fecha Entrega
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={fechaEntregaDesde}
                    onChange={(e) => setFechaEntregaDesde(e.target.value)}
                    className={inputClasses}
                  />
                  <input
                    type="date"
                    value={fechaEntregaHasta}
                    onChange={(e) => setFechaEntregaHasta(e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="text-left text-sm text-slate-600 border-b border-slate-200">
                    <th className="py-3 px-2 w-10">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        checked={allSelected}
                        onChange={(e) => handleToggleAll(e.target.checked)}
                      />
                    </th>
                    <th className="py-3 px-2">Código</th>
                    <th className="py-3 px-2">Cliente</th>
                    <th className="py-3 px-2">Total</th>
                    <th className="py-3 px-2">Asesor</th>
                    <th className="py-3 px-2">Estado Pedido</th>
                    <th className="py-3 px-2">Estado Facturación</th>
                    <th className="py-3 px-2">Fecha y hora de Ingreso</th>
                    <th className="py-3 px-2">Fecha y hora de Confirmación</th>
                    <th className="py-3 px-2">Fecha Pactada</th>
                    <th className="py-3 px-2">Fecha de Entrega</th>
                    <th className="py-3 px-2">Gestión</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((pedido) => (
                    <tr
                      key={pedido.codigo}
                      className="border-b border-slate-100 text-sm text-slate-800"
                    >
                      <td className="py-3 px-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          checked={selectedCodigos.includes(pedido.codigo)}
                          onChange={(e) =>
                            handleToggleRow(pedido.codigo, e.target.checked)
                          }
                        />
                      </td>
                      <td className="py-3 px-2 text-emerald-700 font-semibold">
                        {pedido.codigo}
                      </td>
                      <td className="py-3 px-2">{pedido.cliente}</td>
                      <td className="py-3 px-2">
                        S/ {pedido.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-2">{pedido.asesor}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${badgePedidoColors[pedido.estadoPedido]}`}
                        >
                          {pedido.estadoPedido}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${badgeFacturacionColors[pedido.estadoFacturacion]}`}
                        >
                          {pedido.estadoFacturacion}
                        </span>
                      </td>
                      <td className="py-3 px-2">{pedido.fechaIngreso}</td>
                      <td className="py-3 px-2">
                        {pedido.fechaConfirmacion}
                      </td>
                      <td className="py-3 px-2">{pedido.fechaPactada}</td>
                      <td className="py-3 px-2">{pedido.fechaEntrega}</td>
                      <td className="py-3 px-2">
                        <button
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-600 text-emerald-700 px-4 py-1.5 text-xs font-semibold hover:bg-emerald-50"
                          type="button"
                          onClick={() => abrirModalActualizar(pedido)}
                        >
                          ✏️ Actualizar Estados
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-slate-500 mt-2">
              Mostrando {filtered.length} de {pedidos.length} pedidos
            </p>
          </div>
        </Card>
      </div>

      {modalActualizarOpen && pedidoEnEdicion && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-0 relative max-h-[90vh] flex flex-col">
            <div className="flex flex-col items-start justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex justify-end">
                <button
                  className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                  onClick={cerrarModalActualizar}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex justify-between w-full mt-6">
                <div>
                  <h2 className="text-sm font-semibold text-emerald-700">
                    Pedido Generado
                  </h2>
                  <p className="text-xs text-red-500">
                    El pedido se ha creado exitosamente
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <p className="text-xs text-slate-500">
                    {pedidoEnEdicion.fechaIngreso}
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {pedidoEnEdicion.codigo}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 space-y-5 overflow-y-auto">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">
                    Estado del Pedido
                  </p>
                  <ReactSelect
                    options={estadoPedidoOptionsModal}
                    placeholder="Seleccione estado"
                    value={estadoPedidoOptionsModal.find(
                      (e) => e.value === estadoPedidoModal
                    )}
                    onChange={(opt) =>
                      setEstadoPedidoModal(
                        (opt?.value as EstadoPedido) || estadoPedidoModal
                      )
                    }
                    styles={selectStyles}
                  />
                  <p className="text-[11px] text-slate-500">
                    Estado actual:{" "}
                    <span className="font-semibold text-slate-700">
                      {initialEstadoPedido}
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">
                    Estado de Pago
                  </p>
                  <ReactSelect
                    options={estadoPagoOptions}
                    placeholder="Seleccione estado"
                    value={estadoPagoOptions.find(
                      (e) => e.value === estadoPagoModal
                    )}
                    onChange={(opt) =>
                      setEstadoPagoModal(
                        (opt?.value as EstadoPago) || estadoPagoModal
                      )
                    }
                    styles={selectStyles}
                  />
                  <p className="text-[11px] text-slate-500">
                    Estado actual:{" "}
                    <span className="font-semibold text-slate-700">
                      {initialEstadoPago}
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">
                    Estado de Facturación
                  </p>
                  <ReactSelect
                    options={estadoFacturacionOptionsModal}
                    placeholder="Seleccione estado"
                    value={estadoFacturacionOptionsModal.find(
                      (e) => e.value === estadoFacturacionModal
                    )}
                    onChange={(opt) =>
                      setEstadoFacturacionModal(
                        (opt?.value as EstadoFacturacion) ||
                          estadoFacturacionModal
                      )
                    }
                    styles={selectStyles}
                  />
                  <p className="text-[11px] text-slate-500">
                    Estado actual:{" "}
                    <span className="font-semibold text-slate-700">
                      {initialEstadoFacturacion}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="border rounded-2xl p-4 bg-white">
                  <p className="flex gap-1 text-sm font-semibold text-gray-800 mb-1">
                    <User size={20} color="#0E9F6E" />
                    Información del Cliente
                  </p>

                  <p className="text-xs text-gray-500 mt-1">Nombre completo</p>
                  <p className="text-sm text-gray-800">
                    {pedidoEnEdicion.cliente}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">Documento</p>
                  <p className="text-sm text-gray-800">DNI: 12345678</p>

                  <p className="text-xs text-gray-500 mt-2">Teléfono</p>
                  <p className="text-sm text-gray-800">
                    +51 {pedidoEnEdicion.telefono}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">Dirección</p>
                  <p className="text-sm text-gray-800">
                    Av. Los Olivos 123, San Isidro, Lima
                  </p>

                  <p className="text-xs text-gray-500 mt-2">Distrito</p>
                  <p className="text-sm text-gray-800">San Isidro - Lima</p>
                </div>

                <div className="border rounded-2xl p-4 bg-white">
                  <p className="flex gap-1 text-sm font-semibold text-gray-800 mb-1">
                    <Briefcase size={20} color="#0E9F6E" />
                    Información del Asesor
                  </p>

                  <p className="text-xs text-gray-500 mt-1">Asesor</p>
                  <p className="text-sm text-gray-800">
                    {pedidoEnEdicion.asesor}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">Supervisor</p>
                  <p className="text-sm text-gray-800">Ana Torres</p>

                  <p className="text-xs text-gray-500 mt-2">Medio</p>
                  <p className="text-sm text-gray-800">WhatsApp</p>

                  <p className="text-xs text-gray-500 mt-2">Método de pago</p>
                  <p className="text-sm text-gray-800">Yape</p>
                </div>

                <div className="border rounded-2xl p-4 bg-white">
                  <p className="flex gap-1 text-sm font-semibold text-gray-800 mb-1">
                    <Truck size={20} color="#0E9F6E" />
                    Información de Envío
                  </p>

                  <p className="text-xs text-gray-500 mt-1">Tipo de entrega</p>
                  <p className="text-sm text-gray-800">Delivery</p>

                  <p className="text-xs text-gray-500 mt-2">Provincia</p>
                  <p className="text-sm text-gray-800">Lima</p>

                  <p className="text-xs text-gray-500 mt-2">
                    Medio de envío delivery
                  </p>
                  <p className="text-sm text-gray-800">Shalom</p>

                  <p className="text-xs text-gray-500 mt-2">
                    Fecha de entrega pactada
                  </p>
                  <p className="text-sm text-gray-800">
                    {pedidoEnEdicion.fechaPactada}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">Horario</p>
                  <p className="text-sm text-gray-800">09:00 AM - 6:00 PM</p>

                  <p className="text-xs text-gray-500 mt-2">Costo de envío</p>
                  <p className="text-sm text-gray-800">S/ 15.00</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-4 border rounded-2xl p-4 bg-white">
                  <p className="flex gap-1 text-sm font-semibold text-gray-800 mb-3">
                    <Package size={20} color="#0E9F6E" />
                    Productos del Pedido
                  </p>

                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="py-1 text-left">Producto</th>
                        <th className="py-1 text-left">Precio Base</th>
                        <th className="py-1 text-left">Descuento</th>
                        <th className="py-1 text-left">
                          Precio con Descuento
                        </th>
                        <th className="py-1 text-left">Cantidad</th>
                        <th className="py-1 text-left">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-slate-100">
                        <td className="py-2 text-left">
                          <p className="text-xs text-gray-800">
                            Suplemento Multivitamínico
                          </p>
                          <p className="text-[11px] text-gray-500">
                            COD: SUP-001
                          </p>
                        </td>
                        <td className="py-2 text-left text-xs text-gray-800">
                          S/ 95.00
                        </td>
                        <td className="py-2 text-left text-xs text-emerald-600">
                          10%
                        </td>
                        <td className="py-2 text-left text-xs text-gray-800">
                          S/ 76.50
                        </td>
                        <td className="py-2 text-left text-xs text-gray-800">
                          2
                        </td>
                        <td className="py-2 text-left text-xs text-gray-800">
                          S/ 153.00
                        </td>
                      </tr>

                      <tr className="border-t border-slate-100">
                        <td className="py-2 text-left">
                          <p className="text-xs text-gray-800">Té Verde Detox</p>
                          <p className="text-[11px] text-gray-500">
                            COD: TEA-002
                          </p>
                        </td>
                        <td className="py-2 text-left text-xs text-gray-800">
                          S/ 35.00
                        </td>
                        <td className="py-2 text-left text-xs text-emerald-600">
                          0%
                        </td>
                        <td className="py-2 text-left text-xs text-gray-800">
                          S/ 35.00
                        </td>
                        <td className="py-2 text-left text-xs text-gray-800">
                          1
                        </td>
                        <td className="py-2 text-left text-xs text-gray-800">
                          S/ 35.00
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="md:col-span-4 space-y-4">
                  <div className="border rounded-2xl p-4 bg-white">
                    <p className="flex gap-1 text-sm font-semibold text-gray-800 mb-2">
                      <MapPin size={20} color="#0E9F6E" />
                      Indicaciones de Entrega
                    </p>
                    <p className="text-xs text-gray-600">
                      Entregar preferiblemente en horario de mañana. Tocar el
                      timbre dos veces. Si no hay nadie, coordinar nueva fecha
                      de entrega.
                    </p>
                  </div>

                  <div className="border rounded-2xl p-4 bg-white">
                    <p className="flex gap-1 text-sm font-semibold text-gray-800 mb-2">
                      <Receipt size={20} color="#0E9F6E" />
                      Resumen del Pedido
                    </p>

                    <div className="space-y-1 text-xs text-gray-700">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>S/ {pedidoEnEdicion.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Descuento total</span>
                        <span>- S/ 8.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Costo de envío</span>
                        <span>S/ 15.00</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-1 border-t border-slate-100 mt-1">
                        <span>Total</span>
                        <span>
                          S/{" "}
                          {(pedidoEnEdicion.total - 8.5 + 15)
                            .toFixed(2)
                            .toString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  type="button"
                  onClick={handleImprimirComprobante}
                  className="flex gap-1 items-center justify-center rounded-md bg-emerald-700 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800"
                >
                  <Printer size={20} color="#fff" />
                  Imprimir Comprobante
                </button>
                <button
                  type="button"
                  className="flex gap-1 items-center justify-center rounded-md bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  <Tag size={20} color="#fff" />
                  Imprimir Etiqueta Envío
                </button>
                <button
                  type="button"
                  className="flex gap-1 items-center justify-center rounded-md bg-emerald-500 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600"
                >
                  <Share2 size={20} color="#fff" />
                  Compartir por WhatsApp
                </button>
              </div>

              <div className="mt-2 border rounded-2xl p-4 bg-white">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Historial del Pedido
                </h3>

                {historial.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Aún no hay movimientos registrados para este pedido.
                  </p>
                ) : (
                  <div className="border-t pt-3">
                    {historial.map((h, idx) => {
                      const esUltimo = idx === historial.length - 1;
                      const numero = idx + 1;

                      return (
                        <div
                          key={h.id}
                          className="flex items-start gap-2 mt-2"
                        >
                          <div className="flex flex-col items-center mt-1 min-h-[40px]">
                            <div
                              className={
                                esUltimo
                                  ? "w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs"
                                  : "w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs"
                              }
                            >
                              {esUltimo ? "✓" : numero}
                            </div>
                            {idx < historial.length - 1 && (
                              <div className="w-px flex-1 bg-gray-300" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-800">
                              {h.titulo}
                            </div>
                            <div className="text-xs text-gray-500">
                              {h.fechaHora} · Carlos Mendoza
                            </div>

                            {h.descripcion && (
                              <div className="text-xs text-gray-700 mt-1">
                                {h.descripcion}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {cambiosPendientes && (
                <div className="flex justify-center pb-2">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8"
                    onClick={handleClickGuardar}
                  >
                    Guardar Cambios
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {modalConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-lg p-6 relative">
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={cancelarConfirmacion}
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-semibold text-gray-800">
              Confirmar actualización
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              ¿Está seguro de actualizar el estado de este pedido? Se
              registrará un nuevo movimiento en el historial.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={cancelarConfirmacion}>
                Cancelar
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={confirmarGuardar}
              >
                Sí, actualizar
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default SeguimientoPedido;

import { AppLayout } from "@/app/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/sectionTitle";
import { Toast } from "@/components/ui/toast";
import { ListChecks, Search, Printer, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import ReactSelect from "react-select";
import { PedidoService } from "@/services/pedidoService";
import ActualizarPagoModal from "./components/ActualizarPagoModal";
import ActualizarEstadosModal from "./components/ActualizarEstadosModal";
import ActualizarFacturacionModal from "./components/ActualizarFacturacionModal";
import type { EstadoOperacion, EstadoFacturacion } from "@/types/EstadosPedido";

type EstadoPago =
  | "Pendiente"
  | "Adelanto"
  | "Pagado"
  | "Reembolsado"
  | "Reembolsado Parcial";

type Pedido = {
  id_Pedido: number;
  codigo: string;
  cliente: string;
  telefono: string;
  total: number;
  asesor: string;
  estadoPedido: EstadoOperacion;
  estadoPago: EstadoPago;
  estadoFacturacion: EstadoFacturacion;
  fechaIngreso: string;
  fechaConfirmacion: string;
  fechaPactada: string;
  fechaEntrega: string;
  medio: string;
  sede: string;
};

type SelectOption = {
  value: string;
  label: string;
};

type ToastState =
  | null
  | {
    msg: string;
    type: "success" | "error";
  };

type PagoAgregadoTemp = {
  id: string;
  medioPagoId: number;
  medioPagoNombre: string;
  monto: number;
};

type PagoHistorialRow = {
  id: string;
  estadoNombre: string;
  fecha: string;
  usuario: string;
  detalle: string;
  monto: number;
  medioPagoNombre: string;
};

type PedidoPagoPersistente = {
  estadoPagoId: number;
  totalPagado: number;
  historial: PagoHistorialRow[];
  bloqueado: boolean;
};

type EstadosActualizados = {
  estadoOperacionNuevo: EstadoOperacion;
  estadoFacturacionNuevo: EstadoFacturacion;
};

const ESTADO_OPERACION_ID_MAP: Record<EstadoOperacion, string> = {
  Ingresada: "1",
  Incidencia: "2",
  Confirmada: "3",
  Cancelada: "4",
  "Listo Despacho": "5",
  "En Ruta": "6",
  "Cancelada Retornar": "7",
  "En Retorno": "8",
  Retornada: "9",
  Reprogramada: "10",
  Entregada: "11",
  Liquidada: "12",
};

const ESTADO_FACTURACION_ID_MAP: Record<EstadoFacturacion, string> = {
  Pendiente: "1",
  Facturado: "2",
  "Re-Facturado": "3",
  "Por Anular": "4",
  Anulado: "5",
};

const badgePedidoColors: Record<EstadoOperacion, string> = {
  Ingresada: "bg-slate-100 text-slate-700 border-slate-200",
  Incidencia: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Confirmada: "bg-blue-100 text-blue-700 border-blue-200",
  Cancelada: "bg-rose-100 text-rose-700 border-rose-200",
  "Listo Despacho": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "En Ruta": "bg-purple-100 text-purple-700 border-purple-200",
  "Cancelada Retornar": "bg-rose-100 text-rose-700 border-rose-200",
  "En Retorno": "bg-orange-100 text-orange-700 border-orange-200",
  Retornada: "bg-slate-100 text-slate-700 border-slate-200",
  Reprogramada: "bg-blue-100 text-blue-700 border-blue-200",
  Entregada: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Liquidada: "bg-teal-100 text-teal-700 border-teal-200",
};

const badgeFacturacionColors: Record<EstadoFacturacion, string> = {
  Pendiente: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Facturado: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Re-Facturado": "bg-emerald-300 text-emerald-800 border-emerald-500",
  "Por Anular": "bg-orange-100 text-orange-700 border-orange-200",
  Anulado: "bg-rose-100 text-rose-700 border-rose-200",
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

const estadoFacturacionOptions: SelectOption[] = [
  { value: "Todos", label: "Todos" },
  { value: "Pendiente", label: "Pendiente" },
  { value: "Facturado", label: "Facturado" },
  { value: "Anulado", label: "Anulado" },
  { value: "Por Anular", label: "Por Anular" },
];

const selectStyles = {
  control: (base: any) => ({
    ...base,
    borderRadius: 9999,
    borderColor: "#E5E7EB",
    minHeight: 40,
    backgroundColor: "#F9FAFB",
    fontSize: 12,
  }),
  placeholder: (base: any) => ({
    ...base,
    fontSize: 12,
    color: "#9CA3AF",
  }),
  menu: (base: any) => ({
    ...base,
    fontSize: 12,
  }),
};

const inputClasses =
  "w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:bg-white focus:outline-none";

const CONTROLES_HABILITADOS = true; // cambia a true cuando quieras habilitar

const SeguimientoPedido: React.FC = () => {
  const userLS = JSON.parse(localStorage.getItem("sn_user") || "{}");
  const esAsesor = userLS?.id_Tipo_Usuario === 8;

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;
  const [totalPages, setTotalPages] = useState(1);


  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [codigoSearch, setCodigoSearch] = useState("");
  const [clienteSearch, setClienteSearch] = useState("");
  const [telefonoSearch, setTelefonoSearch] = useState("");
  const [estadoPedidoSelected, setEstadoPedidoSelected] = useState<
    SelectOption[]
  >([estadoPedidoOptions[0]]);

  const [estadoFacturacionSelected, setEstadoFacturacionSelected] = useState<
    SelectOption[]
  >([estadoFacturacionOptions[0]]);

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

  const [modalFacturacionOpen, setModalFacturacionOpen] = useState(false);
  const [pedidoFacturacionSeleccionado, setPedidoFacturacionSeleccionado] = useState<Pedido | null>(null);

  const [pagosPorPedido, setPagosPorPedido] = useState<
    Record<string, PedidoPagoPersistente>
  >({});
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [pedidoPagoSeleccionado, setPedidoPagoSeleccionado] =
    useState<Pedido | null>(null);

  const [pagosAgregadosTemp, setPagosAgregadosTemp] = useState<
    PagoAgregadoTemp[]
  >([]);

  const abrirModalFacturacion = (p: Pedido) => {
    setPedidoFacturacionSeleccionado(p);
    setModalFacturacionOpen(true);
  };

  const cerrarModalFacturacion = () => {
    setModalFacturacionOpen(false);
    setPedidoFacturacionSeleccionado(null);
  };


  const showToast = (msg: string, type: "success" | "error" = "error") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 2500);
  };

const buildRequestBody = () => {
  const validar = (d: string, h: string) => (d && h) || (!d && !h);

  if (
    !validar(fechaIngresoDesde, fechaIngresoHasta) ||
    !validar(fechaPactadaDesde, fechaPactadaHasta) ||
    !validar(fechaConfirmacionDesde, fechaConfirmacionHasta) ||
    !validar(fechaEntregaDesde, fechaEntregaHasta)
  ) {
    showToast("Debe seleccionar rangos completos (desde y hasta).", "error");
    return null;
  }

  const epSelected = estadoPedidoSelected.map(e => e.value);
  const efSelected = estadoFacturacionSelected.map(e => e.value);

  const op = epSelected.includes("Todos")
    ? Object.values(ESTADO_OPERACION_ID_MAP).join(",")
    : epSelected.map(e => ESTADO_OPERACION_ID_MAP[e as EstadoOperacion]).join(",");

  const fact = efSelected.includes("Todos")
    ? Object.values(ESTADO_FACTURACION_ID_MAP).join(",")
    : efSelected.map(e => ESTADO_FACTURACION_ID_MAP[e as EstadoFacturacion]).join(",");

  const convertDate = (v: string) => {
    if (!v) return "";
    const [y, m, d] = v.split("-");
    return `${d}/${m}/${y}`;
  };

  return {
    number: page,            // ← PAGINACIÓN REAL
    size: PAGE_SIZE,         // ← 5 POR PÁGINA

    id_Pedido: 0,
    Cliente: clienteSearch,
    numero_De_Contacto: telefonoSearch,
    id_Estado_Operacion_Actual: op,
    id_Estado_Facturacion_Actual: fact,

    fechaIngresoPedidoInicio: convertDate(fechaIngresoDesde),
    fechaIngresoPedidoFin: convertDate(fechaIngresoHasta),

    fechaPactadaDeliveryInicio: convertDate(fechaPactadaDesde),
    fechaPactadaDeliveryFin: convertDate(fechaPactadaHasta),

    fechaConfirmacionInicio: convertDate(fechaConfirmacionDesde),
    fechaConfirmacionFin: convertDate(fechaConfirmacionHasta),

    fechaEntregaInicio: convertDate(fechaEntregaDesde),
    fechaEntregaFin: convertDate(fechaEntregaHasta),
  };
};


  useEffect(() => {
    fetchPedidos();
  }, []);

  const formatearFecha = (fecha: any) => {
    if (!fecha) return "-";

    const date = new Date(fecha);

    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const año = date.getFullYear();

    let horas = date.getHours();
    const minutos = date.getMinutes().toString().padStart(2, '0');
    const segundos = date.getSeconds().toString().padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12 || 12;

    return `${dia}/${mes}/${año} ${horas}:${minutos}:${segundos} ${ampm}`;
  };

  useEffect(() => {
  fetchPedidos();
}, [page]);

const fetchPedidos = async () => {
  const body = buildRequestBody();
  if (!body) return;

  try {
    setLoading(true);

    const res = await PedidoService.getSeguimientoPedido(body);

    setTotalPages(res?.data?.totalPages ?? 1);

    const lista = res?.data?.seguimientoPedido ?? [];

    const mapped: Pedido[] = lista.map((item: any) => ({
      id_Pedido: item.id_Pedido,
      codigo: item.codigo_Pedido ?? item.id_Pedido?.toString() ?? "",
      cliente: item.cliente || "",
      telefono: item.numero_De_Contacto || "",
      total: Number(item.monto_Total_Promocional || 0),
      asesor: item.asesor || "",
      estadoPedido: item.estatus_Operacion || "Ingresada",
      estadoPago: item.estatus_Pago || "Pendiente",
      estadoFacturacion: item.estatus_Facturacion || "Pendiente",
      fechaIngreso: item.fecha_Registro_Pedido || "",
      fechaConfirmacion: item.fechaConfirmacion || "",
      fechaPactada: item.fecha_Pactada_Delivery || "",
      fechaEntrega: item.fechaEntrega || "",
      medio: "",
      sede: "",
    }));

    setPedidos(mapped);
  } catch (err) {
    console.error(err);
    showToast("Error consultando pedidos", "error");
  } finally {
    setLoading(false);
  }
};

  const filtered = useMemo(() => {
    let data = [...pedidos];

    if (codigoSearch.trim()) {
      const codes = codigoSearch
        .split(" ")
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean);
      data = data.filter((p) =>
        codes.some((code) => p.codigo.toLowerCase().includes(code))
      );
    }

    if (clienteSearch.trim()) {
      const clientes = clienteSearch
        .split(",")
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean);
      data = data.filter((p) =>
        clientes.some((cli) => p.cliente.toLowerCase().includes(cli))
      );
    }

    if (telefonoSearch.trim()) {
      const tel = telefonoSearch.trim().toLowerCase();
      data = data.filter((p) =>
        p.telefono.toLowerCase().includes(tel)
      );
    }

    const ep = estadoPedidoSelected.map((e) => e.value);
    if (!ep.includes("Todos")) {
      data = data.filter((p) => ep.includes(p.estadoPedido));
    }

    const ef = estadoFacturacionSelected.map((e) => e.value);
    if (!ef.includes("Todos")) {
      data = data.filter((p) => ef.includes(p.estadoFacturacion));
    }

    return data;
  }, [
    pedidos,
    codigoSearch,
    clienteSearch,
    telefonoSearch,
    estadoPedidoSelected,
    estadoFacturacionSelected,
  ]);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const toggleSeleccion = (codigo: string) => {
    setSelectedCodigos((prev) =>
      prev.includes(codigo)
        ? prev.filter((c) => c !== codigo)
        : [...prev, codigo]
    );
  };

  const allSelected =
    filtered.length > 0 &&
    filtered.every((p) => selectedCodigos.includes(p.codigo));

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedCodigos(filtered.map((p) => p.codigo));
    } else {
      setSelectedCodigos([]);
    }
  };

  const abrirModalActualizarEstados = (pedido: Pedido) => {
    setPedidoEnEdicion(pedido);
    setModalActualizarOpen(true);
  };

  const cerrarModalActualizar = () => {
    setModalActualizarOpen(false);
    setPedidoEnEdicion(null);
  };

  const handleGuardarEstados = ({
    estadoOperacionNuevo,
    estadoFacturacionNuevo,
  }: EstadosActualizados) => {
    if (!pedidoEnEdicion) return;

    const nuevosPedidos = pedidos.map((p) =>
      p.codigo === pedidoEnEdicion.codigo
        ? {
          ...p,
          estadoPedido: estadoOperacionNuevo,
          estadoFacturacion: estadoFacturacionNuevo,
        }
        : p
    );

    setPedidos(nuevosPedidos);
    setModalActualizarOpen(false);
    setPedidoEnEdicion(null);
    showToast("Estados actualizados en el pedido.", "success");
  };

  const formatBadge = (estado: EstadoOperacion) =>
    `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${badgePedidoColors[estado]}`;

  const formatBadgeFacturacion = (estado: EstadoFacturacion) =>
    `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${badgeFacturacionColors[estado]}`;

  const abrirModalPago = (p: Pedido) => {
    setPedidoPagoSeleccionado(p);
    setPagosAgregadosTemp([]);
    setModalPagoOpen(true);
  };

  const cerrarModalPago = () => {
    setModalPagoOpen(false);
    setPedidoPagoSeleccionado(null);
  };

  const hasSelection = selectedCodigos.length > 0;

  const handleFacturacionUpdated = async () => {
    await fetchPedidos();
    cerrarModalFacturacion();
    showToast("Facturación actualizada.", "success");
  };

  const handleEstadosOperacionUpdated = async () => {
    await fetchPedidos();           // refresca tabla REAL desde API
    cerrarModalActualizar();        // cierra modal estados
    showToast("Estado del pedido actualizado.", "success");
  };

  return (
    <AppLayout title="Seguimiento de pedidos">
      <div className="space-y-4">
        <div className="text-sm text-gray-500">
          Gestionar Pedido <span className="mx-1">›</span>
          <span className="text-gray-800">Seguimiento de pedidos</span>
        </div>
        <Card>
          <SectionTitle icon={ListChecks}>Lista de Pedidos</SectionTitle>
          <div className="flex flex-col gap-4 bg-white px-6 py-5">

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                className={
                  hasSelection
                    ? "inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm text-white"
                    : "inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm text-emerald-300 border border-emerald-100 cursor-not-allowed"
                }
                disabled={!hasSelection}
              >
                <Printer className="w-4 h-4" />
                Imprimir Órdenes: {selectedCodigos.length}
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-[1.2fr_1.2fr_1.2fr_auto]">
              <input
                type="text"
                value={codigoSearch}
                onChange={(e) => setCodigoSearch(e.target.value)}
                placeholder="Buscar por código (separado por espacio)"
                className={inputClasses}
              />
              <input
                type="text"
                value={clienteSearch}
                onChange={(e) => setClienteSearch(e.target.value)}
                placeholder="Buscar por cliente (separar por comas)"
                className={inputClasses}
              />
              <input
                type="text"
                value={telefonoSearch}
                onChange={(e) => setTelefonoSearch(e.target.value)}
                placeholder="Buscar por teléfono"
                className={inputClasses}
              />

              <button
                type="button"
                onClick={fetchPedidos}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Buscar
                  </>
                )}
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Estado del Pedido
                </label>
                <ReactSelect
                  isMulti
                  options={estadoPedidoOptions}
                  value={estadoPedidoSelected}
                  onChange={(opts) =>
                    setEstadoPedidoSelected(
                      (opts as SelectOption[]) || [estadoPedidoOptions[0]]
                    )
                  }
                  styles={selectStyles}
                  placeholder="Seleccione estado(s)"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Estado de Facturación
                </label>
                <ReactSelect
                  isMulti
                  options={estadoFacturacionOptions}
                  value={estadoFacturacionSelected}
                  onChange={(opts) =>
                    setEstadoFacturacionSelected(
                      (opts as SelectOption[]) || [estadoFacturacionOptions[0]]
                    )
                  }
                  styles={selectStyles}
                  placeholder="Seleccione estado(s)"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Fecha de Ingreso
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={fechaIngresoDesde}
                    onChange={(e) =>
                      setFechaIngresoDesde(e.target.value)
                    }
                    className={inputClasses}
                  />
                  <input
                    type="date"
                    value={fechaIngresoHasta}
                    onChange={(e) =>
                      setFechaIngresoHasta(e.target.value)
                    }
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Fecha Pactada
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={fechaPactadaDesde}
                    onChange={(e) =>
                      setFechaPactadaDesde(e.target.value)
                    }
                    className={inputClasses}
                  />
                  <input
                    type="date"
                    value={fechaPactadaHasta}
                    onChange={(e) =>
                      setFechaPactadaHasta(e.target.value)
                    }
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Fecha de Confirmación
                </label>
                <div className="grid grid-cols-2 gap-2">
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

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Fecha de Entrega
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={fechaEntregaDesde}
                    onChange={(e) =>
                      setFechaEntregaDesde(e.target.value)
                    }
                    className={inputClasses}
                  />
                  <input
                    type="date"
                    value={fechaEntregaHasta}
                    onChange={(e) =>
                      setFechaEntregaHasta(e.target.value)
                    }
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>
          </div>


          <div className="flex flex-col gap-4 bg-white px-6 py-5">

            <div className="border border-slate-200 rounded-2xl overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="py-3 px-2">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) =>
                          toggleAll(e.target.checked)
                        }
                      />
                    </th>
                    <th className="py-3 px-2">Código</th>
                    <th className="py-3 px-2">Cliente</th>
                    <th className="py-3 px-2">Total</th>
                    <th className="py-3 px-2">Asesor</th>
                    <th className="py-3 px-2">Estado Pedido</th>
                    <th className="py-3 px-2">Estado Facturación</th>
                    <th className="py-3 px-2">Fecha Ingreso</th>
                    <th className="py-3 px-2">Fecha Confirmación</th>
                    <th className="py-3 px-2">Fecha Pactada</th>
                    <th className="py-3 px-2">Fecha Entrega</th>
                    {!esAsesor && <th className="py-3 px-2">Pago</th>}
                    {!esAsesor && <th className="py-3 px-2">Facturación</th>}
                    <th className="py-3 px-2">Gestión</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.codigo}
                      className="border-b border-slate-100 text-sm"
                    >
                      <td className="py-3 px-2">
                        <input
                          type="checkbox"
                          checked={selectedCodigos.includes(
                            p.codigo
                          )}
                          onChange={() =>
                            toggleSeleccion(p.codigo)
                          }
                        />
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-semibold text-slate-800">
                          {p.codigo}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex flex-col">
                          <span className="text-slate-800">
                            {p.cliente}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {p.telefono}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-slate-800">
                        S/ {p.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-slate-700">
                        {p.asesor}
                      </td>
                      <td className="py-3 px-2">
                        <span className={formatBadge(p.estadoPedido)}>
                          {p.estadoPedido}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={formatBadgeFacturacion(
                            p.estadoFacturacion
                          )}
                        >
                          {p.estadoFacturacion}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-700">
                        {formatearFecha(p.fechaIngreso) || "-"}
                      </td>
                      <td className="py-3 px-2 text-slate-700">
                        {formatearFecha(p.fechaConfirmacion) || "-"}
                      </td>
                      <td className="py-3 px-2 text-slate-700">
                        {formatearFecha(p.fechaPactada) || "-"}
                      </td>
                      <td className="py-3 px-2 text-slate-700">
                        {formatearFecha(p.fechaEntrega) || "-"}
                      </td>
                      {!esAsesor && (
                        <td className="py-3 px-2">
                          <button
                            type="button"
                            disabled={!CONTROLES_HABILITADOS}
                            onClick={() => CONTROLES_HABILITADOS && abrirModalPago(p)}
                            className={
                              CONTROLES_HABILITADOS
                                ? "text-xs rounded-full bg-indigo-50 px-3 py-1 text-indigo-600 hover:bg-indigo-100 border border-indigo-100"
                                : "text-xs rounded-full bg-slate-100 px-3 py-1 text-slate-400 border border-slate-200 cursor-not-allowed"
                            }
                          >
                            Actualizar Pago
                          </button>
                        </td>
                      )}
                      {!esAsesor && (
                        <td className="py-3 px-2">
                          <button
                            type="button"
                            disabled={!CONTROLES_HABILITADOS}
                            onClick={() => CONTROLES_HABILITADOS && abrirModalFacturacion(p)}
                            className={
                              CONTROLES_HABILITADOS
                                ? "text-xs rounded-full bg-amber-50 px-3 py-1 text-amber-600 hover:bg-amber-100 border border-amber-100"
                                : "text-xs rounded-full bg-slate-100 px-3 py-1 text-slate-400 border border-slate-200 cursor-not-allowed"
                            }
                          >
                            Actualizar Facturación
                          </button>
                        </td>
                      )}
                      <td className="py-3 px-2">
                        <button
                          type="button"
                          onClick={() =>
                            abrirModalActualizarEstados(p)
                          }
                          className="text-xs rounded-full bg-emerald-50 px-3 py-1 text-emerald-600 hover:bg-emerald-100 border border-emerald-100"
                        >
                          Actualizar Estados
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={13}
                        className="py-6 text-center text-slate-500"
                      >
                        No se encontraron pedidos con los filtros
                        actuales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-gray-500">

                <div>
                  Mostrando{" "}
                  <span className="font-medium">{pedidos.length}</span> de{" "}
                  <span className="font-medium">{PAGE_SIZE}</span> pedidos
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="px-2 py-1 rounded border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
                    onClick={() => setPage((prev) => prev - 1)}
                    disabled={page === 1}
                  >
                    Anterior
                  </button>

                  <span>
                    Página <span className="font-semibold">{page}</span> de{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </span>

                  <button
                    className="px-2 py-1 rounded border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={page === totalPages}
                  >
                    Siguiente
                  </button>
                </div>

              </div>

            </div>
          </div>
        </Card>

        {toastMsg && (
          <div className="fixed bottom-4 right-4 z-50">
            <Toast
              message={toastMsg.msg}
              type={toastMsg.type}
              onClose={() => setToastMsg(null)}
            />
          </div>
        )}

        {modalPagoOpen && pedidoPagoSeleccionado && (
          <ActualizarPagoModal
            open={modalPagoOpen}
            onClose={cerrarModalPago}
            pedido={pedidoPagoSeleccionado}
            pagosPorPedido={pagosPorPedido as any}
            setPagosPorPedido={setPagosPorPedido as any}
            showToast={showToast}
          />
        )}

        {modalFacturacionOpen && pedidoFacturacionSeleccionado && (
          <ActualizarFacturacionModal
            open={modalFacturacionOpen}
            pedido={pedidoFacturacionSeleccionado}
            onClose={cerrarModalFacturacion}
            showToast={showToast}
            onUpdated={handleFacturacionUpdated}
          />
        )}

        {modalActualizarOpen && pedidoEnEdicion && (
          <ActualizarEstadosModal
            open={modalActualizarOpen}
            pedido={pedidoEnEdicion as any}
            onClose={cerrarModalActualizar}
            onSave={handleGuardarEstados}
            onUpdated={handleEstadosOperacionUpdated}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default SeguimientoPedido;

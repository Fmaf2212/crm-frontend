import { AppLayout } from "@/app/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/sectionTitle";
import { Toast } from "@/components/ui/toast";
import { ListChecks, Search, Printer } from "lucide-react";
import React, { useEffect, useState } from "react";
import ReactSelect from "react-select";
import { PedidoService } from "@/services/pedidoService";
import ActualizarPagoModal from "./components/ActualizarPagoModal";
import ActualizarEstadosModal from "./components/ActualizarEstadosModal";
import ActualizarFacturacionModal from "./components/ActualizarFacturacionModal";
import type { EstadoOperacion, EstadoFacturacion } from "@/types/EstadosPedido";
import PedidoComprobanteMultiplePDF from "./components/PedidoComprobanteMultiplePDF";
import { pdf } from "@react-pdf/renderer";
import { useNavigate } from "react-router-dom";

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

const tipoEntregaOptions: SelectOption[] = [
  { value: "Todos", label: "Todos" },
  { value: "1", label: "Lima Next Day" },
  { value: "2", label: "Lima Same Day" },
  { value: "3", label: "Provincias Pago en Destino" },
  { value: "4", label: "Provincias Pago completo" },
  { value: "5", label: "Recojo en Tienda" },
  { value: "6", label: "Entregas Marketplace" },
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

const CONTROLES_HABILITADOS = true;

const SeguimientoPedido: React.FC = () => {
  const navigate = useNavigate();

  const userLS = JSON.parse(localStorage.getItem("sn_user") || "{}");
  const esAsesor = userLS?.id_Tipo_Usuario === 8;
  const esDespachador = userLS?.id_Tipo_Usuario === 7;
  const esLogístico = userLS?.id_Tipo_Usuario === 6;

  const [pageSize, setPageSize] = useState(5);

  // Paginación backend-driven
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Total real (si backend lo devuelve; si no, queda null y el texto se mantiene honesto)
  const [totalPedidos, setTotalPedidos] = useState<number | null>(null);

  // Data actual (solo una página, ya filtrada por backend)
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [codigoSearch, setCodigoSearch] = useState("");
  const [clienteSearch, setClienteSearch] = useState("");
  const [telefonoSearch, setTelefonoSearch] = useState("");

  const [estadoPedidoSelected, setEstadoPedidoSelected] = useState<SelectOption[]>(
    [estadoPedidoOptions[0]]
  );
  const [estadoFacturacionSelected, setEstadoFacturacionSelected] = useState<SelectOption[]>(
    [estadoFacturacionOptions[0]]
  );

  // Por ahora solo visual; coherencia: si eligen distinto a "Todos" se avisa que aún no está soportado
  const [tipoEntregaSelected, setTipoEntregaSelected] =
    useState<SelectOption | null>(tipoEntregaOptions[0]);

  const [fechaIngresoDesde, setFechaIngresoDesde] = useState("");
  const [fechaIngresoHasta, setFechaIngresoHasta] = useState("");
  const [fechaPactadaDesde, setFechaPactadaDesde] = useState("");
  const [fechaPactadaHasta, setFechaPactadaHasta] = useState("");
  const [fechaConfirmacionDesde, setFechaConfirmacionDesde] = useState("");
  const [fechaConfirmacionHasta, setFechaConfirmacionHasta] = useState("");
  const [fechaEntregaDesde, setFechaEntregaDesde] = useState("");
  const [fechaEntregaHasta, setFechaEntregaHasta] = useState("");

  // Selección (acumulativa entre páginas)
  const [selectedCodigos, setSelectedCodigos] = useState<string[]>([]);

  // Toast + modales
  const [toastMsg, setToastMsg] = useState<ToastState>(null);

  const [modalActualizarOpen, setModalActualizarOpen] = useState(false);
  const [pedidoEnEdicion, setPedidoEnEdicion] = useState<Pedido | null>(null);

  const [modalFacturacionOpen, setModalFacturacionOpen] = useState(false);
  const [pedidoFacturacionSeleccionado, setPedidoFacturacionSeleccionado] =
    useState<Pedido | null>(null);

  const [pagosPorPedido, setPagosPorPedido] = useState<Record<string, PedidoPagoPersistente>>(
    {}
  );
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [pedidoPagoSeleccionado, setPedidoPagoSeleccionado] = useState<Pedido | null>(
    null
  );

  const [pagosAgregadosTemp, setPagosAgregadosTemp] = useState<PagoAgregadoTemp[]>([]);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "error") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 2500);
  };

  const abrirModalFacturacion = (p: Pedido) => {
    setPedidoFacturacionSeleccionado(p);
    setModalFacturacionOpen(true);
  };

  const cerrarModalFacturacion = () => {
    setModalFacturacionOpen(false);
    setPedidoFacturacionSeleccionado(null);
  };

  const irACrearPedidoParaActualizar = async (idCodigoPedido: any) => {
    try {
      if (!idCodigoPedido) return;

      const res = await PedidoService.getPedidoParaEdicion(idCodigoPedido);

      if (!res || res.error || !res.data) {
        showToast("No se pudo obtener datos del pedido para actualizar.", "error");
        return;
      }

      navigate("/pedidos/crear", {
        state: {
          modo: "actualizacion",
          payloadPedido: res.data,
        },
      });
    } catch (err) {
      console.error(err);
      showToast("Error al comunicarse con el servidor.", "error");
    }
  };

  const formatearFecha = (fecha: any) => {
    if (!fecha) return "-";

    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return "-";

    const dia = date.getDate().toString().padStart(2, "0");
    const mes = (date.getMonth() + 1).toString().padStart(2, "0");
    const año = date.getFullYear();

    let horas = date.getHours();
    const minutos = date.getMinutes().toString().padStart(2, "0");
    const segundos = date.getSeconds().toString().padStart(2, "0");
    const ampm = horas >= 12 ? "PM" : "AM";
    horas = horas % 12 || 12;

    return `${dia}/${mes}/${año} ${horas}:${minutos}:${segundos} ${ampm}`;
  };

  const formatBadge = (estado: EstadoOperacion) =>
    `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${badgePedidoColors[estado]}`;

  const formatBadgeFacturacion = (estado: EstadoFacturacion) =>
    `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${badgeFacturacionColors[estado]}`;

  const convertDate = (v: string) => {
    if (!v) return "";
    const [y, m, d] = v.split("-");
    if (!y || !m || !d) return "";
    return `${d}/${m}/${y}`;
  };

  const validarRango = (d: string, h: string) => (d && h) || (!d && !h);

  const parseCodigoToIdPedido = (raw: string) => {
    const t = raw.trim();
    if (!t) return 0;

    // Si el usuario pone varios códigos separados por espacio/coma, tomamos el primero.
    const firstToken = t.split(/[,\s]+/).filter(Boolean)[0] ?? "";
    const n = Number(firstToken);

    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  const buildRequestBody = (pageParam: number, sizeParam: number) => {
    // Validación de rangos de fechas (se mantiene)
    if (
      !validarRango(fechaIngresoDesde, fechaIngresoHasta) ||
      !validarRango(fechaPactadaDesde, fechaPactadaHasta) ||
      !validarRango(fechaConfirmacionDesde, fechaConfirmacionHasta) ||
      !validarRango(fechaEntregaDesde, fechaEntregaHasta)
    ) {
      showToast("Debe seleccionar rangos completos (desde y hasta).", "error");
      return null;
    }

    // ============================
    // ESTADO OPERACIÓN
    // ============================
    const epSelected = estadoPedidoSelected.map((e) => e.value);

    const idEstadoOperacion = epSelected.includes("Todos")
      ? Object.values(ESTADO_OPERACION_ID_MAP).join(",")
      : epSelected
        .map((e) => ESTADO_OPERACION_ID_MAP[e as EstadoOperacion])
        .filter(Boolean)
        .join(",");

    // ============================
    // ESTADO FACTURACIÓN
    // ============================
    const efSelected = estadoFacturacionSelected.map((e) => e.value);

    const idEstadoFacturacion = efSelected.includes("Todos")
      ? Object.values(ESTADO_FACTURACION_ID_MAP).join(",")
      : efSelected
        .map((e) => ESTADO_FACTURACION_ID_MAP[e as EstadoFacturacion])
        .filter(Boolean)
        .join(",");

    // ============================
    // TIPO DE ENTREGA (NUEVO)
    // ============================
    const idTipoEntrega =
      tipoEntregaSelected?.value && tipoEntregaSelected.value !== "Todos"
        ? Number(tipoEntregaSelected.value)
        : 0;

    // ============================
    // REQUEST FINAL
    // ============================
    return {
      number: pageParam,
      size: sizeParam,

      id_Pedido: parseCodigoToIdPedido(codigoSearch),
      id_Asesor_Actual: esAsesor ? userLS.id_Usuario : 0,

      id_Tipo_de_Entrega: idTipoEntrega, // ✅ ya soportado por backend

      cliente: clienteSearch,
      numero_De_Contacto: telefonoSearch,

      id_Estado_Operacion_Actual: idEstadoOperacion,
      id_Estado_Facturacion_Actual: idEstadoFacturacion,

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

  const fetchPedidos = async (pageParam: number, sizeParam: number = pageSize) => {
    const body = buildRequestBody(pageParam, sizeParam);
    if (!body) return;

    try {
      setLoading(true);

      const res = await PedidoService.getSeguimientoPedido(body);

      const serverPage = res?.data?.page ?? pageParam;
      const serverTotalPages = res?.data?.totalPages ?? 1;

      // Si en algún momento backend expone totalRegisters, lo tomamos (sin romper si no existe)
      const serverTotalRegisters =
        typeof res?.data?.totalRegisters === "number" ? res.data.totalRegisters : null;

      setPage(serverPage);
      setTotalPages(serverTotalPages);
      setTotalPedidos(serverTotalRegisters);

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

  // Carga inicial (una sola vez)
  useEffect(() => {
    fetchPedidos(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBuscar = () => {
    // Buscar confirma filtros → siempre página 1, como SeguimientoLead
    setSelectedCodigos([]); // recomendado: si cambias universo, resetea selección
    fetchPedidos(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchPedidos(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    if (newSize === pageSize) return;

    setSelectedCodigos([]); // coherencia: cambia el universo
    setPage(1);
    setPageSize(newSize);

    // cambiar size = cambiar universo → volver a página 1
    fetchPedidos(1, newSize);
  };

  const toggleSeleccion = (codigo: string) => {
    setSelectedCodigos((prev) =>
      prev.includes(codigo) ? prev.filter((c) => c !== codigo) : [...prev, codigo]
    );
  };

  const allSelected =
    pedidos.length > 0 && pedidos.every((p) => selectedCodigos.includes(p.codigo));

  const toggleAll = (checked: boolean) => {
    const codigosPagina = pedidos.map((p) => p.codigo);

    setSelectedCodigos((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, ...codigosPagina]));
      }
      return prev.filter((c) => !codigosPagina.includes(c));
    });
  };

  const hasSelection = selectedCodigos.length > 0;

  const handleImprimirOrdenes = async () => {
    if (!hasSelection) return;

    try {
      setLoadingPdf(true);

      const pedidosData: any[] = [];

      for (const codigo of selectedCodigos) {
        const res = await PedidoService.getDetallePedido(Number(codigo));
        if (res?.data) pedidosData.push(res.data);
      }

      if (pedidosData.length === 0) {
        console.warn("No se pudo obtener data de pedidos.");
        return;
      }

      const blob = await pdf(
        <PedidoComprobanteMultiplePDF pedidos={pedidosData} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Ordenes_${selectedCodigos.length}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generando PDF múltiple:", err);
    } finally {
      setLoadingPdf(false);
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

  const abrirModalPago = (p: Pedido) => {
    setPedidoPagoSeleccionado(p);
    setPagosAgregadosTemp([]);
    setModalPagoOpen(true);
  };

  const cerrarModalPago = () => {
    setModalPagoOpen(false);
    setPedidoPagoSeleccionado(null);
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

  const handleFacturacionUpdated = async () => {
    await fetchPedidos(page);
    cerrarModalFacturacion();
    showToast("Facturación actualizada.", "success");
  };

  const handleEstadosOperacionUpdated = async () => {
    await fetchPedidos(page);
    cerrarModalActualizar();
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
                onClick={handleImprimirOrdenes}
                className={
                  hasSelection
                    ? "inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm text-white"
                    : "inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm text-emerald-300 border border-emerald-100 cursor-not-allowed"
                }
                disabled={!hasSelection || loadingPdf}
              >
                <Printer className="w-4 h-4" />
                {loadingPdf ? (
                  "Generando PDF..."
                ) : (
                  <span className="notranslate">
                    Imprimir Órdenes: {selectedCodigos.length}
                  </span>
                )}
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
                placeholder="Buscar por cliente"
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
                onClick={handleBuscar}
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
                  classNamePrefix="rs notranslate"
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
                  classNamePrefix="rs notranslate"
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
                  Tipo de Entrega
                </label>
                <ReactSelect
                  isMulti={false}
                  classNamePrefix="rs notranslate"
                  options={tipoEntregaOptions}
                  value={tipoEntregaSelected}
                  onChange={(opt) => setTipoEntregaSelected(opt)}
                  styles={selectStyles}
                  placeholder="Seleccione tipo"
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Fecha de Ingreso
                </label>
                <div className="grid grid-cols-2 gap-2">
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
                <label className="text-xs font-medium text-slate-600">
                  Fecha Pactada
                </label>
                <div className="grid grid-cols-2 gap-2">
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

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Fecha de Confirmación
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={fechaConfirmacionDesde}
                    onChange={(e) => setFechaConfirmacionDesde(e.target.value)}
                    className={inputClasses}
                  />
                  <input
                    type="date"
                    value={fechaConfirmacionHasta}
                    onChange={(e) => setFechaConfirmacionHasta(e.target.value)}
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
          </div>

          <div className="flex flex-col gap-4 bg-white px-6 py-5">
            <div className="w-full overflow-x-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>Mostrar</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:outline-none"
                    disabled={loading}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                  </select>
                  <span>filas</span>
                </div>
              </div>
              <div className="min-w-[1400px] border border-slate-200 rounded-2xl">
                <div className="max-h-[65vh] overflow-y-auto">
                  <table className="w-full text-[11px] md:text-sm">
                    <thead className="bg-slate-50 text-slate-600 sticky top-0">
                      <tr>
                        <th className="py-3 px-2">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={(e) => toggleAll(e.target.checked)}
                          />
                        </th>
                        <th className="py-3 px-2">Código</th>
                        <th className="py-3 px-2">Cliente</th>
                        <th className="py-3 px-2">Total</th>
                        <th className="py-3 px-2">Asesor</th>
                        <th className="py-3 px-2">Estado Pedido</th>
                        <th className="py-3 px-2">Estado Facturación</th>
                        <th className="py-3 px-2 min-w-[100px]">Fecha Ingreso</th>
                        <th className="py-3 px-2 min-w-[100px]">Fecha Confirmación</th>
                        <th className="py-3 px-2 min-w-[100px]">Fecha Pactada</th>
                        <th className="py-3 px-2 min-w-[100px]">Fecha Entrega</th>
                        {!esAsesor && <th className="py-3 px-2">Pago</th>}
                        {!esAsesor && <th className="py-3 px-2">Facturación</th>}
                        <th className="py-3 px-2">Gestión</th>
                        {!esAsesor && !esDespachador && !esLogístico && (
                          <th className="py-3 px-2">Acción</th>
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {pedidos.map((p) => (
                        <tr key={p.codigo} className="border-b border-slate-100 text-sm">
                          <td className="py-3 px-2">
                            <input
                              type="checkbox"
                              checked={selectedCodigos.includes(p.codigo)}
                              onChange={() => toggleSeleccion(p.codigo)}
                            />
                          </td>

                          <td className="py-3 px-2">
                            <span className="font-semibold text-slate-800 notranslate">
                              {p.codigo}
                            </span>
                          </td>

                          <td className="py-3 px-2">
                            <div className="flex flex-col">
                              <span className="text-slate-800">{p.cliente}</span>
                            </div>
                          </td>

                          <td className="py-3 px-2 whitespace-nowrap text-slate-800 notranslate">
                            S/ {p.total.toFixed(2)}
                          </td>

                          <td className="py-3 px-2 text-slate-700">{p.asesor}</td>

                          <td className="py-3 px-2">
                            <span className={`${formatBadge(p.estadoPedido)} notranslate`}>
                              {p.estadoPedido}
                            </span>
                          </td>

                          <td className="py-3 px-2">
                            <span
                              className={`${formatBadgeFacturacion(
                                p.estadoFacturacion
                              )} notranslate`}
                            >
                              {p.estadoFacturacion}
                            </span>
                          </td>

                          <td className="py-3 px-2 text-slate-700 text-center notranslate">
                            {formatearFecha(p.fechaIngreso)}
                          </td>
                          <td className="py-3 px-2 text-slate-700 text-center notranslate">
                            {formatearFecha(p.fechaConfirmacion)}
                          </td>
                          <td className="py-3 px-2 text-slate-700 text-center notranslate">
                            {formatearFecha(p.fechaPactada)}
                          </td>
                          <td className="py-3 px-2 text-slate-700 text-center notranslate">
                            {formatearFecha(p.fechaEntrega)}
                          </td>

                          {!esAsesor && (
                            <td className="py-3 px-2">
                              <button
                                type="button"
                                disabled={!CONTROLES_HABILITADOS}
                                onClick={() => CONTROLES_HABILITADOS && abrirModalPago(p)}
                                className={
                                  CONTROLES_HABILITADOS
                                    ? "text-xs rounded-full bg-indigo-50 px-3 py-1 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 notranslate"
                                    : "text-xs rounded-full bg-slate-100 px-3 py-1 text-slate-400 border border-slate-200 cursor-not-allowed notranslate"
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
                                onClick={() =>
                                  CONTROLES_HABILITADOS && abrirModalFacturacion(p)
                                }
                                className={
                                  CONTROLES_HABILITADOS
                                    ? "text-xs rounded-full bg-amber-50 px-3 py-1 text-amber-600 hover:bg-amber-100 border border-amber-100 notranslate"
                                    : "text-xs rounded-full bg-slate-100 px-3 py-1 text-slate-400 border border-slate-200 cursor-not-allowed notranslate"
                                }
                              >
                                Actualizar Facturación
                              </button>
                            </td>
                          )}

                          <td className="py-3 px-2">
                            <button
                              type="button"
                              onClick={() => abrirModalActualizarEstados(p)}
                              className="text-xs rounded-full bg-emerald-50 px-3 py-1 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 notranslate"
                            >
                              Actualizar Estados
                            </button>
                          </td>

                          {!esAsesor && !esDespachador && !esLogístico && (
                            <td className="py-3 px-2">
                              <button
                                type="button"
                                onClick={() => irACrearPedidoParaActualizar(p.codigo)}
                                className="text-xs rounded-full bg-[#FFE5E5] px-3 py-1 text-red-600 hover:bg-red-100 border border-red-100 notranslate"
                              >
                                Actualizar Pedido
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}

                      {!loading && pedidos.length === 0 && (
                        <tr>
                          <td colSpan={13} className="py-6 text-center text-slate-500">
                            No se encontraron pedidos con los filtros actuales.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="min-w-[1400px] flex items-center justify-between border-t px-4 py-2 text-xs text-gray-500">
                <div>
                  Mostrando{" "}
                  <span className="font-medium">{pedidos.length}</span>
                  {typeof totalPedidos === "number" ? (
                    <>
                      {" "}
                      de <span className="font-medium">{totalPedidos}</span>
                    </>
                  ) : null}{" "}
                  pedidos
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    className="px-2 py-1 rounded border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || loading}
                  >
                    Anterior
                  </button>

                  <span>
                    Página <span className="font-semibold notranslate">{page}</span> de{" "}
                    <span className="font-semibold notranslate">{totalPages}</span>
                  </span>

                  <button
                    className="px-2 py-1 rounded border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages || loading}
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

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Toast } from "@/components/ui/Toast";
import { ListFilter, Eye, ShoppingCart, Pencil, X } from "lucide-react";
import { AppLayout } from "@/app/layout/AppLayout";
import ReactSelect from "react-select";

const USUARIO_LOGUEADO = {
  nombre: "Carlos Mendoza",
  rol: "supervisor", // "asesor" o "supervisor"
};

type LeadEstado =
  | "Nuevo"
  | "Agendado"
  | "En conversación"
  | "Interesado"
  | "Oferta enviada"
  | "Cierre pendiente"
  | "Afiliación SNN"
  | "No Venta"
  | "Venta";

type Lead = {
  id: number;
  codigo: string;
  fechaRegistro: string;
  numeroContacto: string;
  clienteVinculado: string;
  medioRegistro: string;
  asesor: string;
  supervisor: string;
  campania: string;
  estadoLead: LeadEstado;
};

type HistorialEstado = {
  estado: LeadEstado | string;
  fecha: string;
  usuario: string;
  detalle: string;
  fechaPactada?: string;
  horaPactada?: string;
  estatusEspecifico?: string;
  observaciones?: string;
};

const CAMPANIAS = [
  { value: "black-friday-2025", label: "Black Friday 2025" },
  { value: "cyber-monday", label: "Cyber Monday" },
  { value: "navidad-2025", label: "Navidad 2025" },
];

const ASESORES = [
  { value: "carlos-mendoza", label: "Carlos Mendoza" },
  { value: "maria-lopez", label: "María López" },
  { value: "pedro-ramos", label: "Pedro Ramos" },
];

const ESTADOS_LEAD_FILTRO = [
  { value: "Nuevo", label: "Nuevo" },
  { value: "Agendado", label: "Agendado" },
  { value: "En conversación", label: "En conversación" },
  { value: "Interesado", label: "Interesado" },
  { value: "Oferta enviada", label: "Oferta enviada" },
  { value: "Cierre pendiente", label: "Cierre pendiente" },
  { value: "Afiliación SNN", label: "Afiliación SNN" },
  { value: "No Venta", label: "No Venta" },
  { value: "Venta", label: "Venta" },
];

const ESTADOS_LEAD_MODAL = [
  { value: "Nuevo", label: "Nuevo" },
  { value: "Agendado", label: "Agendado" },
  { value: "En conversación", label: "En conversación" },
  { value: "Interesado", label: "Interesado" },
  { value: "Oferta enviada", label: "Oferta enviada" },
  { value: "Cierre pendiente", label: "Cierre pendiente" },
  { value: "Afiliación SNN", label: "Afiliación SNN" },
  { value: "No Venta", label: "No Venta" },
];

const ESTATUS_ESPECIFICO_NO_VENTA = [
  "No responde",
  "No interesado",
  "Sin presupuesto",
  "Spam",
  "Black List",
  "ATC - Post Venta",
  "ATC - Reclamo",
];

const LEADS_BASE: Lead[] = [
  {
    id: 1,
    codigo: "LEAD001",
    fechaRegistro: "2025-11-15",
    numeroContacto: "51949778250",
    clienteVinculado: "Juan Pérez García",
    medioRegistro: "Web",
    asesor: "Carlos Mendoza",
    supervisor: "Black Friday Supervisor",
    campania: "Black Friday 2025",
    estadoLead: "Venta",
  },
  {
    id: 2,
    codigo: "LEAD045",
    fechaRegistro: "2025-11-18",
    numeroContacto: "51949778250",
    clienteVinculado: "Juan Pérez García",
    medioRegistro: "Teléfono",
    asesor: "María López",
    supervisor: "Cyber Monday Supervisor",
    campania: "Cyber Monday",
    estadoLead: "Cierre pendiente",
  },
  {
    id: 3,
    codigo: "LEAD089",
    fechaRegistro: "2025-11-14",
    numeroContacto: "51949778250",
    clienteVinculado: "María Pérez López",
    medioRegistro: "Redes Sociales",
    asesor: "Pedro Ramos",
    supervisor: "Navidad Supervisor",
    campania: "Navidad 2025",
    estadoLead: "Interesado",
  },
  {
    id: 4,
    codigo: "LEAD120",
    fechaRegistro: "2025-11-19",
    numeroContacto: "51987654321",
    clienteVinculado: "Roberto Sánchez",
    medioRegistro: "Presencial",
    asesor: "Carlos Mendoza",
    supervisor: "Navidad Supervisor",
    campania: "Navidad 2025",
    estadoLead: "Interesado",
  },
  {
    id: 5,
    codigo: "LEAD156",
    fechaRegistro: "2025-11-16",
    numeroContacto: "51912345678",
    clienteVinculado: "Lucía Morales",
    medioRegistro: "Email",
    asesor: "María López",
    supervisor: "Black Friday Supervisor",
    campania: "Black Friday 2025",
    estadoLead: "No Venta",
  },
];

const PAGE_SIZE = 5;

function formatFecha(f: string) {
  return f.split("-").reverse().join("/");
}

function formatFechaHora(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

function getTodayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function getFirstDayOfMonthIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function getEmailFromLead(lead: Lead) {
  return `${lead.codigo.toLowerCase()}@email.com`;
}

export default function SeguimientoLead() {
  const [leads, setLeads] = useState<Lead[]>(LEADS_BASE);

  const [fechaDesde, setFechaDesde] = useState(getFirstDayOfMonthIso());
  const [fechaHasta, setFechaHasta] = useState(getTodayIso());
  const [campaniasSeleccionadas, setCampaniasSeleccionadas] = useState<string[]>([]);
  const [asesoresSeleccionados, setAsesoresSeleccionados] = useState<string[]>([]);
  const [estadosSeleccionados, setEstadosSeleccionados] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [modalTransferirOpen, setModalTransferirOpen] = useState(false);
  const [asesorDestino, setAsesorDestino] = useState("");

  // Para Modal ACTUALIZAR
  const [modalActualizarOpen, setModalActualizarOpen] = useState(false);
  const [leadEnEdicion, setLeadEnEdicion] = useState<Lead | null>(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<LeadEstado | "">("");
  const [detalleEstado, setDetalleEstado] = useState("");
  const [fechaPactada, setFechaPactada] = useState("");
  const [horaPactada, setHoraPactada] = useState("");
  const [estatusEspecifico, setEstatusEspecifico] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // Para Modal INFO LEAD
  const [modalInfoOpen, setModalInfoOpen] = useState(false);
  const [leadInfoSeleccionado, setLeadInfoSeleccionado] = useState<Lead | null>(null);

  // Para Modal CONFIRMACIÓN GUARDAR
  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);

  // Para Toast (mismo patrón que CrearLead)
  const [toastMsg, setToastMsg] = useState<{
    msg: string;
    type: "error" | "success";
  } | null>(null);

  const showToast = (msg: string, type: "error" | "success" = "error") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Historial por lead
  const [historialPorLead, setHistorialPorLead] = useState<
    Record<number, HistorialEstado[]>
  >(() => {
    const now = new Date().toISOString();
    const inicial: Record<number, HistorialEstado[]> = {};
    LEADS_BASE.forEach((lead) => {
      inicial[lead.id] = [
        {
          estado: lead.estadoLead,
          fecha: now,
          usuario: USUARIO_LOGUEADO.nombre,
          detalle: "",
        },
      ];
    });
    return inicial;
  });

  const handleLimpiarFiltros = () => {
    setFechaDesde(getFirstDayOfMonthIso());
    setFechaHasta(getTodayIso());
    setCampaniasSeleccionadas([]);
    setAsesoresSeleccionados([]);
    setEstadosSeleccionados([]);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [fechaDesde, fechaHasta, campaniasSeleccionadas, asesoresSeleccionados, estadosSeleccionados]);

  const leadsFiltrados = useMemo(() => {
    return leads.filter((lead) => {
      const fechaLead = new Date(lead.fechaRegistro);
      const desde = fechaDesde ? new Date(fechaDesde) : null;
      const hasta = fechaHasta ? new Date(fechaHasta) : null;

      const coincideFecha =
        (!desde || fechaLead >= desde) && (!hasta || fechaLead <= hasta);

      const coincideCampania =
        campaniasSeleccionadas.length === 0 ||
        campaniasSeleccionadas.some((c) =>
          lead.campania.toLowerCase().includes(
            CAMPANIAS.find((opt) => opt.value === c)?.label.toLowerCase() || ""
          )
        );

      const coincideAsesor =
        asesoresSeleccionados.length === 0 ||
        asesoresSeleccionados.some((a) =>
          lead.asesor
            .toLowerCase()
            .includes(
              ASESORES.find((opt) => opt.value === a)?.label.toLowerCase() || ""
            )
        );

      const coincideEstado =
        estadosSeleccionados.length === 0 || estadosSeleccionados.includes(lead.estadoLead);

      return coincideFecha && coincideCampania && coincideAsesor && coincideEstado;
    });
  }, [
    leads,
    fechaDesde,
    fechaHasta,
    campaniasSeleccionadas,
    asesoresSeleccionados,
    estadosSeleccionados,
  ]);

  const totalLeads = leadsFiltrados.length;
  const totalPages = Math.max(1, Math.ceil(totalLeads / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const leadsPaginados = leadsFiltrados.slice(startIndex, startIndex + PAGE_SIZE);

  const toggleSelectAll = () => {
    const idsPagina = leadsPaginados.map((l) => l.id);
    const allSelected = idsPagina.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !idsPagina.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...idsPagina])));
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  let asesoresActuales: string[] = [];

  if (USUARIO_LOGUEADO.rol === "supervisor") {
    asesoresActuales = Array.from(
      new Set(leads.filter((l) => selectedIds.includes(l.id)).map((l) => l.asesor))
    );
  } else {
    asesoresActuales = [USUARIO_LOGUEADO.nombre];
  }

  const abrirModalActualizar = (lead: Lead) => {
    setLeadEnEdicion(lead);
    setEstadoSeleccionado(lead.estadoLead);
    setDetalleEstado("");
    setFechaPactada("");
    setHoraPactada("");
    setEstatusEspecifico("");
    setObservaciones("");
    setModalActualizarOpen(true);
  };

  const cerrarModalActualizar = () => {
    setModalActualizarOpen(false);
    setLeadEnEdicion(null);
    setEstadoSeleccionado("");
    setDetalleEstado("");
    setFechaPactada("");
    setHoraPactada("");
    setEstatusEspecifico("");
    setObservaciones("");
  };

  const guardarActualizacion = () => {
    if (!leadEnEdicion || !estadoSeleccionado) {
      cerrarModalActualizar();
      return;
    }

    const ahoraIso = new Date().toISOString();

    const nuevoHistorial: HistorialEstado = {
      estado: estadoSeleccionado,
      fecha: ahoraIso,
      usuario: USUARIO_LOGUEADO.nombre,
      detalle: detalleEstado,
      fechaPactada: estadoSeleccionado === "Agendado" ? fechaPactada || undefined : undefined,
      horaPactada: estadoSeleccionado === "Agendado" ? horaPactada || undefined : undefined,
      estatusEspecifico:
        estadoSeleccionado === "No Venta" ? estatusEspecifico || undefined : undefined,
      observaciones:
        estadoSeleccionado === "No Venta" ? observaciones || undefined : undefined,
    };

    setHistorialPorLead((prev) => {
      const anterior = prev[leadEnEdicion.id] || [];
      return {
        ...prev,
        [leadEnEdicion.id]: [...anterior, nuevoHistorial],
      };
    });

    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadEnEdicion.id ? { ...l, estadoLead: estadoSeleccionado as LeadEstado } : l
      )
    );

    cerrarModalActualizar();
  };

  const esAgendado = estadoSeleccionado === "Agendado";
  const esNoVenta = estadoSeleccionado === "No Venta";
  const soloDetalleEstados: LeadEstado[] = [
    "En conversación",
    "Interesado",
    "Oferta enviada",
    "Cierre pendiente",
    "Afiliación SNN",
  ];
  const muestraSoloDetalle = soloDetalleEstados.includes(estadoSeleccionado as LeadEstado);

  const historialDelLeadActual =
    leadEnEdicion && historialPorLead[leadEnEdicion.id]
      ? historialPorLead[leadEnEdicion.id]
      : [];

  const abrirModalInfo = (lead: Lead) => {
    setLeadInfoSeleccionado(lead);
    setModalInfoOpen(true);
  };

  const cerrarModalInfo = () => {
    setModalInfoOpen(false);
    setLeadInfoSeleccionado(null);
  };

  // Validar y luego abrir modal de confirmación
  const handleClickGuardar = () => {
    if (!leadEnEdicion || !estadoSeleccionado) {
      showToast("Debe seleccionar un estado para el lead.", "error");
      return;
    }

    if (esAgendado && (!fechaPactada || !horaPactada)) {
      showToast("Debe ingresar la fecha y hora pactada para un estado Agendado.", "error");
      return;
    }

    if (esNoVenta && !estatusEspecifico) {
      showToast(
        "Debe seleccionar un Estatus Específico cuando el estado es No Venta.",
        "error"
      );
      return;
    }

    setModalConfirmOpen(true);
  };

  const confirmarGuardar = () => {
    guardarActualizacion();
    setModalConfirmOpen(false);
    showToast("Estado del lead actualizado correctamente.", "success");
  };

  const cancelarConfirmacion = () => {
    setModalConfirmOpen(false);
  };

  return (
    <AppLayout title="Seguimiento Lead">
      {toastMsg && (
        <Toast
          message={toastMsg.msg}
          type={toastMsg.type}
          onClose={() => setToastMsg(null)}
        />
      )}

      <div className="space-y-6">
        <div className="text-sm text-gray-500">
          Gestionar Lead <span className="mx-1">›</span>
          <span className="text-gray-800">Seguimiento de Lead</span>
        </div>

        <Card>
          <div className="p-6 border-b border-gray-300 flex items-center justify-between gap-2">
            <div className="flex gap-2 items-center">
              <ListFilter className="w-5 h-5 text-[#006341]" />
              <span className="text-[#006341] font-medium">Lista de Leads</span>
            </div>
            {selectedIds.length > 0 && (
              <Button
                className="bg-emerald-800 hover:bg-emerald-700 text-white"
                onClick={() => setModalTransferirOpen(true)}
              >
                Transferir Leads: {selectedIds.length}
              </Button>
            )}
          </div>

          <div className="space-y-5 bg-white px-6 py-5">
            <div className="grid items-end gap-4 rounded-2xl bg-[#F9FAFB] p-4 md:grid-cols-5 lg:grid-cols-6">
              <div className="space-y-1">
                <label className="text-sm font-medium">Fecha Desde</label>
                <Input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Fecha Hasta</label>
                <Input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Campaña</label>
                <ReactSelect
                  isMulti
                  classNamePrefix="rs"
                  options={CAMPANIAS}
                  value={CAMPANIAS.filter((c) =>
                    campaniasSeleccionadas.includes(c.value)
                  )}
                  onChange={(opts) =>
                    setCampaniasSeleccionadas((opts || []).map((o: any) => o.value))
                  }
                  placeholder="Seleccione campañas"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),

                    control: (base, state) => ({
                      ...base,
                      backgroundColor: "white",
                      borderColor: state.isFocused ? "#16a34a" : "#d1d5db",
                      boxShadow: state.isFocused ? "0 0 0 1px #16a34a" : "none",
                      borderRadius: 6,
                      minHeight: "38px",
                      "&:hover": {
                        borderColor: state.isFocused ? "#16a34a" : "#9ca3af",
                      },
                      fontSize: "14px",
                    }),

                    placeholder: (base) => ({
                      ...base,
                      fontSize: "14px",
                      color: "#6b7280",
                    }),

                    singleValue: (base) => ({
                      ...base,
                      fontSize: "14px",
                      color: "#374151",
                    }),

                    menu: (base) => ({
                      ...base,
                      marginTop: 4,
                      borderRadius: 6,
                      overflow: "hidden",
                      boxShadow:
                        "0 4px 10px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)",
                    }),

                    menuList: (base) => ({
                      ...base,
                      padding: 0,
                    }),

                    option: (base, state) => ({
                      ...base,
                      fontSize: "14px",
                      padding: "8px 12px",
                      backgroundColor: state.isSelected
                        ? "#f3f4f6"
                        : state.isFocused
                          ? "#f9fafb"
                          : "white",
                      color: "#111827",
                      cursor: "pointer",
                    }),

                    indicatorSeparator: () => ({ display: "none" }),

                    dropdownIndicator: (base, state) => ({
                      ...base,
                      color: state.isFocused ? "#16a34a" : "#6b7280",
                      "&:hover": { color: "#16a34a" },
                    }),
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Asesor</label>
                <ReactSelect
                  isMulti
                  classNamePrefix="rs"
                  options={ASESORES}
                  value={ASESORES.filter((c) =>
                    asesoresSeleccionados.includes(c.value)
                  )}
                  onChange={(opts) =>
                    setAsesoresSeleccionados((opts || []).map((o: any) => o.value))
                  }
                  placeholder="Seleccione asesores"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),

                    control: (base, state) => ({
                      ...base,
                      backgroundColor: "white",
                      borderColor: state.isFocused ? "#16a34a" : "#d1d5db",
                      boxShadow: state.isFocused ? "0 0 0 1px #16a34a" : "none",
                      borderRadius: 6,
                      minHeight: "38px",
                      "&:hover": {
                        borderColor: state.isFocused ? "#16a34a" : "#9ca3af",
                      },
                      fontSize: "14px",
                    }),

                    placeholder: (base) => ({
                      ...base,
                      fontSize: "14px",
                      color: "#6b7280",
                    }),

                    singleValue: (base) => ({
                      ...base,
                      fontSize: "14px",
                      color: "#374151",
                    }),

                    menu: (base) => ({
                      ...base,
                      marginTop: 4,
                      borderRadius: 6,
                      overflow: "hidden",
                      boxShadow:
                        "0 4px 10px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)",
                    }),

                    menuList: (base) => ({
                      ...base,
                      padding: 0,
                    }),

                    option: (base, state) => ({
                      ...base,
                      fontSize: "14px",
                      padding: "8px 12px",
                      backgroundColor: state.isSelected
                        ? "#f3f4f6"
                        : state.isFocused
                          ? "#f9fafb"
                          : "white",
                      color: "#111827",
                      cursor: "pointer",
                    }),

                    indicatorSeparator: () => ({ display: "none" }),

                    dropdownIndicator: (base, state) => ({
                      ...base,
                      color: state.isFocused ? "#16a34a" : "#6b7280",
                      "&:hover": { color: "#16a34a" },
                    }),
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Estado de Lead</label>
                <ReactSelect
                  isMulti
                  classNamePrefix="rs"
                  options={ESTADOS_LEAD_FILTRO}
                  value={ESTADOS_LEAD_FILTRO.filter((c) =>
                    estadosSeleccionados.includes(c.value)
                  )}
                  onChange={(opts) =>
                    setEstadosSeleccionados((opts || []).map((o: any) => o.value))
                  }
                  placeholder="Seleccione estados"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),

                    control: (base, state) => ({
                      ...base,
                      backgroundColor: "white",
                      borderColor: state.isFocused ? "#16a34a" : "#d1d5db",
                      boxShadow: state.isFocused ? "0 0 0 1px #16a34a" : "none",
                      borderRadius: 6,
                      minHeight: "38px",
                      "&:hover": {
                        borderColor: state.isFocused ? "#16a34a" : "#9ca3af",
                      },
                      fontSize: "14px",
                    }),

                    placeholder: (base) => ({
                      ...base,
                      fontSize: "14px",
                      color: "#6b7280",
                    }),

                    singleValue: (base) => ({
                      ...base,
                      fontSize: "14px",
                      color: "#374151",
                    }),

                    menu: (base) => ({
                      ...base,
                      marginTop: 4,
                      borderRadius: 6,
                      overflow: "hidden",
                      boxShadow:
                        "0 4px 10px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)",
                    }),

                    menuList: (base) => ({
                      ...base,
                      padding: 0,
                    }),

                    option: (base, state) => ({
                      ...base,
                      fontSize: "14px",
                      padding: "8px 12px",
                      backgroundColor: state.isSelected
                        ? "#f3f4f6"
                        : state.isFocused
                          ? "#f9fafb"
                          : "white",
                      color: "#111827",
                      cursor: "pointer",
                    }),

                    indicatorSeparator: () => ({ display: "none" }),

                    dropdownIndicator: (base, state) => ({
                      ...base,
                      color: state.isFocused ? "#16a34a" : "#6b7280",
                      "&:hover": { color: "#16a34a" },
                    }),
                  }}
                />
              </div>

              <div className="flex justify-start md:justify-end lg:col-span-1">
                <Button
                  variant="outline"
                  className="w-full mt-2 md:mt-0"
                  onClick={handleLimpiarFiltros}
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border">
              <table className="min-w-full text-sm">
                <thead className="bg-[#F7F8FA] text-gray-600">
                  <tr>
                    <th className="px-4 py-2 w-10">
                      <input
                        type="checkbox"
                        checked={
                          leadsPaginados.length > 0 &&
                          leadsPaginados.every((l) => selectedIds.includes(l.id))
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>

                    <th className="px-4 py-2 text-left font-medium text-black">Lead</th>
                    <th className="px-4 py-2 text-left font-medium text-black">
                      Fecha Registro
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-black">
                      Última Actualización
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-black">
                      Número Contacto
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-black">
                      Cliente Vinculado
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-black">
                      Medio Registro
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-black">Asesor</th>
                    <th className="px-4 py-2 text-left font-medium text-black">
                      Supervisor
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-black">
                      Campaña
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-black">
                      Estado de Lead
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-black">Venta</th>
                    <th className="px-4 py-2 text-left font-medium text-black">
                      Gestión
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {leadsPaginados.length === 0 && (
                    <tr>
                      <td colSpan={13} className="px-4 py-6 text-center text-gray-400">
                        No hay leads para los filtros seleccionados.
                      </td>
                    </tr>
                  )}

                  {leadsPaginados.map((lead) => {
                    const estadoColor =
                      lead.estadoLead === "Venta"
                        ? { bg: "#D9F7E8", text: "text-emerald-700" }
                        : lead.estadoLead === "Cierre pendiente"
                          ? { bg: "#FEEBF4", text: "text-rose-700" }
                          : lead.estadoLead === "Interesado"
                            ? { bg: "#FEEED2", text: "text-amber-700" }
                            : lead.estadoLead === "No Venta"
                              ? { bg: "#FFE4DE", text: "text-red-700" }
                              : { bg: "#E5E7EB", text: "text-gray-700" };

                    const historialLead = historialPorLead[lead.id] || [];
                    const ultimaFecha =
                      historialLead.length > 0
                        ? formatFechaHora(
                          historialLead[historialLead.length - 1].fecha
                        )
                        : formatFecha(lead.fechaRegistro);

                    return (
                      <tr key={lead.id} className="border-t">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(lead.id)}
                            onChange={() => toggleSelectOne(lead.id)}
                          />
                        </td>

                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className="text-emerald-700 underline hover:text-emerald-900"
                            onClick={() => abrirModalInfo(lead)}
                          >
                            {lead.codigo}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          {formatFecha(lead.fechaRegistro)}
                        </td>
                        <td className="px-4 py-3">{ultimaFecha}</td>
                        <td className="px-4 py-3">{lead.numeroContacto}</td>
                        <td className="px-4 py-3">{lead.clienteVinculado}</td>
                        <td className="px-4 py-3">{lead.medioRegistro}</td>
                        <td className="px-4 py-3">{lead.asesor}</td>
                        <td className="px-4 py-3">{lead.supervisor}</td>
                        <td className="px-4 py-3">{lead.campania}</td>

                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-md text-xs font-medium text-nowrap ${estadoColor.text}`}
                            style={{ backgroundColor: estadoColor.bg }}
                          >
                            {lead.estadoLead}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          {lead.estadoLead === "Venta" ? (
                            <Button
                              variant="outline"
                              className="flex items-center gap-1 border-[#3B82F6] text-[#2563EB] text-xs font-medium hover:bg-blue-50 h-8"
                            >
                              <Eye className="h-4 w-4" />
                              Ver
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              className="flex items-center gap-1 border-emerald-600 text-emerald-700 text-xs font-medium hover:bg-emerald-50 h-8"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Venta
                            </Button>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {lead.estadoLead === "Venta" ? (
                            ""
                          ) : (
                            <Button
                              variant="outline"
                              className="flex items-center gap-1 border-emerald-600 text-emerald-700 text-xs font-medium hover:bg-emerald-50 h-8"
                              onClick={() => abrirModalActualizar(lead)}
                            >
                              <Pencil className="h-4 w-4" />
                              Actualizar
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-gray-500">
                <div>
                  Mostrando <span className="font-medium">{leadsPaginados.length}</span> de{" "}
                  <span className="font-medium">{totalLeads}</span> leads
                </div>

                <div className="flex gap-1 items-center">
                  <Button
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-7 min-w-[2rem] rounded-md border text-xs ${currentPage === page
                          ? "border-emerald-600 bg-emerald-50 font-semibold text-emerald-700"
                          : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  <Button
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {modalTransferirOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={() => setModalTransferirOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-semibold text-gray-800">Transferir Leads</h2>
            <p className="text-sm text-gray-600 mt-1">
              Está por transferir <b>{selectedIds.length}</b> lead(s)
            </p>

            <div className="mt-4">
              <div className="text-sm font-semibold text-gray-700">Asesor Actual</div>
              <div className="text-sm text-gray-600 mt-1">
                {asesoresActuales.join(", ")}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm font-semibold text-gray-700">Asesor Destino</div>
              <ReactSelect
                options={ASESORES}
                placeholder="Seleccione asesor"
                value={ASESORES.find((a) => a.value === asesorDestino) || null}
                onChange={(opt) => setAsesorDestino(opt?.value || "")}
              />
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Cantidad de leads seleccionados: <b>{selectedIds.length}</b>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setModalTransferirOpen(false)}
              >
                Cancelar
              </Button>

              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  alert(
                    `Transferidos ${selectedIds.length} leads al asesor ${asesorDestino}`
                  );
                  setModalTransferirOpen(false);
                }}
              >
                Transferir
              </Button>
            </div>
          </div>
        </div>
      )}

      {modalActualizarOpen && leadEnEdicion && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={cerrarModalActualizar}
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-semibold text-gray-800">
              Actualizar Estado del Lead
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Lead: <span className="font-semibold">{leadEnEdicion.codigo}</span> - Cliente:{" "}
              <span className="font-semibold">{leadEnEdicion.clienteVinculado}</span>
            </p>

            <div className="mt-5 border rounded-2xl p-4 bg-[#F9FAFB]">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Estado de Lead <span className="text-red-500">*</span>
                  </label>
                  <ReactSelect
                    options={ESTADOS_LEAD_MODAL}
                    placeholder="Seleccione estado"
                    value={
                      estadoSeleccionado
                        ? ESTADOS_LEAD_MODAL.find((e) => e.value === estadoSeleccionado) ||
                        null
                        : null
                    }
                    onChange={(opt) =>
                      setEstadoSeleccionado((opt?.value as LeadEstado) || "")
                    }
                  />
                </div>

                {esAgendado && (
                  <>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Fecha Pactada <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={fechaPactada}
                        onChange={(e) => setFechaPactada(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Hora Pactada <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="time"
                        value={horaPactada}
                        onChange={(e) => setHoraPactada(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>

              {(esAgendado || muestraSoloDetalle || esNoVenta) && (
                <div className="mt-4 space-y-1">
                  <label className="text-sm font-medium">Detalle de Estado</label>
                  <textarea
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none min-h-[80px]"
                    value={detalleEstado}
                    onChange={(e) => setDetalleEstado(e.target.value)}
                    placeholder="Describa el contexto o la acción realizada..."
                  />
                </div>
              )}
            </div>

            {esNoVenta && (
              <div className="mt-4 border rounded-2xl p-4 bg-[#F9FAFB]">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Detalle de No Venta
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      Estatus Específico <span className="text-red-500">*</span>
                    </label>
                    <ReactSelect
                      options={ESTATUS_ESPECIFICO_NO_VENTA.map((x) => ({
                        value: x,
                        label: x,
                      }))}
                      placeholder="Seleccione estatus"
                      value={
                        estatusEspecifico
                          ? { value: estatusEspecifico, label: estatusEspecifico }
                          : null
                      }
                      onChange={(opt) => setEstatusEspecifico(opt?.value || "")}
                    />
                  </div>

                  <div className="space-y-1 md:col-span-1">
                    <label className="text-sm font-medium">Observaciones</label>
                    <textarea
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none min-h-[80px]"
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Comentarios adicionales sobre la no venta..."
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 border rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Historial del Estado
              </h3>

              {historialDelLeadActual.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Aún no hay cambios registrados para este lead.
                </p>
              ) : (
                <div className="border-t pt-3">
                  {historialDelLeadActual.map((h, idx) => {
                    const esUltimo = idx === historialDelLeadActual.length - 1;
                    const numero = idx + 1;

                    return (
                      <div key={idx} className="flex items-start gap-2 mt-2">
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
                          {idx < historialDelLeadActual.length - 1 && (
                            <div className="w-px flex-1 bg-gray-300" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-800">
                            Estado: {h.estado}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatFechaHora(h.fecha)} · {h.usuario}
                          </div>

                          {h.fechaPactada && (
                            <div className="text-xs text-gray-600 mt-1">
                              <span className="font-semibold">Fecha Pactada: </span>
                              {formatFecha(h.fechaPactada)}
                              {h.horaPactada && ` · ${h.horaPactada}`}
                            </div>
                          )}

                          {h.detalle && (
                            <div className="text-xs text-gray-700 mt-1">
                              <span className="font-semibold">Detalle: </span>
                              {h.detalle}
                            </div>
                          )}

                          {h.estatusEspecifico && (
                            <div className="text-xs text-gray-700 mt-1">
                              <span className="font-semibold">Estatus específico: </span>
                              {h.estatusEspecifico}
                            </div>
                          )}

                          {h.observaciones && (
                            <div className="text-xs text-gray-700 mt-1">
                              <span className="font-semibold">Observaciones: </span>
                              {h.observaciones}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={cerrarModalActualizar}>
                Cancelar
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleClickGuardar}
              >
                Guardar cambios
              </Button>
            </div>
          </div>
        </div>
      )}

      {modalInfoOpen && leadInfoSeleccionado && (() => {
        const historialLeadInfo = historialPorLead[leadInfoSeleccionado.id] || [];
        const ultimaActualizacion =
          historialLeadInfo.length === 0
            ? formatFecha(leadInfoSeleccionado.fechaRegistro)
            : formatFechaHora(historialLeadInfo[historialLeadInfo.length - 1].fecha);

        return (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
            <div
              className="
                bg-white
                w-full
                max-w-md
                max-h-[80vh]
                overflow-y-auto
                rounded-xl
                shadow-lg
                p-6
                relative
                scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300
              "
            >
              <button
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                onClick={cerrarModalInfo}
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-xl font-semibold text-gray-800">
                Información del Lead
              </h2>

              <p className="text-sm text-gray-600 mt-1">
                Lead:{" "}
                <span className="font-semibold">{leadInfoSeleccionado.codigo}</span>{" "}
                - Cliente:{" "}
                <span className="font-semibold">
                  {leadInfoSeleccionado.clienteVinculado}
                </span>
              </p>

              <div className="mt-5 border rounded-2xl p-4 bg-[#F9FAFB] space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Lead Código</label>
                  <Input
                    value={leadInfoSeleccionado.codigo}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed border-gray-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Fecha Registro</label>
                  <Input
                    value={formatFecha(leadInfoSeleccionado.fechaRegistro)}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed border-gray-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Fecha Última Actualización</label>
                  <Input
                    value={ultimaActualizacion}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed border-gray-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Número Contacto</label>
                  <Input
                    value={leadInfoSeleccionado.numeroContacto}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed border-gray-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={getEmailFromLead(leadInfoSeleccionado)}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed border-gray-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Cliente Vinculado</label>
                  <Input
                    value={leadInfoSeleccionado.clienteVinculado}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed border-gray-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Medio Registro</label>
                  <Input
                    value={leadInfoSeleccionado.medioRegistro}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed border-gray-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Asesor</label>
                  <Input
                    value={leadInfoSeleccionado.asesor}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed border-gray-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Campaña</label>
                  <Input
                    value={leadInfoSeleccionado.campania}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed border-gray-300"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={cerrarModalInfo}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

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
              ¿Está seguro de actualizar el estado de este lead? Se registrará un nuevo
              movimiento en el historial.
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
}

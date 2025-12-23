import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { ListFilter, Eye, ShoppingCart, Pencil, X } from "lucide-react";
import { AppLayout } from "@/app/layout/AppLayout";
import ReactSelect from "react-select";
import { LeadService } from "@/services/leadService";
import { UserService } from "@/services/userService";
import { useNavigate } from "react-router-dom";
import { PedidoService } from "@/services/pedidoService";
import GenerarRecompraModal from "./components/GenerarRecompraModal";

type LeadEstado =
  | "Nuevo"
  | "Agendado"
  | "En Conversación"
  | "Interesado"
  | "Oferta enviada"
  | "Cierre pendiente"
  | "Afiliación SNN"
  | "No Venta"
  | "Venta";

type Lead = {
  id: number;
  idPedido: number | null;
  codigo: string;
  fechaRegistro: string;
  numeroContacto: string;
  clienteVinculado: string;
  medioRegistro: string;
  asesor: string;
  supervisor: string;
  mail: string;
  campania: string;
  estadoLead: LeadEstado | string;
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

type GetSeguimientoLeadItem = {
  id_Lead: number;
  id_Pedido?: number;
  fecha_Registro_Lead: string;
  numero_De_Contacto: string;
  cliente: string | null;
  medio_Registro_Lead: string;
  asesor: string;
  supervisor: string;
  mail: string;
  campana: string;
  estatus_Lead: string;
  codigo_Lead?: string;
};

type RSOption = {
  value: number;
  label: string;
};

const PAGE_SIZE = 5;

function formatFecha(f: string) {
  return f.split("-").reverse().join("/");
}

function formatFechaHora(fechaString: string) {

  const [fechaPart, ...horaParts] = fechaString.split(' ');

  const [parte1, parte2, yyyy] = fechaPart.split('/');

  const nuevaFecha = `${parte2}/${parte1}/${yyyy}`;

  const horaCompleta = horaParts.join(' ');

  return `${nuevaFecha} ${horaCompleta}`;
}

function getTodayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getFirstDayOfMonthIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function getEmailFromLead(lead: Lead) {
  return `${lead.codigo.toLowerCase()}@email.com`;
}

const ESTADO_LEAD = {
  NUEVO: 1,
  AGENDADO: 2,
  EN_CONVERSACION: 3,
  INTERESADO: 4,
  OFERTA_ENVIADA: 5,
  CIERRE_PENDIENTE: 6,
  AFILIACION_SNN: 7,
  VENTA: 8,
  NO_VENTA: 9,
} as const;

const ESTADOS_CON_DETALLE = new Set<number>([
  ESTADO_LEAD.AGENDADO,
  ESTADO_LEAD.EN_CONVERSACION,
  ESTADO_LEAD.INTERESADO,
  ESTADO_LEAD.OFERTA_ENVIADA,
  ESTADO_LEAD.CIERRE_PENDIENTE,
  ESTADO_LEAD.AFILIACION_SNN,
]);

export default function SeguimientoLead() {
  const navigate = useNavigate();

  const userLs = localStorage.getItem("sn_user");

  const [leads, setLeads] = useState<Lead[]>([]);

  const [fechaDesde, setFechaDesde] = useState(getFirstDayOfMonthIso());
  const [fechaHasta, setFechaHasta] = useState(getTodayIso());
  const [campaniasSeleccionadas, setCampaniasSeleccionadas] = useState<number[]>([]);
  const [asesoresSeleccionados, setAsesoresSeleccionados] = useState<number[]>([]);
  const [estadosSeleccionados, setEstadosSeleccionados] = useState<number[]>([]);
  const [asesoresFiltroOptions, setAsesoresFiltroOptions] = useState<RSOption[]>([]);
  const [campanasFiltroOptions, setCampanasFiltroOptions] = useState<RSOption[]>([]);
  const [estatusLeadOptions, setEstatusLeadOptions] = useState<RSOption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [modalTransferirOpen, setModalTransferirOpen] = useState(false);
  const [asesorDestino, setAsesorDestino] = useState<number | null>(null);

  // Para Modal ACTUALIZAR
  const [modalActualizarOpen, setModalActualizarOpen] = useState(false);
  const [leadEnEdicion, setLeadEnEdicion] = useState<Lead | null>(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<number | null>(null);
  const [estadoNombre, setEstadoNombre] = useState<string | null>(null);
  const [detalleEstado, setDetalleEstado] = useState("");
  const [fechaPactada, setFechaPactada] = useState("");
  const [horaPactada, setHoraPactada] = useState("");
  const [estatusEspecifico, setEstatusEspecifico] = useState<number | null>(null);
  const [estatusEspecificoOptions, setEstatusEspecificoOptions] = useState<RSOption[]>([]);
  const [observaciones, setObservaciones] = useState("");

  // Para Modal INFO LEAD
  const [modalInfoOpen, setModalInfoOpen] = useState(false);
  const [leadInfoSeleccionado, setLeadInfoSeleccionado] = useState<Lead | null>(null);

  // Para Modal CONFIRMACIÓN GUARDAR
  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);

  // Para modal de confirmación de TRANSFERENCIA
  const [modalConfirmTransferOpen, setModalConfirmTransferOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [openGenerarRecompraModal, setOpenGenerarRecompraModal] = useState(false)

  const [idPedido, setIdPedido] = useState<number | null>(null)

  const [numeroContactoFiltro, setNumeroContactoFiltro] = useState("");
  const [clienteVinculadoFiltro, setClienteVinculadoFiltro] = useState("");

  const irACrearPedido = (lead: Lead) => {
    // El estado SOLO existe durante esta navegación específica
    navigate('/pedidos/crear', {
      state: {
        modo: "venta",
        idLead: lead.id.toString(),
        numeroContacto: lead.numeroContacto,
        from: "seguimiento-lead"
      }
    });
  };

  const formatearFechaDMY = (fechaISO: string) => {
    const [year, month, day] = fechaISO.split("-");
    return `${day}/${month}/${year}`;
  };

  const buildUpdateBody = ({
    leadEnEdicion,
    id_Estatus_Lead,
    detalleEstado,
    idUsuario,
    esAgendado,
    fechaPactada,
    horaPactada,
    esNoVenta,
    estatusEspecifico,
    observaciones,
  }: any) => {

    const base: any = {
      id_Lead: leadEnEdicion.id,
      id_Estatus_Lead,
      detalle_del_Estado: detalleEstado,
      id_Usuario_Registro_Historico_Estado_Lead: idUsuario,
      requestInsertHistoricoEstadoLeadAgendado: null,
      requestInsertHistoricoEstadoLeadNoVenta: null,
    };

    if (esAgendado) {
      base.requestInsertHistoricoEstadoLeadAgendado = {
        fecha_Pactada: formatearFechaDMY(fechaPactada),
        hora_Pactada: horaPactada,
        id_Usuario_Registro_Historico_Estado_Lead_Agendado: idUsuario,
      };
    }

    if (esNoVenta) {
      base.requestInsertHistoricoEstadoLeadNoVenta = {
        estatus_Especifico: estatusEspecifico,
        observaciones: observaciones,
        id_Usuario_Registro_Historico_Estado_Lead_No_Venta: idUsuario,
      };
    }

    return base;
  };

  const buildTransferBody = (idsLead: number[], idAsesorDestino: number, idUsuario: number) => {
    return {
      id_Lead: idsLead,
      requestDatosUsuarioUpdateHistoricoAsesorLead: {
        id_Asesor_Nuevo: idAsesorDestino,
        id_Usuario_Registro_Historico_Asesor_Lead: idUsuario,
      }
    };
  };

  const [toastMsg, setToastMsg] = useState<{
    msg: string;
    type: "error" | "success";
  } | null>(null);

  const showToast = (msg: string, type: "error" | "success" = "error") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Historial por lead
  const [historialPorLead, setHistorialPorLead] = useState<Record<number, HistorialEstado[]>>({});

  const mapItemToLead = (item: GetSeguimientoLeadItem): Lead => {
    let fechaRegistro = "";
    if (item.fecha_Registro_Lead) {
      const d = new Date(item.fecha_Registro_Lead);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        fechaRegistro = `${yyyy}-${mm}-${dd}`;
      }
    }

    return {
      id: item.id_Lead,
      idPedido: item.id_Pedido || null,
      codigo: item.codigo_Lead || `${item.id_Lead}`,
      fechaRegistro,
      numeroContacto: item.numero_De_Contacto,
      clienteVinculado: item.cliente || "",
      medioRegistro: item.medio_Registro_Lead,
      asesor: item.asesor,
      supervisor: item.supervisor,
      mail: item.mail,
      campania: item.campana,
      estadoLead: item.estatus_Lead as LeadEstado | string,
    };
  };

  // =========================
  // VERSIÓN ACTUAL (usa NUMBER)
  // =========================

  const cargarLeads = async (page: number) => {
    try {
      setIsLoading(true);
      // setSelectedIds([]);

      const fechaInicioIso = new Date(`${fechaDesde}T00:00:00`).toISOString();
      const fechaFinIso = new Date(`${fechaHasta}T23:59:59`).toISOString();


      // ============================
      // 1. CAMPAÑAS → arrays (para el futuro)
      // ============================
      const campaniaId = campaniasSeleccionadas[0] || 0; // SOLO PARA SERVICIO ACTUAL


      // ============================
      // 2. ASESORES → arrays (para el futuro)
      // ============================
      let idAsesorActual = 0;

      if (userLs && JSON.parse(userLs).id_Tipo_Usuario === 8) {
        // Asesor logueado solo puede verse a sí mismo
        idAsesorActual = JSON.parse(userLs).id_Usuario;
      } else {
        // Supervisor/Admin → toma el primer asesor seleccionado
        idAsesorActual = asesoresSeleccionados[0] || 0;
      }


      // ============================
      // 3. ESTADOS → arrays (para el futuro)
      // ============================
      const estadoId = estadosSeleccionados[0] || 0; // SOLO PARA SERVICIO ACTUAL

      // ============================
      // 4. Console.log → SIEMPRE ARRAYS
      // ============================
      // console.log({
      //   number: page,
      //   size: PAGE_SIZE,
      //   fechaInicio: fechaInicioIso,
      //   fechaFin: fechaFinIso,
      //   idCampanas: campaniasIdList,
      //   idAsesores: asesoresIdList,
      //   idEstados: estadosIdList
      // });


      // ============================
      // 5. Llamado al servicio ACTUAL
      // ============================
      const res = await LeadService.getSeguimientoLead({
        number: page,
        size: PAGE_SIZE,
        fechaInicio: fechaInicioIso,
        fechaFin: fechaFinIso,
        idCampana: campaniaId,      // NUMBER
        idAsesorActual: idAsesorActual, // NUMBER
        idEstatusLead: estadoId     // NUMBER
      });


      // ============================
      // Procesamiento de resultados
      // ============================
      const data = res.data || {};
      const lista: GetSeguimientoLeadItem[] = Array.isArray(data.seguimientoLead)
        ? data.seguimientoLead
        : [];

      const mapped = lista.map(mapItemToLead);

      setLeads(mapped);
      setCurrentPage(data.page || page || 1);
      setTotalPages(data.totalPages || 1);

      const totalReg = data.totalRegisters || data.totalRecords || mapped.length;
      setTotalLeads(totalReg);

    } catch (error) {
      console.error(error);
      showToast("Error al obtener los leads.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltrarClick = () => {
    setSelectedIds([]);   // ← limpiar selección de Transferir Leads, al aplicar nuevos filtros
    cargarLeads(1);
  };

  const handleLimpiarFiltros = () => {
    setSelectedIds([]);   // ← limpiar selecciónde Transferir Leads, cuando reinicias todo
    setFechaDesde(getFirstDayOfMonthIso());
    setFechaHasta(getTodayIso());
    setCampaniasSeleccionadas([]);
    setAsesoresSeleccionados([]);
    setEstadosSeleccionados([]);
    setCurrentPage(1);
    cargarLeads(1);
  };

  useEffect(() => {
    cargarLeads(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [
          asesoresRes,
          campanasRes,
          estatusRes,
          estatusEspRes,
        ] = await Promise.all([
          UserService.getAsesorDropDown(),
          LeadService.getCampanaForDropDown(),
          LeadService.getEstatusLeadForDropDown(),
          LeadService.getEstatusEspecificoLeadForDropDown(),
        ]);

        // ============================
        // ASESORES
        // ============================
        if (!asesoresRes.error) {
          setAsesoresFiltroOptions(
            asesoresRes.data.map((a) => ({
              value: a.id_Usuario,
              label: a.asesor,
            }))
          );
        } else {
          setAsesoresFiltroOptions([]);
        }

        // ============================
        // CAMPAÑAS
        // ============================
        if (!campanasRes.error) {
          setCampanasFiltroOptions(
            campanasRes.data.map((c) => ({
              value: c.id_Campana,
              label: c.campana,
            }))
          );
        } else {
          setCampanasFiltroOptions([]);
        }

        // ============================
        // ESTATUS LEAD
        // ============================
        if (!estatusRes.error) {
          setEstatusLeadOptions(
            estatusRes.data.map((e) => ({
              value: e.id_Estatus_Lead,
              label: e.estatus_Lead,
            }))
          );
        } else {
          setEstatusLeadOptions([]);
        }

        // ============================
        // ESTATUS ESPECÍFICO (NO VENTA)
        // ============================
        if (!estatusEspRes.error) {
          setEstatusEspecificoOptions(
            estatusEspRes.data.map((e) => ({
              value: e.id_Estatus_Especifico_Lead,
              // ⚠️ label temporal hasta que backend mande descripción
              label: e.estado_Estatus_Especifico_Lead,
            }))
          );
        } else {
          setEstatusEspecificoOptions([]);
        }

      } catch (error) {
        console.error("Error cargando filtros", error);

        setAsesoresFiltroOptions([]);
        setCampanasFiltroOptions([]);
        setEstatusLeadOptions([]);
        setEstatusEspecificoOptions([]);
      }
    };

    fetchFilters();
  }, []);


  const leadsPaginados = useMemo(() => leads, [leads]);

  const toggleSelectAll = () => {
    const idsPagina = leadsPaginados.map((l) => l.id);
    const allSelected = idsPagina.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !idsPagina.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...idsPagina])]);
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const totalSeleccionados = selectedIds.length;

  let asesoresActuales: string[] = [];
  if (userLs && JSON.parse(userLs).id_Tipo_Usuario !== 8) {//si el que se logueo es distinto a asesor
    asesoresActuales = Array.from(
      new Set(leads.filter((l) => selectedIds.includes(l.id)).map((l) => l.asesor))
    );
  } else {
    asesoresActuales = [userLs && JSON.parse(userLs).nombres];
  }

  const abrirModalActualizar = (lead: Lead) => {
    const estadoDeTabla = lead.estadoLead; // texto: "Agendado", "No Venta", etc.

    // buscar ID a partir del label
    const estadoObj = estatusLeadOptions.find(e => e.label === estadoDeTabla) ?? null;

    // si lo encontró, el id es estadoObj.value
    setEstadoSeleccionado(estadoObj?.value ?? null);

    setLeadEnEdicion(lead);
    setDetalleEstado("");
    setFechaPactada("");
    setHoraPactada("");
    setEstatusEspecifico(null);
    setObservaciones("");
    setModalActualizarOpen(true);
  };

  useEffect(() => {
    const fetchHistorial = async () => {
      const id =
        leadEnEdicion?.id ??
        leadInfoSeleccionado?.id ??
        null;

      const modalAbierto =
        modalActualizarOpen || modalInfoOpen;

      if (!modalAbierto || !id) return;

      const res = await LeadService.getDetalleActualizarEstadoLead({
        id_Lead: id,
      });
      const historial = res?.data?.getHistoricoEstadoLeads || [];

      const mapped = historial.map((x: any) => ({
        estado: x.estatus_Lead,
        fecha: x.fecha_Registro_Historico_Estado_Lead,
        usuario: x.usuario,
        detalle: x.detalle_del_Estado,
        fechaPactada: x.getHistoricoEstadoLeadAgendado?.fecha_Pactada || "",
        horaPactada: x.getHistoricoEstadoLeadAgendado?.hora_Pactada || "",
        estatusEspecifico:
          x.getHistoricoEstadoLeadNoVenta?.estatus_Especifico || "",
        observaciones:
          x.getHistoricoEstadoLeadNoVenta?.observaciones || "",
      }));

      setHistorialPorLead((prev) => ({
        ...prev,
        [id]: mapped,
      }));
    };

    fetchHistorial();
  }, [modalActualizarOpen, modalInfoOpen, leadEnEdicion, leadInfoSeleccionado]);

  const cerrarModalActualizar = () => {
    setModalActualizarOpen(false);
    setLeadEnEdicion(null);
    setEstadoSeleccionado(null);
    setDetalleEstado("");
    setFechaPactada("");
    setHoraPactada("");
    setEstatusEspecifico(null);
    setObservaciones("");
  };

  const abrirModalInfo = (lead: Lead) => {
    setLeadInfoSeleccionado(lead);
    setModalInfoOpen(true);
  };

  const cerrarModalInfo = () => {
    setModalInfoOpen(false);
    setLeadInfoSeleccionado(null);
  };

  const abrirModalTransferir = () => {
    if (selectedIds.length === 0) {
      showToast("Debe seleccionar al menos un lead para transferir.", "error");
      return;
    }
    setModalTransferirOpen(true);
  };

  const cerrarModalTransferir = () => {
    setModalTransferirOpen(false);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    cargarLeads(page);
  };

  const esAgendado = estadoSeleccionado === ESTADO_LEAD.AGENDADO;
  const esNoVenta = estadoSeleccionado === ESTADO_LEAD.NO_VENTA;
  const soloDetalleEstados: LeadEstado[] = [
    "En Conversación",
    "Interesado",
    "Oferta enviada",
    "Cierre pendiente",
    "Afiliación SNN",
  ];

  const historialDelLeadActual =
    leadEnEdicion && historialPorLead[leadEnEdicion.id]
      ? historialPorLead[leadEnEdicion.id]
      : [];

  const handleGuardarClick = () => {
    if (!leadEnEdicion) return;

    if (!estadoSeleccionado) {
      showToast("Debe seleccionar un estado.", "error");
      return;
    }

    if (esAgendado && (!fechaPactada || !horaPactada)) {
      showToast("Debe indicar fecha y hora pactadas.", "error");
      return;
    }

    if (esNoVenta && !estatusEspecifico) {
      showToast("Debe seleccionar un estatus específico.", "error");
      return;
    }

    if (!detalleEstado.trim()) {
      showToast("Debe ingresar un detalle del estado.", "error");
      return;
    }

    setModalConfirmOpen(true);
  };

  const confirmarGuardar = async () => {
    if (!leadEnEdicion) return;

    let idUsuario = 0;

    if (userLs) {
      try {
        idUsuario = JSON.parse(userLs).id_Usuario || 0;
      } catch {
        idUsuario = 0;
      }
    }

    const id_Estatus_Lead = estadoSeleccionado ?? 0;

    const body = buildUpdateBody({
      leadEnEdicion,
      id_Estatus_Lead: estadoSeleccionado ?? 0,
      detalleEstado,
      idUsuario,
      esAgendado,
      fechaPactada,
      horaPactada,
      esNoVenta,
      id_Estatus_Especifico_Lead: estatusEspecifico ?? 0,
      observaciones,
    });
    // console.log(body);
    try {
      await LeadService.updateHistoricoEstadoLead(body);

      showToast("Estado actualizado correctamente.", "success");

      cargarLeads(currentPage);

      setModalConfirmOpen(false);
      setModalActualizarOpen(false);

    } catch (err) {
      console.error(err);
      showToast("Ocurrió un error al actualizar el estado.", "error");
    }
  };

  const cancelarConfirmacion = () => {
    setModalConfirmOpen(false);
  };

  const ultimaActualizacion =
    leadInfoSeleccionado && historialPorLead[leadInfoSeleccionado.id]
      ? formatFechaHora(
        historialPorLead[leadInfoSeleccionado.id][
          historialPorLead[leadInfoSeleccionado.id].length - 1
        ].fecha
      )
      : leadInfoSeleccionado
        ? formatFecha(leadInfoSeleccionado.fechaRegistro)
        : "";

  const confirmarTransferencia = async () => {
    if (selectedIds.length === 0) {
      showToast("No hay leads seleccionados.", "error");
      return;
    }

    if (!asesorDestino) {
      showToast("Seleccione un asesor destino.", "error");
      return;
    }

    let idUsuario = 0;

    if (userLs) {
      try {
        idUsuario = JSON.parse(userLs).id_Usuario || 0;
      } catch {
        idUsuario = 0;
      }
    }

    const idAsesorDestino = asesorDestino; // 👈 YA ES EL ID REAL

    const body = buildTransferBody(
      selectedIds,
      idAsesorDestino,
      idUsuario
    );

    try {
      await LeadService.transferirLeads(body);

      // Actualización optimista (si no es super admin)
      if (userLs && JSON.parse(userLs).id_Tipo_Usuario !== 3) {
        setLeads(prev =>
          prev.map(l =>
            selectedIds.includes(l.id)
              ? { ...l, id_Asesor_Actual: idAsesorDestino }
              : l
          )
        );
      }

      showToast("Leads transferidos correctamente.", "success");

      setModalTransferirOpen(false);
      setSelectedIds([]);
      setAsesorDestino(null);

      cargarLeads(currentPage);

    } catch (error) {
      console.error(error);
      showToast("Ocurrió un error al transferir los leads.", "error");
    }
  };

  const confirmarTransferenciaFinal = async () => {
    setModalConfirmTransferOpen(false);
    await confirmarTransferencia();
  };

  const abrirDetallePedido = (lead: Lead) => {
    setIdPedido(lead.idPedido);
    setOpenGenerarRecompraModal(true);
  };
  const cerrarDetallePedido = () => {
    setOpenGenerarRecompraModal(false);
  };

  const estadoBloqueado =
    leadEnEdicion?.estadoLead === "Venta" ||
    leadEnEdicion?.estadoLead === "No Venta";

  return (
    <AppLayout title="Seguimiento de Lead">
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
              <div className="h-8 w-8 rounded-full bg-[#E5F8F0] flex items-center justify-center">
                <ListFilter className="w-5 h-5 text-[#006341]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Seguimiento de Lead
                </h2>
                <p className="text-xs text-gray-500">
                  Revisa el estado de tus leads, actualiza su gestión y realiza ventas.
                </p>
              </div>
            </div>

            {totalSeleccionados > 0 && (
              <Button
                className="bg-emerald-800 hover:bg-emerald-700 text-white"
                onClick={abrirModalTransferir}
              >
                Transferir Leads: {totalSeleccionados}
              </Button>
            )}
          </div>

          <div className="space-y-5 bg-white px-6 py-5">
            <div className="grid items-end gap-4 rounded-2xl bg-[#F7F8FA] p-4 md:grid-cols-5 lg:grid-cols-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Fecha desde</label>
                <Input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Fecha hasta</label>
                <Input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Número de contacto</label>
                <Input
                  placeholder="Ej: 51987654321"
                  value={numeroContactoFiltro}
                  onChange={(e) => setNumeroContactoFiltro(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Cliente vinculado</label>
                <Input
                  placeholder="Nombre del cliente"
                  value={clienteVinculadoFiltro}
                  onChange={(e) => setClienteVinculadoFiltro(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Campaña</label>
                <ReactSelect
                  isMulti
                  classNamePrefix="rs"
                  options={campanasFiltroOptions}
                  getOptionValue={(opt) => String(opt.value)}
                  getOptionLabel={(opt) => opt.label}
                  value={campanasFiltroOptions.filter((c) =>
                    campaniasSeleccionadas.includes(c.value)
                  )}
                  onChange={(opts) =>
                    setCampaniasSeleccionadas((opts ?? []).map((o) => o.value))
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

              {userLs && JSON.parse(userLs).id_Tipo_Usuario === 8 ?
                null :
                <div className="space-y-1">
                  <label className="text-sm font-medium">Asesor</label>
                  <ReactSelect
                    isMulti
                    classNamePrefix="rs"
                    options={asesoresFiltroOptions}
                    getOptionValue={(opt) => String(opt.value)}
                    getOptionLabel={(opt) => opt.label}
                    value={asesoresFiltroOptions.filter((a) =>
                      asesoresSeleccionados.includes(a.value)
                    )}
                    onChange={(opts) =>
                      setAsesoresSeleccionados((opts ?? []).map((o) => o.value))
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
              }

              <div className="space-y-1">
                <label className="text-sm font-medium">Estado de Lead</label>
                <ReactSelect
                  isMulti
                  classNamePrefix="rs"
                  options={estatusLeadOptions}
                  value={estatusLeadOptions.filter((e) =>
                    estadosSeleccionados.includes(e.value)
                  )}
                  onChange={(opts) =>
                    setEstadosSeleccionados((opts ?? []).map((o) => o.value))
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

              <div className="flex flex-col sm:flex-row justify-start md:justify-end lg:col-span-1 gap-2">
                <Button
                  className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-700 text-white"
                  onClick={handleFiltrarClick}
                >
                  Filtrar
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={handleLimpiarFiltros}
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border">
              <div className="overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F7F8FA] border-b">
                    <tr className="text-xs font-medium text-gray-500 uppercase">
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          checked={
                            leadsPaginados.length > 0 &&
                            leadsPaginados.every((l) => selectedIds.includes(l.id))
                          }
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="px-4 py-3 text-left">Lead</th>
                      <th className="px-4 py-3 text-left">Fecha Registro</th>
                      <th className="px-4 py-3 text-left">Número Contacto</th>
                      <th className="px-4 py-3 text-left">Cliente Vinculado</th>
                      <th className="px-4 py-3 text-left">Medio Registro</th>
                      <th className="px-4 py-3 text-left">Asesor</th>
                      <th className="px-4 py-3 text-left">Supervisor</th>
                      <th className="px-4 py-3 text-left">Campaña</th>
                      <th className="px-4 py-3 text-left">Estado Lead</th>
                      <th className="px-4 py-3 text-left">Venta</th>
                      <th className="px-4 py-3 text-left">Gestión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={13} className="px-4 py-6 text-center text-gray-400">
                          Cargando leads...
                        </td>
                      </tr>
                    ) : leadsPaginados.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="px-4 py-6 text-center text-gray-400">
                          No hay leads para los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      <>
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
                              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                              checked={selectedIds.includes(lead.id)}
                              onChange={() => toggleSelectOne(lead.id)}
                            />
                          </td>

                          <td className="px-4 py-3">
                            <button
                              onClick={() => abrirModalInfo(lead)}
                              className="text-sm font-semibold text-emerald-700 underline hover:text-emerald-800"
                            >
                              {lead.codigo}
                            </button>
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-600">
                            {formatFecha(lead.fechaRegistro)}
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-800">
                            {lead.numeroContacto}
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-800">
                            {lead.clienteVinculado || "-"}
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-600">
                            {lead.medioRegistro}
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-800">
                            {lead.asesor}
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-600">
                            {lead.supervisor || "-"}
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-800">
                            {lead.campania}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${estadoColor.text}`}
                              style={{ backgroundColor: estadoColor.bg }}
                            >
                              {lead.estadoLead}
                            </span>
                          </td>

                          <td className="px-4 py-3">

                            {/* --- Mostrar VER cuando el lead ya es Venta --- */}
                            {lead.estadoLead === "Venta" && (
                              <Button
                                variant="outline"
                                className="flex items-center gap-1 border-[#2B7FFF] text-[#2B7FFF] 
                                          text-xs font-medium hover:bg-[#2B7FFF] hover:text-white h-8"
                                onClick={() => abrirDetallePedido(lead)}
                              >
                                <Eye className="h-4 w-4" />
                                Ver
                              </Button>
                            )}

                            {/* --- Mostrar VENTA si no es Venta, no es No Venta, y no tiene cliente vinculado --- */}
                            {lead.estadoLead !== "Venta" &&
                              lead.estadoLead !== "No Venta" &&
                              (!lead.clienteVinculado || lead.clienteVinculado.trim() === "") && (
                                <Button
                                  variant="outline"
                                  className="flex items-center gap-1 border-emerald-700 text-emerald-700 
                                            text-xs font-medium hover:bg-emerald-50 h-8"
                                  onClick={() => irACrearPedido(lead)}
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                  Venta
                                </Button>
                              )}

                          </td>

                          <td className="px-4 py-3">
                            <Button
                              variant="outline"
                              className="flex items-center gap-1 border-emerald-700 text-emerald-700 text-xs font-medium hover:bg-emerald-50 h-8"
                              onClick={() => abrirModalActualizar(lead)}
                            >
                              <Pencil className="h-4 w-4" />
                              Actualizar
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-gray-500">
                <div>
                  Mostrando <span className="font-medium">{leadsPaginados.length}</span> de{" "}
                  <span className="font-medium">{totalLeads}</span> leads
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="px-2 py-1 rounded border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                  <span>
                    Página <span className="font-semibold">{currentPage}</span> de{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </span>
                  <button
                    className="px-2 py-1 rounded border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* MODAL TRANSFERIR LEADS */}
      {modalTransferirOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={cerrarModalTransferir}
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-semibold text-gray-800">Transferir Leads</h2>
            <p className="text-sm text-gray-600 mt-1">
              Estás por transferir{" "}
              <span className="font-semibold">{totalSeleccionados} lead(s)</span>
            </p>

            <div className="mt-4">
              <div className="text-sm font-semibold text-gray-700">Asesor Actual</div>
              <div className="text-sm text-gray-600 mt-1">{asesoresActuales.length > 0 ? asesoresActuales.join(", ") : "N/A"}</div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-sm font-semibold text-gray-700">Asesor Destino</label>
              <ReactSelect
                classNamePrefix="rs"
                options={asesoresFiltroOptions}
                value={
                  asesoresFiltroOptions.find(a => a.value === asesorDestino) ?? null
                }
                onChange={(opt) => setAsesorDestino(opt?.value ?? null)}
                placeholder="Seleccione asesor destino"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
            </div>
            <div className="mt-4 text-sm text-gray-600">Cantidad de leads seleccionados: <b>{totalSeleccionados}</b></div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={cerrarModalTransferir}
              >
                Cancelar
              </Button>

              <Button
                onClick={() => setModalConfirmTransferOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Transferir
              </Button>
            </div>
          </div>
        </div>
      )}

      {modalActualizarOpen && leadEnEdicion && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-6 relative">
            {/* BOTÓN CERRAR */}
            <button
              onClick={cerrarModalActualizar}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            {/* HEADER */}
            <h2 className="text-xl font-semibold text-gray-800">
              Actualizar Estado del Lead
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Lead: <span className="font-semibold">{leadEnEdicion.codigo}</span>{" "}
              - Cliente:{" "}
              <span className="font-semibold">
                {leadEnEdicion.clienteVinculado || "Sin nombre"}
              </span>
            </p>

            {/* =======================
          ESTADO SELECCIONADO
      ======================= */}
            <div className="mt-6 space-y-1">
              <label className="text-sm font-semibold text-gray-800">
                Estado de Lead
              </label>
              <ReactSelect
                isDisabled={estadoBloqueado}
                options={estatusLeadOptions.filter(e => e.value !== 8)} // excluye Venta
                value={
                  estatusLeadOptions.find(e => e.value === estadoSeleccionado) ?? null
                }
                onChange={(opt) => {
                  if (!estadoBloqueado) {
                    setEstadoSeleccionado(opt?.value ?? null);
                    setEstadoNombre(opt?.label ?? null);
                  }
                }}
                placeholder="Seleccione estado"
              />
            </div>

            {/* =======================
          CAMPOS SEGÚN ESTADO
      ======================= */}
            {estadoSeleccionado === ESTADO_LEAD.AGENDADO && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Fecha Pactada</label>
                  <Input
                    type="date"
                    value={fechaPactada}
                    onChange={(e) => setFechaPactada(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Hora Pactada</label>
                  <Input
                    type="time"
                    value={horaPactada}
                    onChange={(e) => setHoraPactada(e.target.value)}
                  />
                </div>
              </div>
            )}

            {!estadoBloqueado && 
              (
                estadoSeleccionado === ESTADO_LEAD.NO_VENTA ||
                (estadoSeleccionado !== null &&
                  ESTADOS_CON_DETALLE.has(estadoSeleccionado))
            ) && (
                <div className="mt-4 space-y-1">
                  <label className="text-sm font-medium">Detalle de Estado</label>
                  <textarea
                    value={detalleEstado}
                    onChange={(e) => setDetalleEstado(e.target.value)}
                    placeholder="Describa la gestión realizada..."
                    className="w-full p-2 rounded-md border border-gray-300 min-h-[80px] focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              )}

            {!estadoBloqueado && estadoSeleccionado === ESTADO_LEAD.NO_VENTA && (
              <div className="mt-4 border rounded-2xl p-4 bg-[#F9FAFB]">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Detalle de No Venta
                </h3>

                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Estatus Específico <span className="text-red-500">*</span>
                  </label>
                  <ReactSelect
                    options={estatusEspecificoOptions}
                    value={
                      estatusEspecificoOptions.find(
                        (x) => x.value === estatusEspecifico
                      ) ?? null
                    }
                    onChange={(opt) => setEstatusEspecifico(opt?.value ?? null)}
                    placeholder="Seleccione estatus"
                    isDisabled={estadoSeleccionado !== ESTADO_LEAD.NO_VENTA}
                  />
                </div>

                <div className="space-y-1 mt-3">
                  <label className="text-sm font-medium">Observaciones</label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full rounded-md border border-gray-300 min-h-[80px]"
                  />
                </div>
              </div>
            )}

            {/* =======================
          HISTORIAL DEL ESTADO
          (nuevo bloque PRO)
      ======================= */}

            {historialDelLeadActual.length > 0 && (
              <div className="mt-6 border rounded-2xl p-4 bg-white">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Historial del Estado
                </h3>

                <div className="border-t pt-3 space-y-3 max-h-36 overflow-y-auto">
                  {historialDelLeadActual.map((h, idx) => {
                    const esUltimo = idx === historialDelLeadActual.length - 1;

                    return (
                      <div key={idx} className="flex items-start gap-3">
                        {/* CÍRCULO + LÍNEA */}
                        <div className="flex flex-col items-center">
                          <div
                            className={
                              esUltimo
                                ? "w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs"
                                : "w-6 h-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs"
                            }
                          >
                            {esUltimo ? "✓" : idx + 1}
                          </div>
                          {!esUltimo && <div className="w-px flex-1 bg-gray-300" />}
                        </div>

                        {/* INFO */}
                        <div className="flex-1 text-xs">
                          <div className="font-semibold text-gray-500">
                            Estado: <span className="font-medium text-[#006341]">{h.estado}</span>
                          </div>
                          <div className=" text-gray-500 text-[10px]">
                            {formatFechaHora(h.fecha)} por {h.usuario}
                          </div>

                          {h.detalle && (
                            <div className="mt-0.5 text-gray-700 text-[10px] leading-normal">Detalle de Estado: {h.detalle}</div>
                          )}

                          {h.fechaPactada && (
                            <div className="mt-0.5 text-gray-600 text-[10px] leading-normal">
                              <span className="font-semibold">Pactado: </span>
                              {formatFechaHora(h.fechaPactada)} · {h.horaPactada}
                            </div>
                          )}

                          {h.estatusEspecifico && (
                            <div className="mt-0.5 text-gray-600 text-[10px] leading-normal">
                              <span className="font-semibold">
                                Estatus específico:
                              </span>{" "}
                              {h.estatusEspecifico}
                            </div>
                          )}

                          {h.observaciones && (
                            <div className="mt-0.5 text-gray-600 text-[10px] leading-normal">
                              <span className="font-semibold">Observaciones:</span>{" "}
                              {h.observaciones}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =======================
          BOTONES INFERIORES
      ======================= */}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={cerrarModalActualizar}>
                Cancelar
              </Button>

              <Button
                disabled={estadoBloqueado}
                className={` ${estadoBloqueado
                    ? "text-[#999] bg-[#F2F2F2] cursor-not-allowed hover:bg-[#F2F2F2]"
                    : "text-white bg-emerald-600 hover:bg-emerald-700"
                  }`}
                onClick={!estadoBloqueado ? handleGuardarClick : undefined}
              >
                Actualizar Estado
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN TRANSFERIR LEADS */}
      {modalConfirmTransferOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-lg p-6 relative">
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={() => setModalConfirmTransferOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Confirmar transferencia
            </h2>

            <p className="text-sm text-gray-600">
              ¿Estás seguro que deseas transferir{" "}
              <span className="font-semibold">{totalSeleccionados}</span>{" "}
              lead(s) al asesor{" "}
              <span className="font-semibold">{asesorDestino}</span>?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setModalConfirmTransferOpen(false)}
              >
                Cancelar
              </Button>

              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={confirmarTransferenciaFinal}
              >
                Sí, transferir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INFO LEAD */}
      {modalInfoOpen && leadInfoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-lg p-6 relative">
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={cerrarModalInfo}
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Información del Lead
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <label className="text-sm font-medium">Código Lead</label>
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
                <label className="text-sm font-medium">Cliente Vinculado</label>
                <Input
                  value={leadInfoSeleccionado.clienteVinculado}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed border-gray-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={leadInfoSeleccionado.mail}
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
                <label className="text-sm font-medium">Campaña</label>
                <Input
                  value={leadInfoSeleccionado.campania}
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
                <label className="text-sm font-medium">Supervisor</label>
                <Input
                  value={leadInfoSeleccionado.supervisor || "-"}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed border-gray-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Estado Actual</label>
                <Input
                  value={leadInfoSeleccionado.estadoLead}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed border-gray-300"
                />
              </div>
            </div>

            {historialPorLead[leadInfoSeleccionado.id]?.length > 0 && (
              <div className="mt-6 border rounded-2xl p-4 bg-white">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Historial del Estado
                </h3>

                <div className="border-t pt-3 space-y-3 max-h-48 overflow-y-auto">
                  {historialPorLead[leadInfoSeleccionado.id].map((h, idx) => {
                    const historial = historialPorLead[leadInfoSeleccionado.id];
                    const esUltimo = idx === historial.length - 1;

                    return (
                      <div key={idx} className="flex items-start gap-3">
                        {/* CÍRCULO + LÍNEA */}
                        <div className="flex flex-col items-center">
                          <div
                            className={
                              esUltimo
                                ? "w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs"
                                : "w-6 h-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs"
                            }
                          >
                            {esUltimo ? "✓" : idx + 1}
                          </div>

                          {!esUltimo && <div className="w-px flex-1 bg-gray-300" />}
                        </div>

                        {/* INFO */}
                        <div className="flex-1 text-xs">
                          <div className="font-semibold text-gray-500">
                            Estado:{" "}
                            <span className="font-medium text-[#006341]">{h.estado}</span>
                          </div>

                          <div className="text-gray-500 text-[10px]">
                            {formatFechaHora(h.fecha)} por {h.usuario}
                          </div>

                          {h.detalle && (
                            <div className="mt-0.5 text-gray-700 text-[10px] leading-normal">
                              Detalle de Estado: {h.detalle}
                            </div>
                          )}

                          {h.fechaPactada && (
                            <div className="mt-0.5 text-gray-600 text-[10px] leading-normal">
                              <span className="font-semibold">Pactado: </span>
                              {formatFechaHora(h.fechaPactada)} · {h.horaPactada}
                            </div>
                          )}

                          {h.estatusEspecifico && (
                            <div className="mt-0.5 text-gray-600 text-[10px] leading-normal">
                              <span className="font-semibold">Estatus específico:</span>{" "}
                              {h.estatusEspecifico}
                            </div>
                          )}

                          {h.observaciones && (
                            <div className="mt-0.5 text-gray-600 text-[10px] leading-normal">
                              <span className="font-semibold">Observaciones:</span>{" "}
                              {h.observaciones}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={cerrarModalInfo}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN GUARDAR */}
      {modalConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-xl p-6 relative">
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={cancelarConfirmacion}
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Confirmar actualización
            </h2>
            <p className="text-sm text-gray-600">
              ¿Estás seguro que deseas actualizar el estado de este lead a{" "}
              <span className="font-semibold">{estadoNombre}</span>?
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

      {openGenerarRecompraModal && (
        <GenerarRecompraModal
          idPedido={idPedido}
          open={openGenerarRecompraModal}
          onClose={cerrarDetallePedido}
        />
      )}
    </AppLayout>
  );
}

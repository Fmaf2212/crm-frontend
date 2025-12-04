import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { SectionTitle } from "@/components/ui/sectionTitle";
import { Select } from "@/components/ui/select";

import { useState, useEffect } from "react";
import {
  Search,
  FileText,
  ShoppingCart,
  Ban,
  X,
  User,
  Briefcase,
  Truck,
  Package,
  MessageSquare,
  Receipt,
  Clock10,
} from "lucide-react";
import { AppLayout } from "@/app/layout/AppLayout";
import ReactSelect from "react-select";

import { LeadService } from "@/services/leadService";

type ToastState = {
  msg: string;
  type: "error" | "success";
} | null;

type Lead = {
  lead: number;
  fecha: string;
  cliente: string;
  documento: string;
  email: string;
  medio: string;
  asesor: string;
  supervisor: string;
  campania: string;
  estatus: string;
};

type RSOption = {
  value: number;
  label: string;
};

type PedidoProducto = {
  nombre: string;
  codigo: string;
  precioBase: number;
  descuentoPorcentaje: number;
  precioDescuento: number;
  cantidad: number;
  subtotal: number;
};

type PedidoHistorial = {
  paso: number;
  titulo: string;
  detalle: string;
  estado: string;
  infoExtra: string;
};

type Pedido = {
  codigo: string;
  fechaHora: string;
  estadoPedido: string;
  estadoPago: string;
  estadoFacturacion: string;
  cliente: {
    nombreCompleto: string;
    documento: string;
    telefono: string;
    direccion: string;
    distrito: string;
  };
  asesor: {
    nombre: string;
    supervisor: string;
    medio: string;
    metodoPago: string;
  };
  envio: {
    tipoEntrega: string;
    medioEnvio: string;
    fechaEntrega: string;
    horario: string;
    costoEnvio: number;
  };
  productos: PedidoProducto[];
  indicaciones: string;
  resumen: {
    subtotal: number;
    descuentoTotal: number;
    costoEnvio: number;
    total: number;
  };
  historial: PedidoHistorial[];
};

export default function CrearLead() {
  const usuario = JSON.parse(localStorage.getItem("sn_user") || "{}");

  const [codigoPais, setCodigoPais] = useState("51");
  const [numeroContacto, setNumeroContacto] = useState("");
  const [medioRegistro, setMedioRegistro] = useState<number | null>(null);
  const [campania, setCampania] = useState<number | null>(null);

  const [medioOptions, setMedioOptions] = useState<RSOption[]>([]);
  const [campaniaOptions, setCampaniaOptions] = useState<RSOption[]>([]);

  const [campaniaFiltroOptions, setCampaniaFiltroOptions] = useState<RSOption[]>([]);
  const [filtroCampania, setFiltroCampania] = useState<number | null>(null);

  const [toastMsg, setToastMsg] = useState<ToastState>(null);
  const [leadsEncontrados, setLeadsEncontrados] = useState<Lead[] | null>(null);

  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");

  const [paginaLead, setPaginaLead] = useState(1);
  const [totalPaginasLead, setTotalPaginasLead] = useState(1);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingCrearLead, setLoadingCrearLead] = useState(false);

  const [mostrarModalPedido, setMostrarModalPedido] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);

  const [mostrarConfirmCrear, setMostrarConfirmCrear] = useState(false);

  const itemsPorPagina = 5;

  const paises = [
    { value: "51", label: "🇵🇪 51" },
    { value: "58", label: "🇻🇪 58" },
    { value: "57", label: "🇨🇴 57" },
    { value: "56", label: "🇨🇱 56" },
    { value: "593", label: "🇪🇨 593" },
    { value: "591", label: "🇧🇴 591" },
    { value: "54", label: "🇦🇷 54" },
  ];

  function getFirstDayOfMonthIso() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  }

  function getTodayIso() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  }

  useEffect(() => {
    setFiltroFechaDesde(getFirstDayOfMonthIso());
    setFiltroFechaHasta(getTodayIso());
  }, []);

  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const medios = await LeadService.getMedioRegistroLeadForDropDown();
        const campanas = await LeadService.getCampanaForDropDown();

        setMedioOptions(
          medios?.data?.map((m: any) => ({
            value: m.id_Medio_Registro_Lead,
            label: m.medio_Registro_Lead,
          })) ?? []
        );

        const campOpts =
          campanas?.data?.map((c: any) => ({
            value: c.id_Campana,
            label: c.campana,
          })) ?? [];

        setCampaniaOptions(campOpts);
        setCampaniaFiltroOptions(campOpts);
      } catch {
        setMedioOptions([]);
        setCampaniaOptions([]);
        setCampaniaFiltroOptions([]);
      }
    };

    fetchCatalogos();
  }, []);

  const showToast = (msg: string, type: "error" | "success" = "error") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const validar = () => {
    if (!numeroContacto || numeroContacto.length < 9) {
      showToast("El número de contacto es obligatorio y debe tener al menos 9 caracteres");
      return false;
    }
    if (!medioRegistro) {
      showToast("Debe seleccionar un medio de registro");
      return false;
    }
    if (!campania) {
      showToast("Debe seleccionar una campaña");
      return false;
    }
    return true;
  };

  const validarNumero = () => {
    if (!numeroContacto || numeroContacto.length < 9) {
      showToast("Debe ingresar un número válido para buscar leads");
      return false;
    }
    return true;
  };

  const limpiar = () => {
    setCodigoPais("51");
    setNumeroContacto("");
    setMedioRegistro(null);
    setCampania(null);
    setLeadsEncontrados(null);
    setPaginaLead(1);
    setTotalPaginasLead(1);
    setFiltroCampania(null);
  };

  const construirNumeroFinal = () => {
    const raw = `${codigoPais}${numeroContacto}`;
    return raw.replace(/\D/g, "");
  };

  const buscarLeads = async (page = 1) => {
    if (!validarNumero()) return;

    const numeroFinal = construirNumeroFinal();

    setLoadingLeads(true);

    try {
      const fechaIni = filtroFechaDesde
        ? new Date(filtroFechaDesde).toISOString()
        : new Date().toISOString();

      const fechaFin = filtroFechaHasta
        ? new Date(filtroFechaHasta).toISOString()
        : new Date().toISOString();

      const body = {
        number: page,
        size: itemsPorPagina,
        numeroDeContacto: numeroFinal,
        fechaInicio: fechaIni,
        fechaFin: fechaFin,
        idCampana: filtroCampania ?? 0,
      };

      const response = await LeadService.getLeadGeneralPagination(body);

      if (response.error) {
        showToast("Ocurrió un error al consultar los leads");
        setLoadingLeads(false);
        return;
      }

      const data = response.data;
      const list: any[] = data?.leadGeneral ?? [];

      if (!list || list.length === 0) {
        showToast("Se encontraron 0 lead(s)", "success");
        setLeadsEncontrados([]);
        setPaginaLead(1);
        setTotalPaginasLead(1);
        setLoadingLeads(false);
        return;
      }

      const parsed: Lead[] = list.map((item: any) => ({
        lead: item.id_Lead,
        fecha: item.fecha_Registro_Lead,
        cliente: item.cliente ?? "-",
        documento: item.numero_Documento ?? "-",
        email: item.mail ?? "-",
        medio: item.medio_Registro_Lead ?? "-",
        asesor: item.asesor ?? "-",
        supervisor: item.supervisor ?? "-",
        campania: item.campana ?? "-",
        estatus: item.estatus_Lead ?? "-",
      }));

      setLeadsEncontrados(parsed);
      setPaginaLead(data.page ?? page);
      setTotalPaginasLead(data.totalPages ?? 1);

      if (page === 1) {
        showToast(`Se encontraron ${parsed.length} lead(s)`, "success");
      }
    } catch {
      showToast("Error al conectar con el servidor");
    }

    setLoadingLeads(false);
  };

  const limpiarFiltros = () => {
    setFiltroFechaDesde(getFirstDayOfMonthIso());
    setFiltroFechaHasta(getTodayIso());
    setFiltroCampania(null);
  };

  const handleClickCrearLead = () => {
    if (!validar()) return;
    setMostrarConfirmCrear(true);
  };

  const crearLead = async () => {
    if (!validar()) return;

    setMostrarConfirmCrear(false);
    setLoadingCrearLead(true);

    const numeroFinal = construirNumeroFinal();

    const body = {
      numeroDeContacto: numeroFinal,
      idMedioRegistroLead: medioRegistro!,
      idCampana: campania!,
      idAsesorActual: usuario.id_Usuario,
      idUsuarioRegistroLead: usuario.id_Usuario,
    };

    try {
      const response = await LeadService.insertLead(body);

      if (response.error) {
        showToast("No se pudo registrar el lead", "error");
        setLoadingCrearLead(false);
        return;
      }

      showToast("Lead registrado correctamente", "success");

      limpiar();
      await buscarLeads(1);
    } catch {
      showToast("Error al conectar con el servidor", "error");
    }

    setLoadingCrearLead(false);
  };

  const badgeEstatus = (estatus: string) => {
    if (estatus === "Convertido") {
      return (
        <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
          Convertido
        </span>
      );
    }
    if (estatus === "Pendiente" || estatus === "Nuevo") {
      return (
        <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
          {estatus}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700">
        {estatus}
      </span>
    );
  };

  const abrirModalVentas = (lead: Lead) => {
    const pedidoBase: Pedido = {
      codigo: "ORD-2025-00125",
      fechaHora: "28/10/2025 - 14:32",
      estadoPedido: "Nuevo",
      estadoPago: lead.estatus === "Convertido" ? "Pendiente" : "Sin pago",
      estadoFacturacion: "No facturado",
      cliente: {
        nombreCompleto: lead.cliente,
        documento: lead.documento,
        telefono: `+${codigoPais} ${numeroContacto}`,
        direccion: "Av. Los Olivos 123, San Isidro, Lima",
        distrito: "San Isidro - Lima",
      },
      asesor: {
        nombre: lead.asesor,
        supervisor: lead.supervisor,
        medio: lead.medio,
        metodoPago: "Yape",
      },
      envio: {
        tipoEntrega: "Provincia",
        medioEnvio: "Shalom",
        fechaEntrega: "30/11/2025",
        horario: "0:00 AM - 6:00 PM",
        costoEnvio: 15,
      },
      productos: [
        {
          nombre: "Suplemento Multivitamínico",
          codigo: "SUP-001",
          precioBase: 85,
          descuentoPorcentaje: 10,
          precioDescuento: 76.5,
          cantidad: 2,
          subtotal: 153,
        },
        {
          nombre: "Té Verde Detox",
          codigo: "TEA-002",
          precioBase: 35,
          descuentoPorcentaje: 0,
          precioDescuento: 35,
          cantidad: 1,
          subtotal: 35,
        },
      ],
      indicaciones:
        "Entregar preferiblemente en horario de mañana. Tocar el timbre dos veces. Si no hay nadie, coordinar nueva fecha de entrega.",
      resumen: {
        subtotal: 188,
        descuentoTotal: 8.5,
        costoEnvio: 15,
        total: 194.5,
      },
      historial: [
        {
          paso: 1,
          titulo: "Pedido creado",
          detalle: "28/10/2025 - 14:32 por Zoila Robles",
          estado: "Actual",
          infoExtra:
            "Estado: Nuevo | Pago: Pendiente | Facturación: No facturado",
        },
        {
          paso: 2,
          titulo: "En espera de confirmación de pago",
          detalle: "Próximo paso automático",
          estado: "Pendiente",
          infoExtra: "",
        },
      ],
    };

    setPedidoSeleccionado(pedidoBase);
    setMostrarModalPedido(true);
  };

  const cerrarModalPedido = () => {
    setMostrarModalPedido(false);
    setPedidoSeleccionado(null);
  };

  const botonAccion = (lead: Lead) => {
    if (lead.estatus === "Convertido") {
      return (
        <Button
          className="border border-green-700 text-green-700 bg-white hover:bg-green-50 flex items-center gap-1"
          onClick={() => abrirModalVentas(lead)}
        >
          <ShoppingCart size={14} /> Ver Ventas
        </Button>
      );
    }
    return (
      <Button
        disabled
        className="
          bg-gray-200 text-gray-500 flex items-center gap-1
          disabled:opacity-100 disabled:cursor-not-allowed
          disabled:bg-gray-200 disabled:text-gray-500
          hover:bg-gray-200 hover:text-gray-500
          pointer-events-none"
      >
        <Ban size={14} /> Sin Ventas
      </Button>
    );
  };

  return (
    <AppLayout title="Crear Lead">
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
          <span className="text-gray-800">Crear Lead</span>
        </div>

        <Card>
          <SectionTitle icon={FileText}>Información del Lead</SectionTitle>

          <div className="p-6 bg-white rounded-b-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Número de Contacto <span className="text-red-500">*</span>
                </label>

                <div className="flex gap-2">
                  <Select
                    value={codigoPais}
                    onChange={setCodigoPais}
                    options={paises}
                    className="w-28"
                  />

                  <Input
                    placeholder="Mínimo 9 caracteres"
                    value={numeroContacto}
                    onChange={(e) => setNumeroContacto(e.target.value)}
                  />

                  <Button
                    className="bg-[#006341] hover:bg-[#004f32] text-white"
                    onClick={() => buscarLeads(1)}
                    disabled={loadingLeads}
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-xs text-gray-500">
                  Busque por número de contacto para ver historial de leads
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Medio de Registro <span className="text-red-500">*</span>
                </label>

                <ReactSelect<RSOption>
                  classNamePrefix="rs"
                  placeholder="Seleccione medio de registro"
                  options={medioOptions}
                  value={medioOptions.find((o) => o.value === medioRegistro) ?? null}
                  onChange={(option) => setMedioRegistro(option?.value ?? null)}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  isClearable
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Campaña <span className="text-red-500">*</span>
                </label>

                <ReactSelect<RSOption>
                  classNamePrefix="rs"
                  placeholder="Seleccione campaña"
                  options={campaniaOptions}
                  value={campaniaOptions.find((o) => o.value === campania) ?? null}
                  onChange={(option) => setCampania(option?.value ?? null)}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  isClearable
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={limpiar} disabled={loadingCrearLead}>
                Limpiar campos
              </Button>
              <Button
                className="bg-green-800 hover:bg-green-900 text-white"
                onClick={handleClickCrearLead}
                disabled={loadingCrearLead}
              >
                Crear Lead
              </Button>
            </div>
          </div>
        </Card>

        {leadsEncontrados !== null && (
          <Card>
            <SectionTitle icon={FileText}>
              Leads Vinculados al Número +{codigoPais}
              {numeroContacto}
            </SectionTitle>

            <div className="p-6 space-y-5 bg-white rounded-b-2xl">
              <Button className="bg-green-700 text-white flex items-center gap-2 w-28 justify-center">
                <ShoppingCart /> Ventas
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-[#F8FBFC] rounded-xl">
                <div>
                  <label className="text-sm font-medium">Fecha Desde</label>
                  <Input
                    type="date"
                    value={filtroFechaDesde}
                    onChange={(e) => setFiltroFechaDesde(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Fecha Hasta</label>
                  <Input
                    type="date"
                    value={filtroFechaHasta}
                    onChange={(e) => setFiltroFechaHasta(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Campaña</label>

                  <ReactSelect<RSOption>
                    options={campaniaFiltroOptions}
                    value={
                      filtroCampania
                        ? campaniaFiltroOptions.find((c) => c.value === filtroCampania) ?? null
                        : null
                    }
                    onChange={(opt) => setFiltroCampania(opt?.value ?? null)}
                    placeholder="Seleccione campaña"
                    className="text-sm pt-[1px] pb-[1px]"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <Button
                    className="w-full"
                    onClick={() => buscarLeads(1)}
                    disabled={loadingLeads}
                  >
                    Aplicar Filtros
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={limpiarFiltros}
                    disabled={loadingLeads}
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </div>

              {leadsEncontrados.length === 0 ? (
                <p className="text-sm text-gray-600">No existen leads coincidentes.</p>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-2">
                    Página {paginaLead} de {totalPaginasLead}
                  </p>

                  <div className="rounded-xl overflow-hidden border">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left">Lead</th>
                          <th className="p-2 text-left">Fecha Registro</th>
                          <th className="p-2 text-left">Cliente Vinculado</th>
                          <th className="p-2 text-left">Documento</th>
                          <th className="p-2 text-left">Email</th>
                          <th className="p-2 text-left">Medio Registro</th>
                          <th className="p-2 text-left">Asesor</th>
                          <th className="p-2 text-left">Supervisor</th>
                          <th className="p-2 text-left">Campaña</th>
                          <th className="p-2 text-left">Estatus</th>
                          <th className="p-2 text-left">Acciones</th>
                        </tr>
                      </thead>

                      <tbody>
                        {leadsEncontrados.map((lead, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">{lead.lead}</td>
                            <td className="p-2">{lead.fecha}</td>
                            <td className="p-2">{lead.cliente}</td>
                            <td className="p-2">{lead.documento}</td>
                            <td className="p-2">{lead.email}</td>
                            <td className="p-2">{lead.medio}</td>
                            <td className="p-2">{lead.asesor}</td>
                            <td className="p-2">{lead.supervisor}</td>
                            <td className="p-2">{lead.campania}</td>
                            <td className="p-2">{badgeEstatus(lead.estatus)}</td>
                            <td className="p-2">{botonAccion(lead)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between mt-4 ml-auto mr-auto w-fit gap-3">
                    <Button
                      variant="outline"
                      disabled={paginaLead === 1 || loadingLeads}
                      onClick={() => buscarLeads(paginaLead - 1)}
                    >
                      Anterior
                    </Button>

                    <div className="flex gap-2">
                      {Array.from({ length: totalPaginasLead }, (_, i) => i + 1).map(
                        (p) => (
                          <Button
                            key={p}
                            onClick={() => buscarLeads(p)}
                            variant={paginaLead === p ? "default" : "outline"}
                            className={
                              paginaLead === p
                                ? "bg-green-700 text-white"
                                : "border border-gray-300"
                            }
                            disabled={loadingLeads}
                          >
                            {p}
                          </Button>
                        )
                      )}
                    </div>

                    <Button
                      variant="outline"
                      disabled={paginaLead === totalPaginasLead || loadingLeads}
                      onClick={() => buscarLeads(paginaLead + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        )}
      </div>

      {mostrarConfirmCrear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMostrarConfirmCrear(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center px-6 pt-4 pb-3 border-b">
              <h2 className="text-base font-semibold text-gray-800">
                Confirmación
              </h2>
              <button
                onClick={() => setMostrarConfirmCrear(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-4 text-sm text-gray-700">
              ¿Está seguro que desea crear el Lead con el número{" "}
              <span className="font-semibold">
                {codigoPais}{numeroContacto}
              </span>
              ?
            </div>

            <div className="px-6 pb-4 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setMostrarConfirmCrear(false)}
                disabled={loadingCrearLead}
              >
                Cancelar
              </Button>
              <Button
                className="bg-green-700 hover:bg-green-800 text-white"
                onClick={crearLead}
                disabled={loadingCrearLead}
              >
                {loadingCrearLead ? "Creando..." : "Sí, crear Lead"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalPedido && pedidoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={cerrarModalPedido}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end pr-6 pt-4">
              <button
                onClick={cerrarModalPedido}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b">
              <div>
                <h2 className="text-lg font-semibold text-green-700">
                  Pedido Generado
                </h2>
              </div>
              <div className="text-right text-sm">
                <div className="font-semibold text-gray-800">
                  {pedidoSeleccionado.codigo}
                </div>
                <div className="text-xs text-gray-500">
                  {pedidoSeleccionado.fechaHora}
                </div>
              </div>
            </div>

            <div className="px-6 pt-4 pb-2 flex flex-wrap gap-8 text-sm justify-evenly">
              <div className="flex gap-2 flex-col">
                <span className="font-semibold text-gray-700">
                  Estado del Pedido
                </span>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-gray-600">Nuevo</span>
                </div>
              </div>
              <div className="flex gap-2 flex-col">
                <span className="font-semibold text-gray-700">
                  Estado de Pago
                </span>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span className="text-gray-600">
                    {pedidoSeleccionado.estadoPago}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-col">
                <span className="font-semibold text-gray-700">
                  Estado de Facturación
                </span>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-gray-600">
                    {pedidoSeleccionado.estadoFacturacion}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 grid grid-cols-4 md:grid-cols-3 gap-4">
              <div className="border rounded-2xl p-4 space-y-2 col-span-1">
                <h3 className="flex gap-2 text-sm font-semibold text-gray-700 border-b pb-2">
                  <User size={20} color="#0E9F6E" />
                  Información del Cliente
                </h3>
                <div className="text-xs text-gray-500">Nombre completo</div>
                <div className="text-sm text-gray-800">
                  {pedidoSeleccionado.cliente.nombreCompleto}
                </div>
                <div className="mt-2 text-xs text-gray-500">Documento</div>
                <div className="text-sm text-gray-800">
                  {pedidoSeleccionado.cliente.documento}
                </div>
                <div className="mt-2 text-xs text-gray-500">Teléfono</div>
                <div className="text-sm text-gray-800">
                  {pedidoSeleccionado.cliente.telefono}
                </div>
                <div className="mt-2 text-xs text-gray-500">Dirección</div>
                <div className="text-sm text-gray-800">
                  {pedidoSeleccionado.cliente.direccion}
                </div>
                <div className="mt-2 text-xs text-gray-500">Distrito</div>
                <div className="text-sm text-gray-800">
                  {pedidoSeleccionado.cliente.distrito}
                </div>
              </div>

              <div className="border rounded-2xl p-4 space-y-2 col-span-1 min-w-[190px]">
                <h3 className="flex gap-2 text-sm font-semibold text-gray-700 border-b pb-2">
                  <Briefcase size={20} color="#0E9F6E" />
                  Información del Asesor
                </h3>
                <div className="text-xs text-gray-500">Asesor</div>
                <div className="text-sm text-gray-800">
                  {pedidoSeleccionado.asesor.nombre}
                </div>
                <div className="mt-2 text-xs text-gray-500">Supervisor</div>
                <div className="text-sm text-gray-800">
                  {pedidoSeleccionado.asesor.supervisor}
                </div>
                <div className="mt-2 text-xs text-gray-500">Medio</div>
                <div className="text-sm text-gray-800">
                  {pedidoSeleccionado.asesor.medio}
                </div>
                <div className="mt-2 text-xs text-gray-500">Método de pago</div>
                <div className="text-sm text-gray-800">
                  {pedidoSeleccionado.asesor.metodoPago}
                </div>
              </div>

              <div className="border rounded-2xl p-4 space-y-2 col-span-1 min-w-[190px]">
                <h3 className="flex gap-2 text-sm font-semibold text-gray-700 border-b pb-2">
                  <Truck size={20} color="#0E9F6E" />
                  Información de Envío
                </h3>
                <div className="text-xs text-gray-500">Tipo de entrega</div>
                <div className="text-sm text-gray-800">
                  {pedidoSeleccionado.envio.tipoEntrega}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Medio de envío delivery
                </div>
                <div className="text-sm text-gray-800">
                  {pedidoSeleccionado.envio.medioEnvio}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Fecha de entrega
                </div>
                <div className="text-sm text-gray-800">
                  {pedidoSeleccionado.envio.fechaEntrega}
                </div>
                <div className="mt-2 text-xs text-gray-500">Horario</div>
                <div className="text-sm text-gray-800">
                  {pedidoSeleccionado.envio.horario}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Costo de envío
                </div>
                <div className="text-sm text-gray-800">
                  S/ {pedidoSeleccionado.envio.costoEnvio.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="px-6 pt-4 pb-2">
              <h3 className="flex gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Package size={20} color="#0E9F6E" />
                Productos del Pedido
              </h3>
              <div className="border rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Producto</th>
                      <th className="px-4 py-2 text-left">Precio Base</th>
                      <th className="px-4 py-2 text-left">Descuento</th>
                      <th className="px-4 py-2 text-left">
                        Precio con Descuento
                      </th>
                      <th className="px-4 py-2 text-left">Cantidad</th>
                      <th className="px-4 py-2 text-left">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidoSeleccionado.productos.map(
                      (p: PedidoProducto, idx: number) => (
                        <tr key={idx} className="border-t">
                          <td className="px-4 py-2">
                            <div className="font-medium text-gray-800">
                              {p.nombre}
                            </div>
                            <div className="text-xs text-gray-500">
                              COD: {p.codigo}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-nowrap">
                            S/ {p.precioBase.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-red-500 text-center">
                            {p.descuentoPorcentaje}%
                          </td>
                          <td className="px-4 py-2 text-nowrap">
                            S/ {p.precioDescuento.toFixed(2)}
                          </td>
                          <td className="px-4 py-2">{p.cantidad}</td>
                          <td className="px-4 py-2 text-nowrap">
                            S/ {p.subtotal.toFixed(2)}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-2xl p-4">
                <h3 className="flex gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MessageSquare size={20} color="#0E9F6E" />
                  Indicaciones de Entrega
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed border-t mt-3 pt-2">
                  {pedidoSeleccionado.indicaciones}
                </p>
              </div>

              <div className="border rounded-2xl p-4">
                <h3 className="flex gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Receipt size={20} color="#0E9F6E" />
                  Resumen del Pedido
                </h3>
                <div className="flex justify-between text-sm text-gray-700 border-t mt-3 pt-2 ">
                  <span>Subtotal</span>
                  <span>
                    S/ {pedidoSeleccionado.resumen.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-red-600 mt-1">
                  <span>Descuento total</span>
                  <span>
                    - S/ {pedidoSeleccionado.resumen.descuentoTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-700 mt-1">
                  <span>Costo de envío</span>
                  <span>
                    S/ {pedidoSeleccionado.resumen.costoEnvio.toFixed(2)}
                  </span>
                </div>
                <div className="border-t mt-3 pt-2 flex justify-between text-sm font-semibold text-gray-900">
                  <span>Total</span>
                  <span>
                    S/ {pedidoSeleccionado.resumen.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="border rounded-2xl p-4">
                <h3 className="flex gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Clock10 size={20} color="#0E9F6E" />
                  Historial del Pedido
                </h3>

                <div className="border-t pt-3">
                  {pedidoSeleccionado.historial.map(
                    (h: PedidoHistorial, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 mt-1">
                        <div className="flex flex-col items-center mt-1 h-16">
                          <div
                            className={
                              h.estado === "Actual"
                                ? "w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs"
                                : "w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs"
                            }
                          >
                            {h.estado === "Actual" ? "✓" : h.paso}
                          </div>

                          {idx < pedidoSeleccionado.historial.length - 1 && (
                            <div className="w-px flex-1 bg-gray-300" />
                          )}
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-gray-800">
                            {h.titulo}
                          </div>
                          <div className="text-xs text-gray-500">
                            {h.detalle}
                          </div>

                          {h.infoExtra && (
                            <div className="text-xs text-gray-600 mt-1">
                              {h.infoExtra}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex justify-center">
              <Button className="bg-green-700 hover:bg-green-800 text-white px-8">
                Generar Recompra
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

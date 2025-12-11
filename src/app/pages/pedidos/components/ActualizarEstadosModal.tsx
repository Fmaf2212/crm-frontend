// ==============================
//   ACTUALIZAR ESTADOS MODAL
//   COMPLETO + SERVICIO + TOAST LOCAL
//   NADA BORRADO
// ==============================

import React, { useEffect, useState } from "react";
import {
  X,
  User,
  Briefcase,
  Package,
  MapPin,
  Printer,
  Tag,
  Share2,
} from "lucide-react";
import ReactSelect from "react-select";
import { PedidoService } from "@/services/pedidoService";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import PedidoComprobantePDF from "./PedidoComprobantePDF";
import { Toast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirmModal";

import type { EstadoOperacion, EstadoFacturacion } from "@/types/EstadosPedido";
import EtiquetaEnvioPDF from "./EtiquetaEnvioPDF";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

type EstadoPago =
  | "Pendiente"
  | "Adelanto"
  | "Pagado"
  | "Reembolsado"
  | "Reembolsado Parcial";

type Pedido = {
  id_Pedido: number;
  codigo: number;
  cliente: string;
  telefono: string;
  asesor: string;
  fechaIngreso: string;
  fechaPactada: string;
  total: number;
  estadoPedido: EstadoOperacion;
  estadoPago: EstadoPago;
  estadoFacturacion: EstadoFacturacion;
};

type SelectOption = { value: string; label: string };

type Props = {
  open: boolean;
  onClose: () => void;
  pedido: Pedido | null;
  onSave: (estadosActualizados: {
    estadoOperacionNuevo: EstadoOperacion;
    estadoFacturacionNuevo: EstadoFacturacion;
  }) => void;
  onUpdated: () => void;
};

// ======== MAPEOS ACTUALIZADOS ========

const ESTADO_OPERACION_ID_MAP: Record<EstadoOperacion, number> = {
  Ingresada: 1,
  Incidencia: 2,
  Confirmada: 3,
  Cancelada: 4,
  "Listo Despacho": 5,
  "En Ruta": 6,
  "Cancelada Retornar": 7,
  "En Retorno": 8,
  Retornada: 9,
  Reprogramada: 10,
  Entregada: 11,
  Liquidada: 12,
};

const ESTADO_FACTURACION_ID_MAP: Record<EstadoFacturacion, number> = {
  Pendiente: 1,
  Facturado: 2,
  "Re-Facturado": 3,
  "Por Anular": 4,
  Anulado: 5,
};

// ======== COMBOS ========

const estadoPedidoOptionsModal: SelectOption[] = Object.keys(
  ESTADO_OPERACION_ID_MAP
).map((x) => ({ value: x, label: x }));

const estadoPagoOptions: SelectOption[] = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "Adelanto", label: "Adelanto" },
  { value: "Pagado", label: "Pagado" },
  { value: "Reembolsado", label: "Reembolsado" },
  { value: "Reembolsado Parcial", label: "Reembolsado Parcial" },
];

const estadoFacturacionOptionsModal: SelectOption[] = Object.keys(
  ESTADO_FACTURACION_ID_MAP
).map((x) => ({ value: x, label: x }));

// ======== SELECT STYLES ========

const selectStyles = {
  control: (base: any) => ({
    ...base,
    borderRadius: 12,
    borderColor: "#E5E7EB",
    minHeight: 44,
    backgroundColor: "#F9FAFB",
    fontSize: 12,
  }),
};

const ActualizarEstadosModal: React.FC<Props> = ({
  open,
  onClose,
  pedido,
  onSave,
  onUpdated,
}) => {
  const [detalle, setDetalle] = useState<any>(null);

  // ======= TOAST LOCAL =======
  const [toastMsg, setToastMsg] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToastLocal = (msg: string, type: "success" | "error") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 2500);
  };

  // ======= ESTADOS ORIGINALES =======
  const [estadoPedidoOriginal, setEstadoPedidoOriginal] =
    useState<EstadoOperacion>("Ingresada");
  const [estadoPagoOriginal, setEstadoPagoOriginal] =
    useState<EstadoPago>("Pendiente");
  const [estadoFactOriginal, setEstadoFactOriginal] =
    useState<EstadoFacturacion>("Pendiente");

  // ======= ESTADOS MODAL =======
  const [estadoPedidoModal, setEstadoPedidoModal] =
    useState<EstadoOperacion>("Ingresada");
  const [estadoPagoModal, setEstadoPagoModal] =
    useState<EstadoPago>("Pendiente");
  const [estadoFactModal, setEstadoFactModal] =
    useState<EstadoFacturacion>("Pendiente");

  const [historial, setHistorial] = useState<
    { id: string; titulo: string; descripcion: string; fechaHora: string }[]
  >([]);

  const [cambiosPendientes, setCambiosPendientes] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: () => { },
  });

  const [pdfLoading, setPdfLoading] = useState(false);
  const [loadingEtiqueta, setLoadingEtiqueta] = useState(false);

  const etiquetaMock = {
    numeroOrden: "ORD-2025-00125",
    nombreDestinatario: "María López Vargas",
    dni: "45879632",
    telefono: "+51 987 456 123",
    direccion: "Av. Primavera 123 - Surco",
    provincia: "Lima",
    distrito: "Santiago de Surco",
    agencia: "Shalom",
    peso: "0.85 kg",
    fechaEnvio: "27/10/2025",
    fechaEntrega: "29/10/2025",
    estado: "EN PREPARACIÓN",
    tracking: "SN-000125",
  };

  function generarCode128Base64(tracking: string): string {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    JsBarcode(svg, tracking, {
      format: "code128",
      displayValue: false,
      margin: 0,
      height: 40,
    });

    const str = new XMLSerializer().serializeToString(svg);
    return `data:image/svg+xml;base64,${btoa(str)}`;
  }

  async function generarQRBase64(tracking: string): Promise<string> {
    return await QRCode.toDataURL(
      `https://santanatura.com.pe/tracking/${tracking}`,
      { margin: 0, scale: 4 }
    );
  }

  const handleImprimirEtiqueta = async () => {
    try {
      if (!detalle) {
        showToastLocal("No hay datos del pedido para generar la etiqueta.", "error");
        return;
      }

      setLoadingEtiqueta(true);

      // ============================
      // MAPEO DE DATA REAL DEL API
      // ============================
      const dataReal = {
        numeroOrden: detalle.id_Pedido,
        nombre: detalle.detalleClientePorPedido?.cliente || "-",
        dni: detalle.detalleClientePorPedido?.numero_Documento || "-",
        telefono:
          detalle.detalleLeadPorPedido?.numero_De_Contacto ??
          detalle.telefono_Alterno ??
          "-",
        direccion: detalle.detalleDeliveryPorPedido?.direccion_Delivery || "-",
        provincia: detalle.detalleDeliveryPorPedido?.provincia || "-",
        distrito: detalle.detalleDeliveryPorPedido?.distrito || "-",
        agencia: detalle.detalleDeliveryPorPedido?.medio_de_Envio || "-",
        tipoEntrega: detalle.detalleDeliveryPorPedido?.tipo_de_Entrega || "-",
      };

      // ============================
      // GENERAR PDF BAJO DEMANDA
      // ============================
      const blob = await pdf(<EtiquetaEnvioPDF data={dataReal} />).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `Etiqueta_Envio_${detalle.id_Pedido}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generando etiqueta:", err);
      showToastLocal("Hubo un error al generar la etiqueta.", "error");
    } finally {
      setLoadingEtiqueta(false);
    }
  };

  // ==================================
  //       CARGAR DETALLE REAL
  // ==================================
  useEffect(() => {
    const fetchDetalle = async () => {
      if (!pedido?.codigo) return;

      const res = await PedidoService.getDetallePedido(pedido.codigo);
      const d = res?.data;
      if (!d) return;

      setDetalle(d);

      setEstadoPedidoModal(d.estatus_Operacion);
      setEstadoPagoModal(d.estatus_Pago);
      setEstadoFactModal(d.estatus_Facturacion);

      setEstadoPedidoOriginal(d.estatus_Operacion);
      setEstadoPagoOriginal(d.estatus_Pago);
      setEstadoFactOriginal(d.estatus_Facturacion);

      const h = d.detallePedidoHistoricoPedidoEstado?.map((x: any) => ({
        id: String(x.orden_Historico_Pedido),
        titulo: x.titulo,
        descripcion: x.detalle_del_Estatus,
        fechaHora: x.fecha_Registro_Pedido,
      }));

      setHistorial(h || []);
    };

    fetchDetalle();
  }, [pedido]);

  if (!open || !pedido) return null;

  // ==================================
  //       DETECTAR CAMBIOS
  // ==================================
  const handleChangeEstado = (
    setter: any,
    val: any,
    tipo: "operacion" | "facturacion"
  ) => {
    setter(val);

    const nuevoOp =
      tipo === "operacion" ? val : estadoPedidoModal;
    const nuevoFact =
      tipo === "facturacion" ? val : estadoFactModal;

    const hayCambios =
      nuevoOp !== estadoPedidoOriginal ||
      nuevoFact !== estadoFactOriginal;

    setCambiosPendientes(hayCambios);
  };

  const userLS = JSON.parse(localStorage.getItem("sn_user") || "{}");
  const esAsesor = userLS?.id_Tipo_Usuario === 8;

  // ==================================
  //       GUARDAR CAMBIOS
  // ==================================
  const handleGuardar = async () => {
    try {
      const body = {
        id_Pedido: pedido.id_Pedido,
        id_Estatus_Operacion: ESTADO_OPERACION_ID_MAP[estadoPedidoModal],
        detalle_del_Estatus: "",
        id_Usuario_Registro_Historico_Pedido_Estatus_Operacion: userLS.id_Usuario || 0,
      };
      const res = await PedidoService.insertPedidoEstatusOperacion(body);

      if (res && res.error === false) {
        showToastLocal("Estados del pedido actualizados.", "success");
        onSave({
          estadoOperacionNuevo: estadoPedidoModal,
          estadoFacturacionNuevo: estadoFactModal
        });
        onUpdated();//Refrescar listado real del backend
        onClose();
      } else {
        showToastLocal(res?.message || "No se pudo actualizar los estados.", "error");
      }
    } catch (err) {
      showToastLocal("Error al comunicarse con el servidor.", "error");
    }
  };

  const formatearFechaHistorial = (fecha: any) => {
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

  const handleCompartirWhatsApp = () => {
    const rawTelefono =
      detalle?.detalleLeadPorPedido?.numero_De_Contacto ??
      detalle?.telefono_Alterno ??
      "";

    const telefono = formatearTelefonoPeru(rawTelefono);
console.log(telefono);
    if (!telefono) {
      showToastLocal(
        "El Lead no tiene un número de contacto asociado.",
        "error"
      );
      return;
    }

    const mensaje = `
      📦 *Detalle del Pedido*

      *N° Orden:* ${detalle.id_Pedido}
      *Cliente:* ${detalle.detalleClientePorPedido.cliente}
      *Teléfono:* +51 ${telefono}
      *Dirección:* ${detalle.detalleDeliveryPorPedido.direccion_Delivery}
      ${detalle.detalleDeliveryPorPedido.distrito}, ${detalle.detalleDeliveryPorPedido.provincia}

      *Estado actual:* ${detalle.estatus_Operacion}
    `.trim();

    const texto = encodeURIComponent(mensaje);

    // Enviar directo al número del cliente
    window.open(`https://wa.me/51${telefono}?text=${texto}`, "_blank");
  };

  function formatearTelefonoPeru(numero: string): string {
    if (!numero) return "";

    // Elimina espacios, guiones u otros símbolos
    let clean = numero.replace(/\D/g, "");

    // Si empieza con 51 y tiene 11 dígitos → 51987654321
    if (clean.startsWith("51") && clean.length === 11) {
      clean = clean.substring(2); // deja solo 987654321
    }

    // Si tiene 9 dígitos → lo dejamos como celular peruano válido
    if (clean.length === 9) {
      return clean;
    }

    return ""; // inválido
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40 top-[-16px]">
      <ConfirmModal
        open={confirmConfig.open}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onCancel={() =>
          setConfirmConfig({
            open: false,
            title: "",
            message: "",
            onConfirm: () => { },
          })
        }
        onConfirm={confirmConfig.onConfirm}
      />
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg relative max-h-[90vh] flex flex-col">

        {/* BOTÓN CERRAR */}
        <button
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 mt-6">
          <div className="flex justify-between">
            <div>
              <h2 className="text-sm font-semibold text-emerald-700">
                Pedido Generado
              </h2>
              <p className="text-xs text-red-500">
                El pedido se ha creado exitosamente
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700">
                {pedido.codigo}
              </p>
              <p className="text-xs text-slate-500">
                {pedido.fechaIngreso}
              </p>
            </div>
          </div>
        </div>

        {/* CONTENIDO SCROLL */}
        <div className="px-6 py-4 space-y-6 overflow-y-auto">

          {/* =============================
                   ESTADOS
          ============================= */}
          <div className="grid gap-4 md:grid-cols-3">

            {/* OPERACIÓN */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">
                Estado de Operación
              </p>

              <ReactSelect
                isDisabled={esAsesor}
                options={estadoPedidoOptionsModal}
                value={estadoPedidoOptionsModal.find(
                  (o) => o.value === estadoPedidoModal
                )}
                onChange={(opt) =>
                  handleChangeEstado(
                    setEstadoPedidoModal,
                    opt?.value,
                    "operacion"
                  )
                }
                styles={selectStyles}
              />

              <p className="text-[11px] text-slate-500">
                Actual: <span className="font-semibold">{estadoPedidoOriginal}</span>
              </p>
            </div>

            {/* PAGO (DESHABILITADO) */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">
                Estado de Pago
              </p>

              <ReactSelect
                isDisabled={true}
                options={estadoPagoOptions}
                value={estadoPagoOptions.find(
                  (o) => o.value === estadoPagoModal
                )}
                styles={selectStyles}
              />

              <p className="text-[11px] text-slate-500">
                Actual: <span className="font-semibold">{estadoPagoOriginal}</span>
              </p>
            </div>

            {/* FACTURACIÓN */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">
                Estado de Facturación
              </p>

              <ReactSelect
                isDisabled={esAsesor}
                options={estadoFacturacionOptionsModal}
                value={estadoFacturacionOptionsModal.find(
                  (o) => o.value === estadoFactModal
                )}
                onChange={(opt) =>
                  handleChangeEstado(
                    setEstadoFactModal,
                    opt?.value,
                    "facturacion"
                  )
                }
                styles={selectStyles}
              />

              <p className="text-[11px] text-slate-500">
                Actual:{" "}
                <span className="font-semibold">{estadoFactOriginal}</span>
              </p>
            </div>
          </div>

          {/* =============================
              INFORMACIÓN DEL CLIENTE
          ============================= */}
          {/* === TODO TU BLOQUE ORIGINAL === */}
          {/* === NADA BORRADO === */}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-2xl p-4 bg-white">
              <p className="flex gap-1 text-sm font-semibold mb-1">
                <User size={18} color="#0E9F6E" />
                Información del Cliente
              </p>

              <p className="text-xs text-gray-500 mt-1">Nombre completo</p>
              <p className="text-sm">
                {detalle?.detalleClientePorPedido?.cliente || "-"}
              </p>

              <p className="text-xs text-gray-500 mt-2">Documento</p>
              <p className="text-sm">
                {detalle?.detalleClientePorPedido?.tipo_Documento || "-"}:{" "}
                {detalle?.detalleClientePorPedido?.numero_Documento}
              </p>

              <p className="text-xs text-gray-500 mt-2">Teléfono</p>
              <p className="text-sm">
                {detalle?.detalleLeadPorPedido?.numero_De_Contacto || "-"}
              </p>
            </div>

            {/* ASESOR */}
            <div className="border rounded-2xl p-4 bg-white">
              <p className="flex gap-1 text-sm font-semibold mb-1">
                <Briefcase size={18} color="#0E9F6E" />
                Información del Asesor
              </p>

              <p className="text-xs text-gray-500">Asesor</p>
              <p className="text-sm">
                {detalle?.detalleLeadPorPedido?.asesor || "-"}
              </p>

              <p className="text-xs text-gray-500 mt-2">Supervisor</p>
              <p className="text-sm">
                {detalle?.detalleLeadPorPedido?.supervisor || "-"}
              </p>

              <p className="text-xs text-gray-500 mt-2">Medio</p>
              <p className="text-sm">
                {detalle?.detalleLeadPorPedido?.medio_Registro_Lead || "-"}
              </p>
            </div>

            {/* ENVÍO */}
            <div className="border rounded-2xl p-4 bg-white">
              <p className="flex gap-1 text-sm font-semibold mb-1">
                <MapPin size={18} color="#0E9F6E" />
                Información de Envío
              </p>

              {detalle?.detalleDeliveryPorPedido ? (
                <>
                  <p className="text-xs text-gray-500 mt-1">Tipo de entrega</p>
                  <p className="text-sm">
                    {detalle.detalleDeliveryPorPedido.tipo_de_Entrega || "-"}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">Dirección</p>
                  <p className="text-sm">
                    {detalle.detalleDeliveryPorPedido.direccion_Delivery || "-"}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">Provincia</p>
                  <p className="text-sm">
                    {detalle.detalleDeliveryPorPedido.provincia || "-"}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">Distrito</p>
                  <p className="text-sm">
                    {detalle.detalleDeliveryPorPedido.distrito || "-"}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">Medio de Envío</p>
                  <p className="text-sm">
                    {detalle.detalleDeliveryPorPedido.medio_de_Envio || "-"}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">Fecha Pactada</p>
                  <p className="text-sm">
                    {detalle.detalleDeliveryPorPedido.fecha_Pactada_Delivery || "-"}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">Horario Pactado</p>
                  <p className="text-sm">
                    {detalle.detalleDeliveryPorPedido.horario_Pactado || "-"}
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  No hay datos de delivery.
                </p>
              )}
            </div>
          </div>

          {/* =============================
              PRODUCTOS
          ============================= */}
          {/* === TU BLOQUE ORIGINAL === */}
          {/* === NADA BORRADO === */}

          <div className="border rounded-2xl p-4 bg-white">
            <p className="flex gap-1 text-sm font-semibold mb-2">
              <Package size={18} color="#0E9F6E" />
              Productos del Pedido
            </p>

            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500">
                  <th className="py-1 text-left">Producto</th>
                  <th className="py-1 text-left">Precio Base</th>
                  <th className="py-1 text-left">Descuento</th>
                  <th className="py-1 text-left">Precio con Descuento</th>
                  <th className="py-1 text-left">Cant.</th>
                  <th className="py-1 text-left">Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {detalle?.detallePedido && detalle.detallePedido.length > 0 ? (
                  detalle.detallePedido.map((producto: any, index: any) => (
                    <tr key={index} className="border-t">
                      <td className="py-2">{producto.nombre_Producto}</td>
                      <td>S/ {producto.precio_Regular.toFixed(2)}</td>
                      <td>{producto.nombre_Descuento}</td>
                      <td>S/ {producto.precio_Promocional.toFixed(2)}</td>
                      <td>{producto.cantidad}</td>
                      <td>S/ {producto.subtotal_Promocional.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500">
                      No hay productos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* =============================
              INDICACIONES ENTREGA
          ============================= */}
          {/* === TU BLOQUE ORIGINAL === */}

          <div className="border rounded-2xl p-4 bg-white">
            <p className="flex gap-1 text-sm font-semibold text-gray-800 mb-2">
              <MapPin size={18} color="#0E9F6E" />
              Indicaciones de Entrega
            </p>

            {detalle?.detalleDeliveryPorPedido?.indicaciones ? (
              <p className="text-xs text-gray-700">
                {detalle.detalleDeliveryPorPedido.indicaciones}
              </p>
            ) : (
              <p className="text-xs text-gray-400 italic">
                No hay indicaciones registradas para este pedido.
              </p>
            )}
          </div>

          {/* =============================
              RESUMEN DEL PEDIDO
          ============================= */}

          {/* === SECCIÓN ORIGINAL — NADA BORRADO === */}

          <div className="border rounded-2xl p-4 bg-white max-w-xs">
            <p className="flex gap-1 text-sm font-semibold text-gray-800 mb-2">
              <MapPin size={18} color="#0E9F6E" />
              Resumen del Pedido
            </p>

            {detalle && (
              <div className="space-y-1 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>S/ {Number(detalle.monto_Total_Regular || 0).toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Descuento total</span>
                  <span className="text-red-500">
                    -S/ {(
                      (Number(detalle.monto_Total_Regular || 0) -
                        Number(detalle.monto_Total_Promocional || 0)) || 0
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Costo de envío</span>
                  <span>S/ {Number(detalle.precioDelivery || 0).toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-semibold pt-1 border-t border-slate-100 mt-1">
                  <span>Total</span>
                  <span>
                    S/{" "}
                    {(
                      Number(detalle.monto_Total_Promocional || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* =============================
              BOTONES ACCIÓN (VERSIÓN FINAL)
          ============================= */}

          <div className="flex flex-wrap gap-3 justify-center">
            {/* ====== BOTÓN IMPRIMIR COMPROBANTE ====== */}
            <button
              type="button"
              disabled={pdfLoading}
              onClick={async () => {
                try {
                  setPdfLoading(true);

                  // Genera el PDF bajo demanda (NO bloquea el modal)
                  const blob = await pdf(
                    <PedidoComprobantePDF data={detalle} />
                  ).toBlob();

                  const url = URL.createObjectURL(blob);

                  // Fuerza la descarga del PDF
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `Comprobante_${pedido.codigo}.pdf`;
                  a.click();

                  URL.revokeObjectURL(url);
                  setPdfLoading(false);
                } catch (err) {
                  console.error("Error generando PDF:", err);
                  setPdfLoading(false);
                }
              }}
              className={`flex gap-1 items-center justify-center rounded-md px-5 py-2 text-xs font-semibold text-white shadow-sm 
      ${pdfLoading ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-700 hover:bg-emerald-800"}`}
            >
              <Printer size={16} color="#fff" />
              {pdfLoading ? "Generando PDF..." : "Imprimir Comprobante"}
            </button>

            {/* ===== BOTÓN ETIQUETA ===== */}
            <button
              type="button"
              onClick={handleImprimirEtiqueta}
              disabled={esAsesor || loadingEtiqueta}
              className={`flex gap-1 items-center justify-center rounded-md px-5 py-2 text-xs font-semibold text-white shadow-sm
  ${esAsesor ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              <Tag size={16} color="#fff" />

              {loadingEtiqueta ? "Generando..." : "Imprimir Etiqueta Envío"}
            </button>

            {/* ===== BOTÓN WHATSAPP ===== */}
            <button
              type="button"
              onClick={handleCompartirWhatsApp}
              className="flex gap-1 items-center justify-center rounded-md bg-emerald-500 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600"
            >
              <Share2 size={16} color="#fff" />
              Compartir por WhatsApp
            </button>
          </div>

          {/* =============================
              HISTORIAL DEL PEDIDO
          ============================= */}
          {/* === BLOQUE COMPLETO ORIGINAL === */}

          <div className="border rounded-2xl p-4 bg-white">
            <p className="text-sm font-semibold mb-3">Historial del Pedido</p>

            {historial.length === 0 ? (
              <p className="text-xs text-gray-500">
                Sin movimientos registrados.
              </p>
            ) : (
              <div className="border-t pt-3">
                {historial.map((h, idx) => {
                  const esUltimo = idx === historial.length - 1;
                  const numero = idx + 1;

                  return (
                    <div key={h.id} className="flex items-start gap-2 mt-2">
                      <div className="flex flex-col items-center mt-1">
                        <div
                          className={
                            esUltimo
                              ? "w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs"
                              : "w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs"
                          }
                        >
                          {esUltimo ? "✓" : numero}
                        </div>
                        {!esUltimo && (
                          <div className="w-px flex-1 bg-gray-300" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="text-sm font-semibold">{h.titulo}</div>
                        <div className="text-xs text-gray-500">
                          {formatearFechaHistorial(h.fechaHora)}
                        </div>
                        <div className="text-xs mt-1">{h.descripcion}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* =============================
              BOTÓN GUARDAR CAMBIOS
          ============================= */}

          {cambiosPendientes && !esAsesor && (
            <div className="flex justify-center">
              <button
                onClick={() =>
                  setConfirmConfig({
                    open: true,
                    title: "Confirmar actualización",
                    message: "¿Deseas actualizar los estados del pedido?",
                    onConfirm: async () => {
                      setConfirmConfig((prev) => ({ ...prev, open: false }));
                      await handleGuardar();
                    },
                  })
                }
                className="bg-emerald-600 text-white rounded-full px-8 py-2 text-sm hover:bg-emerald-700"
              >
                Guardar Cambios
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =============================
            TOAST LOCAL
      ============================= */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast
            message={toastMsg.msg}
            type={toastMsg.type}
            onClose={() => setToastMsg(null)}
          />
        </div>
      )}
    </div>
  );
};

export default ActualizarEstadosModal;

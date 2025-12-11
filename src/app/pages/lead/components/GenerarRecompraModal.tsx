import React, { useEffect, useState } from "react";
import { X, User, Briefcase, Package, MapPin } from "lucide-react";
import { PedidoService } from "@/services/pedidoService";
import { ConfirmModal } from "@/components/ui/confirmModal";
import { LeadService } from "@/services/leadService";
import { Toast } from "@/components/ui/toast";
import { useNavigate } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  idPedido: number | null;
};

const GenerarRecompraModal: React.FC<Props> = ({ open, onClose, idPedido }) => {
  const navigate = useNavigate();
  const [detalle, setDetalle] = useState<any>(null);

  const [historial, setHistorial] = useState<
    { id: string; titulo: string; descripcion: string; fechaHora: string }[]
  >([]);

  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: () => { },
  });

  const [toastMsg, setToastMsg] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToastLocal = (msg: string, type: "success" | "error") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 2500);
  };

  const userLS = JSON.parse(localStorage.getItem("sn_user") || "{}");

  // === Obtener detalle real del pedido ===
  useEffect(() => {
    const fetchDetalle = async () => {
      if (!idPedido) return;

      const res = await PedidoService.getDetallePedido(idPedido);
      const d = res?.data;
      if (!d) return;

      setDetalle(d);

      const h = d.detallePedidoHistoricoPedidoEstado?.map((x: any) => ({
        id: String(x.orden_Historico_Pedido),
        titulo: x.titulo,
        descripcion: x.detalle_del_Estatus,
        fechaHora: x.fecha_Registro_Pedido,
      }));

      setHistorial(h || []);
    };

    fetchDetalle();
  }, [idPedido]);

  if (!open) return null;

  const handleRecomprar = async () => {
    try {
      if (!idPedido) return;

      // === 1. Obtener data de recompra
      const res = await PedidoService.getPedidoParaRecompra(idPedido);

      if (!res || res.error || !res.data) {
        showToastLocal("No se pudo obtener datos para recompra.", "error");
        return;
      }

      const d = res.data;

      // === 2. Crear nuevo Lead para la recompra
      const body = {
        numeroDeContacto: d.leadParaRecompra.numero_De_Contacto,
        idMedioRegistroLead: d.leadParaRecompra.id_Medio_Registro_Lead,
        idCampana: d.leadParaRecompra.id_Campana,
        idAsesorActual: userLS.id_Usuario || 0,
        idUsuarioRegistroLead: userLS.id_Usuario || 0,
      };

      const resLead = await LeadService.insertLead(body);

      if (!resLead || resLead.error || !resLead.data) {
        showToastLocal("No se pudo crear el nuevo Lead.", "error");
        return;
      }

      const nuevoIdLead = resLead.data;
      showToastLocal("Lead para recompra creado correctamente.", "success");

      // === 3. Construir data completa del pedido de recompra
      const payloadNuevoPedido = {
        // ===== PEDIDO BASE =====
        id_Lead: nuevoIdLead,
        numero_De_Contacto: d.leadParaRecompra.numero_De_Contacto,
        telefono_Alterno: d.telefono_Alterno,
        id_Acuerdo_de_Pago: d.id_Acuerdo_de_Pago,
        cantidad_Productos: d.cantidad_Productos,
        monto_Total_Regular: d.monto_Total_Regular,
        monto_Total_Promocional: d.monto_Total_Promocional,

        // ===== DATOS DEL CLIENTE =====
        cliente: {
          id_Tipo_Documento: d.clienteParaRecompra.id_Tipo_Documento,
          numero_Documento: d.clienteParaRecompra.numero_Documento,
          cliente: d.clienteParaRecompra.cliente,
          mail: d.clienteParaRecompra.mail,
          id_Tipo_Comprobante: d.clienteParaRecompra.id_Tipo_Comprobante
        },

        // ===== DATOS DEL DELIVERY =====
        delivery: {
          id_Medio_de_Envio: d.deliveryParaRecompra.id_Medio_de_Envio,
          id_Tipo_de_Entrega: d.deliveryParaRecompra.id_Tipo_de_Entrega,
          id_Departamento: d.deliveryParaRecompra.id_Departamento,
          id_Provincia: d.deliveryParaRecompra.id_Provincia,
          id_Distrito: d.deliveryParaRecompra.id_Distrito,
          direccion_Delivery: d.deliveryParaRecompra.direccion_Delivery,
          referencia: d.deliveryParaRecompra.referencia,
          indicaciones_De_Entrega: d.deliveryParaRecompra.indicaciones_De_Entrega,
          link_Geolocalizacion: d.deliveryParaRecompra.link_Geolocalizacion,
          receptor_Autorizado: d.deliveryParaRecompra.receptor_Autorizado,
          nombre_Receptor_Autorizado: d.deliveryParaRecompra.nombre_Receptor_Autorizado,
          fecha_Pactada_Delivery: d.deliveryParaRecompra.fecha_Pactada_Delivery,
          id_Horario_Pactado: d.deliveryParaRecompra.id_Horario_Pactado
        },

        // ===== PRODUCTOS DEL PEDIDO =====
        productos: d.detallePedidoParaRecompras.map((p: any) => ({
          id_Producto: p.id_Producto,
          nombre_Producto: p.nombre_Producto,
          precio_Regular: p.precio_Regular,
          precio_Promocional: p.precio_Promocional,
          id_Descuento_Aplicado: p.id_Descuento_Aplicado,
          cantidad: p.cantidad,
          subtotal_Regular: p.subtotal_Regular,
          subtotal_Promocional: p.subtotal_Promocional
        }))
      };
      console.log(payloadNuevoPedido);
      // === 4. Pasar payload por navegación a /pedidos/crear
      navigate('/pedidos/crear', {
        state: {
          modo: "recompra",
          payloadNuevoPedido
        }
      });
    } catch (err) {
      console.error(err);
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
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg relative max-h-[90vh] flex flex-col">

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
                Pedido Histórico
              </h2>
              <p className="text-xs text-gray-500">
                Detalle del pedido anterior
              </p>
            </div>

            {detalle && (
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-700">
                  {detalle.id_Pedido}
                </p>
                <p className="text-xs text-slate-500">
                  {detalle.fecha_Registro_Pedido}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CONTENIDO SCROLL */}
        <div className="px-6 py-4 space-y-6 overflow-y-auto">

          {/* ESTADOS */}
          {detalle && (
            <div className="grid gap-4 md:grid-cols-3">

              {/* Operación */}
              <div>
                <p className="text-xs font-medium text-slate-600">Estado de Operación</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {detalle.estatus_Operacion}
                </p>
              </div>

              {/* Pago */}
              <div>
                <p className="text-xs font-medium text-slate-600">Estado de Pago</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {detalle.estatus_Pago}
                </p>
              </div>

              {/* Facturación */}
              <div>
                <p className="text-xs font-medium text-slate-600">Estado de Facturación</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {detalle.estatus_Facturacion}
                </p>
              </div>
            </div>
          )}

          {/* INFORMACIÓN DEL CLIENTE */}
          {detalle && (
            <div className="grid gap-4 md:grid-cols-3">

              {/* Cliente */}
              <div className="border rounded-2xl p-4 bg-white">
                <p className="flex gap-1 text-sm font-semibold mb-1">
                  <User size={18} color="#0E9F6E" />
                  Información del Cliente
                </p>

                <p className="text-xs text-gray-500 mt-1">Nombre completo</p>
                <p className="text-sm">{detalle.detalleClientePorPedido?.cliente}</p>

                <p className="text-xs text-gray-500 mt-2">Documento</p>
                <p className="text-sm">
                  {detalle.detalleClientePorPedido?.tipo_Documento}:
                  {" "}
                  {detalle.detalleClientePorPedido?.numero_Documento}
                </p>

                <p className="text-xs text-gray-500 mt-2">Teléfono</p>
                <p className="text-sm">
                  {detalle.telefono_Alterno}
                </p>
              </div>

              {/* Asesor */}
              <div className="border rounded-2xl p-4 bg-white">
                <p className="flex gap-1 text-sm font-semibold mb-1">
                  <Briefcase size={18} color="#0E9F6E" />
                  Información del Asesor
                </p>

                <p className="text-xs text-gray-500">Asesor</p>
                <p className="text-sm">{detalle.detalleLeadPorPedido?.asesor}</p>

                <p className="text-xs text-gray-500 mt-2">Supervisor</p>
                <p className="text-sm">{detalle.detalleLeadPorPedido?.supervisor}</p>

                <p className="text-xs text-gray-500 mt-2">Medio</p>
                <p className="text-sm">{detalle.detalleLeadPorPedido?.medio_Registro_Lead}</p>
              </div>

              {/* Envío */}
              <div className="border rounded-2xl p-4 bg-white">
                <p className="flex gap-1 text-sm font-semibold mb-1">
                  <MapPin size={18} color="#0E9F6E" />
                  Información de Envío
                </p>

                {detalle.detalleDeliveryPorPedido ? (
                  <>
                    <p className="text-xs text-gray-500 mt-1">Tipo de entrega</p>
                    <p className="text-sm">{detalle.detalleDeliveryPorPedido.tipo_de_Entrega}</p>

                    <p className="text-xs text-gray-500 mt-2">Dirección</p>
                    <p className="text-sm">{detalle.detalleDeliveryPorPedido.direccion_Delivery}</p>

                    <p className="text-xs text-gray-500 mt-2">Provincia</p>
                    <p className="text-sm">
                      {detalle.detalleDeliveryPorPedido.provincia}
                    </p>

                    <p className="text-xs text-gray-500 mt-2">Distrito</p>
                    <p className="text-sm">
                      {detalle.detalleDeliveryPorPedido.distrito}
                    </p>

                    <p className="text-xs text-gray-500 mt-2">Medio de Envío</p>
                    <p className="text-sm">
                      {detalle.detalleDeliveryPorPedido.medio_de_Envio}
                    </p>

                    <p className="text-xs text-gray-500 mt-2">Fecha Pactada</p>
                    <p className="text-sm">
                      {detalle.detalleDeliveryPorPedido.fecha_Pactada_Delivery}
                    </p>

                    <p className="text-xs text-gray-500 mt-2">Horario Pactado</p>
                    <p className="text-sm">
                      {detalle.detalleDeliveryPorPedido.horario_Pactado}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 italic mt-1">Sin datos de envío.</p>
                )}
              </div>
            </div>
          )}

          {/* PRODUCTOS */}
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

          {/* INDICACIONES Y RESUMEN DEL PEDIDO */}
          <div className="flex gap-4">
            <div className="border rounded-2xl p-4 bg-white flex-1">
              <p className="flex gap-1 text-sm font-semibold text-gray-800 mb-2">
                <MapPin size={18} color="#0E9F6E" />
                Indicaciones de Entrega
              </p>

              {detalle?.detalleDeliveryPorPedido?.indicaciones_De_Entrega ? (
                <p className="text-xs text-gray-700">
                  {detalle.detalleDeliveryPorPedido.indicaciones_De_Entrega}
                </p>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  No hay indicaciones registradas para este pedido.
                </p>
              )}
            </div>

            <div className="border rounded-2xl p-4 bg-white max-w-xs flex-1">
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
                        Number(detalle.monto_Total_Promocional || 0) +
                        Number(detalle.precioDelivery || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* HISTORIAL DEL PEDIDO */}
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

          {/* BOTÓN GENERAR RECOMPRA */}

          <div className="flex justify-center">
            <button
              onClick={() =>
                setConfirmConfig({
                  open: true,
                  title: "Confirmar Recompra",
                  message: `Se creará un nuevo Lead para iniciar la recompra.\n\n` +
                    `Teléfono: ${detalle.detalleLeadPorPedido.numero_De_Contacto}`,
                  onConfirm: async () => {
                    setConfirmConfig((prev) => ({ ...prev, open: false }));
                    await handleRecomprar();
                  },
                })
              }
              className="bg-emerald-600 text-white rounded-full px-8 py-2 text-sm hover:bg-emerald-700"
            >
              Generar Recompra
            </button>
          </div>
        </div>
      </div>
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

export default GenerarRecompraModal;

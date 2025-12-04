import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { PedidoService } from "@/services/pedidoService";
import ReactSelect from "react-select";

type EstadoPagoOpcion = {
  value: number;
  label: string;
};

type MedioPagoOpcion = {
  value: number;
  label: string;
};

const ESTADOS_PAGO: EstadoPagoOpcion[] = [
  { value: 1, label: "Pendiente" },
  { value: 2, label: "Adelanto" },
  { value: 3, label: "Pagado" },
  { value: 4, label: "Reembolsado" },
  { value: 5, label: "Reembolsado Parcial" },
];

const MEDIOS_PAGO: MedioPagoOpcion[] = [
  { value: 1, label: "Efectivo" },
  { value: 2, label: "Yape" },
  { value: 3, label: "POS" },
  { value: 4, label: "Transf. BCP" },
  { value: 5, label: "Transf. IBK" },
  { value: 6, label: "Transf. BBVA" },
  { value: 7, label: "Transf. BN" },
  { value: 8, label: "Link de Pago" },
  { value: 9, label: "Recaudo Pago" },
];

const selectStyles = {
  control: (base: any) => ({
    ...base,
    borderRadius: 12,
    borderColor: "#E5E7EB",
    minHeight: 44,
    backgroundColor: "#F9FAFB",
    fontSize: 13,
    paddingLeft: 4,
  }),
};

export type PagoHistorialRow = {
  id: string;
  orden: number;
  usuario: string;
  estadoNombre: string;
  fecha: string;
  medioPagoNombre: string;
  codigoOperacion: string;
  monto: number;
  detalle: string;
};

export type PedidoPagoPersistente = {
  estadoPagoId: number;
  totalPagado: number;
  historial: PagoHistorialRow[];
  bloqueado: boolean;
};

type PedidoPagoResumen = {
  codigo: string;
  total: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  pedido: PedidoPagoResumen | null;
  pagosPorPedido: Record<string, PedidoPagoPersistente>;
  setPagosPorPedido: React.Dispatch<
    React.SetStateAction<Record<string, PedidoPagoPersistente>>
  >;
  showToast: (msg: string, type?: "success" | "error") => void;
};

type PagoAgregadoTemp = {
  id: string;
  medioPagoId: number;
  medioPagoNombre: string;
  monto: number;
  codigoOperacion: string;
};

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:bg-white focus:outline-none";

function formatNow(): string {
  const date = new Date();
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${d}/${m}/${y} - ${hh}:${mm}`;
}

function getCurrentUserName(): string {
  try {
    const raw = localStorage.getItem("sn_user");
    if (raw) {
      const parsed: any = JSON.parse(raw);
      return (
        parsed?.nombreCompleto ||
        parsed?.nombres ||
        parsed?.nombre ||
        parsed?.userName ||
        parsed?.username ||
        "Usuario"
      );
    }
  } catch {
    return "Usuario";
  }
  return "Usuario";
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return (crypto.randomUUID as () => string)();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const ActualizarPagoModal: React.FC<Props> = ({
  open,
  onClose,
  pedido,
  pagosPorPedido,
  setPagosPorPedido, // por ahora no lo usamos, pero lo mantenemos en la firma
  showToast,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [pagoEstadoId, setPagoEstadoId] = useState<number>(1);
  const [pagoDetalleEstado, setPagoDetalleEstado] = useState("");
  const [pagoMedioId, setPagoMedioId] = useState<number | null>(null);
  const [pagoMonto, setPagoMonto] = useState<string>("");
  const [pagoCodigoOperacion, setPagoCodigoOperacion] = useState<string>("");

  const [pagosAgregadosTemp, setPagosAgregadosTemp] = useState<
    PagoAgregadoTemp[]
  >([]);

  const [pagoHistorialActual, setPagoHistorialActual] = useState<
    PagoHistorialRow[]
  >([]);

  const [saldoPendiente, setSaldoPendiente] = useState<number>(0);
  const [bloqueadoPago, setBloqueadoPago] = useState<boolean>(false);

  const pagoPersistenteActual = useMemo(() => {
    if (!pedido) return undefined;
    return pagosPorPedido[pedido.codigo];
  }, [pedido, pagosPorPedido]);

  const totalPedidoSeleccionado = pedido?.total ?? 0;

  const bloquearEstadoPagoSelect =
    !!pagoPersistenteActual &&
    pagoPersistenteActual.estadoPagoId === 3 &&
    pagoPersistenteActual.bloqueado;

  const totalTemp = pagosAgregadosTemp.reduce(
    (sum: number, p) => sum + p.monto,
    0
  );

  // ============================
  // Al abrir el modal:
  // - consulta historial real
  // - calcula saldo
  // - define si está bloqueado
  // - define estado de pago (Pagado/Pendiente)
  // ============================
  useEffect(() => {
    const init = async () => {
      if (!open || !pedido) return;

      setPagosAgregadosTemp([]);
      setPagoDetalleEstado("");
      setPagoMedioId(null);
      setPagoMonto("");
      setPagoCodigoOperacion("");

      try {
        const historicoResponse = await PedidoService.getHistoricoPago(
          Number(pedido.codigo)
        );

        const raw = historicoResponse?.data ?? [];

        // 🔥 MAPEO AL FORMATO DEL MODAL
        const historialMapeado: PagoHistorialRow[] = raw.map((item: any) => ({
          id: generateId(),
          orden: item.orden_Historico,
          usuario: item.registrador,
          estadoNombre: item.estatus_Pago,
          fecha: item.fecha_Registro_Historico_Pedido_Estatus_Pago,
          medioPagoNombre: item.medio_de_Pago,
          codigoOperacion: item.numero_Operacion,
          monto: Number(item.monto_de_Pago),
          detalle: item.detalle_del_Estatus
        }));

        setPagoHistorialActual(historialMapeado);

        // 🔥 Total pagado REAL
        const totalRealPagado = historialMapeado.reduce(
          (sum: number, h) => sum + h.monto,
          0
        );

        const saldo = Math.max(pedido.total - totalRealPagado, 0);
        setSaldoPendiente(saldo);

        const pagadoCompleto = saldo <= 0.0001;

        setPagoEstadoId(pagadoCompleto ? 3 : 1);
        setBloqueadoPago(pagadoCompleto);

      } catch (err) {
        console.error("Error al obtener historial:", err);
      }
    };

    init();
  }, [open, pedido]);


  if (!open || !pedido) return null;

  const handleAgregarPago = () => {
    if (bloqueadoPago) return;

    if (!pagoMedioId) {
      showToast("Seleccione un medio de pago.", "error");
      return;
    }
    if (!pagoMonto) {
      showToast("Ingrese un monto.", "error");
      return;
    }

    const monto = Number(pagoMonto);
    if (isNaN(monto) || monto <= 0) {
      showToast("Ingrese un monto válido.", "error");
      return;
    }

    const pendienteDisponible = saldoPendiente - totalTemp;
    if (monto > pendienteDisponible + 0.0001) {
      showToast(
        `El monto excede el saldo pendiente de S/ ${pendienteDisponible.toFixed(
          2
        )}.`,
        "error"
      );
      return;
    }

    const medio = MEDIOS_PAGO.find((m) => m.value === pagoMedioId);
    if (!medio) {
      showToast("Medio de pago inválido.", "error");
      return;
    }

    const nuevo: PagoAgregadoTemp = {
      id: generateId(),
      medioPagoId: medio.value,
      medioPagoNombre: medio.label,
      monto,
      codigoOperacion: pagoCodigoOperacion.trim(),
    };

    setPagosAgregadosTemp((prev) => [...prev, nuevo]);

    setPagoMedioId(null);
    setPagoMonto("");
    setPagoCodigoOperacion("");
  };

  const handleEliminarPagoTemp = (id: string) => {
    setPagosAgregadosTemp((prev) => prev.filter((p) => p.id !== id));
  };

  // ==============================
  // Llamada real al servicio Insert
  // ==============================
  const realizarActualizacionPago = async () => {
    try {
      const usuario = JSON.parse(localStorage.getItem("sn_user") || "{}");
      const idUsuario = usuario?.id_Usuario ?? 0;

      const payload = {
        id_Pedido: Number(pedido.codigo),
        id_Estatus_Pago: pagoEstadoId,
        detalle_del_Estatus:
          pagoDetalleEstado.trim() || "Actualización de pago",
        id_Usuario_Registro_Historico_Pedido_Estatus_Pago: idUsuario,
        requestDetailInsertEstadoPagos: pagosAgregadosTemp.map((p) => ({
          id_Medio_de_Pago: p.medioPagoId,
          numero_Operacion: p.codigoOperacion || "",
          monto_de_Pago: p.monto,
        })),
      };

      console.log("REQUEST →", payload);

      const response = await PedidoService.insertPedidoEstatusPago(payload);
      console.log("RESPONSE →", response);

      if (response?.error === true) {
        showToast(
          response?.message || "Error al registrar el pago.",
          "error"
        );
        return;
      }

      showToast("Estado de pago actualizado correctamente.", "success");

      // Aquí NO refrescamos historial ni recalculamos nada.
      // La próxima vez que se abra el modal, el useEffect consultará el historial real.
      setConfirmOpen(false);
      onClose();
    } catch (err) {
      console.error(err);
      showToast("No se pudo actualizar el pago.", "error");
    }
  };

  const estadoPagoModalActual =
    ESTADOS_PAGO.find((e) => e.value === pagoEstadoId) ?? ESTADOS_PAGO[0];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40 top-[-16px]">
      {/* MODAL PRINCIPAL */}
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-base font-semibold text-slate-800 mb-4">
          Actualizar Pago - Pedido {pedido.codigo} - S/{" "}
          {totalPedidoSeleccionado.toFixed(2)}
        </h2>

        <div className="space-y-4">
          {/* Estado de pago */}
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1">
              Estado de Pago
            </p>
            <ReactSelect
              options={ESTADOS_PAGO}
              value={ESTADOS_PAGO.find((e) => e.value === pagoEstadoId)}
              onChange={(opt: any) => setPagoEstadoId(opt?.value || 1)}
              styles={selectStyles}
              isDisabled={bloquearEstadoPagoSelect || bloqueadoPago}
              placeholder="Seleccionar estado"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Estado actual:{" "}
              <span className="font-semibold text-slate-700">
                {estadoPagoModalActual.label}
              </span>
            </p>

            {bloqueadoPago && (
              <p className="mt-2 text-[11px] font-semibold text-emerald-700">
                Este pedido ya está completamente pagado. No se pueden agregar
                más pagos.
              </p>
            )}
          </div>

          {/* Detalle */}
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1">
              Detalle del Estado
            </p>
            <input
              type="text"
              className={inputClasses}
              placeholder="Ingresar detalle del estado"
              value={pagoDetalleEstado}
              onChange={(e) => setPagoDetalleEstado(e.target.value)}
              disabled={bloqueadoPago}
            />
          </div>

          {/* Medio de pago + Código + Monto */}
          <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-4">
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">
                Medio de Pago
              </p>
              <select
                className={inputClasses}
                value={pagoMedioId ?? ""}
                onChange={(e) =>
                  setPagoMedioId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                disabled={bloqueadoPago || saldoPendiente <= 0}
              >
                <option value="">Seleccionar</option>
                {MEDIOS_PAGO.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">
                Código de Operación
              </p>
              <input
                type="text"
                className={inputClasses}
                placeholder="Código de operación"
                value={pagoCodigoOperacion}
                onChange={(e) => setPagoCodigoOperacion(e.target.value)}
                disabled={bloqueadoPago || saldoPendiente <= 0}
              />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">
                Monto
              </p>
              <input
                type="number"
                className={inputClasses}
                placeholder="Ingresar monto"
                value={pagoMonto}
                onChange={(e) => setPagoMonto(e.target.value)}
                disabled={bloqueadoPago || saldoPendiente <= 0}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Saldo pendiente: S/ {(saldoPendiente - totalTemp).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Botón agregar pago */}
          <div className="flex items-center justify-end mt-2">
            <button
              type="button"
              onClick={handleAgregarPago}
              disabled={bloqueadoPago || saldoPendiente <= 0}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              + Agregar Pago
            </button>
          </div>

          {/* Pagos agregados (sesión actual) */}
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-800 mb-2">
              Pagos Agregados
            </p>

            <div className="border border-slate-200 rounded-xl">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="py-2 px-3 text-left">Medio de Pago</th>
                    <th className="py-2 px-3 text-left">Código Op.</th>
                    <th className="py-2 px-3 text-left">Monto</th>
                    <th className="py-2 px-3 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosAgregadosTemp.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-3 px-3 text-slate-500">
                        No hay pagos agregados en esta sesión.
                      </td>
                    </tr>
                  ) : (
                    pagosAgregadosTemp.map((p) => (
                      <tr
                        key={p.id}
                        className="border-t border-slate-100"
                      >
                        <td className="py-2 px-3">
                          {p.medioPagoNombre}
                        </td>
                        <td className="py-2 px-3">
                          {p.codigoOperacion || "-"}
                        </td>
                        <td className="py-2 px-3">
                          S/ {p.monto.toFixed(2)}
                        </td>
                        <td className="py-2 px-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleEliminarPagoTemp(p.id)
                            }
                            className="inline-flex items-center gap-1 rounded-full border border-rose-500 px-3 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
                          >
                            ✕ Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historial de pagos (desde backend) */}
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-800 mb-2">
              Historial de Pagos
            </p>
            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="py-2 px-3 text-left">Orden</th>
                    <th className="py-2 px-3 text-left">Usuario</th>
                    <th className="py-2 px-3 text-left">Estado</th>
                    <th className="py-2 px-3 text-left">Fecha</th>
                    <th className="py-2 px-3 text-left">Medio</th>
                    <th className="py-2 px-3 text-left">N° Operación</th>
                    <th className="py-2 px-3 text-left">Monto</th>
                    <th className="py-2 px-3 text-left">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {pagoHistorialActual.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-3 px-3 text-slate-500">
                        Aún no hay movimientos registrados.
                      </td>
                    </tr>
                  ) : (
                    pagoHistorialActual.map((h) => (
                      <tr
                        key={h.id}
                        className="border-t border-slate-100"
                      >
                        <td className="py-2 px-3">{h.orden}</td>
                        <td className="py-2 px-3">{h.usuario}</td>
                        <td className="py-2 px-3">{h.estadoNombre}</td>
                        <td className="py-2 px-3">{h.fecha}</td>
                        <td className="py-2 px-3">{h.medioPagoNombre}</td>
                        <td className="py-2 px-3">
                          {h.codigoOperacion || "-"}
                        </td>
                        <td className="py-2 px-3">
                          S/ {h.monto.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-[10px] leading-tight">{h.detalle}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Botón principal */}
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={bloqueadoPago}
              className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              ✓ Actualizar Estado de Pago
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[360px] shadow-xl">
            <p className="text-sm font-semibold text-slate-800">
              ¿Confirmar actualización del estado de pago?
            </p>
            <p className="text-xs text-slate-600 mt-2">
              Se registrarán los pagos agregados y se actualizará el estado del
              pedido.
            </p>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 text-sm rounded-lg bg-slate-200 hover:bg-slate-300"
              >
                Cancelar
              </button>

              <button
                onClick={realizarActualizacionPago}
                className="px-4 py-2 text-sm rounded-lg bg-emerald-700 text-white hover:bg-emerald-800"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActualizarPagoModal;

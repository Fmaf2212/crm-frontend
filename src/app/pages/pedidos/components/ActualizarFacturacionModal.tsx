import React, { useState } from "react";
import { X } from "lucide-react";
import ReactSelect from "react-select";
import { PedidoService } from "@/services/pedidoService";
import { Button } from "@/components/ui/button";

const ESTADOS_FACTURACION = [
  { value: 1, label: "Pendiente" },
  { value: 2, label: "Facturado" },
  { value: 3, label: "Re-Facturado" },
  { value: 4, label: "Por Anular" },
  { value: 5, label: "Anulado" },
];

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:bg-white focus:outline-none";

const selectStyles = {
  control: (base: any) => ({
    ...base,
    borderRadius: 12,
    borderColor: "#E5E7EB",
    minHeight: 44,
    backgroundColor: "#F9FAFB",
    fontSize: 14,
    paddingLeft: 4,
  }),
};

export default function ActualizarFacturacionModal({
  open,
  pedido,
  onClose,
  showToast,
  onUpdated,
}: {
  open: boolean;
  pedido: any;
  onClose: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
  onUpdated: () => void;
}) {
  const [estadoFacturacionId, setEstadoFacturacionId] = useState<number>(1);
  const [detalleEstado, setDetalleEstado] = useState("");
  const [idopErp, setIdopErp] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open || !pedido) return null;

  const realizarActualizacionFacturacion = async () => {
    try {
      setLoading(true);

      const rawUser = localStorage.getItem("sn_user");
      const parsed = rawUser ? JSON.parse(rawUser) : {};
      const idUsuario = parsed?.id_Usuario ?? 0;

        let detalleFinal = "";

        if (idopErp && detalleEstado) {
            detalleFinal = `${idopErp} | ${detalleEstado}`;
        } else if (idopErp) {
            detalleFinal = idopErp;
        } else if (detalleEstado) {
            detalleFinal = detalleEstado;
        } else {
            detalleFinal = "Actualización de facturación";
        }

        const payload = {
            id_Pedido: Number(pedido.codigo),
            id_Estatus_Facturacion: estadoFacturacionId,
            detalle_del_Estatus: detalleFinal,
            id_Usuario_Registro_Historico_Pedido_Estatus_Pago: idUsuario
        };

        const res = await PedidoService.insertPedidoEstatusFacturacion(payload);

        if (res?.error === true) {
            showToast(res?.message || "Error al actualizar facturación.", "error");
            setLoading(false);
            return;
        }

        showToast("Facturación actualizada correctamente.", "success");
        setConfirmOpen(false);
        setLoading(false);
        onUpdated();
        onClose();
    } catch (err) {
      console.error(err);
      showToast("No se pudo actualizar la facturación.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60] top-[-16px]">
      {/* MODAL PRINCIPAL */}
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">

        {/* Cerrar */}
        <button
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        {/* CABECERA IGUAL QUE ACTUALIZAR PAGO */}
        <h2 className="text-base font-semibold text-slate-800 mb-4">
          Actualizar Facturación – Pedido {pedido.codigo}
        </h2>

        <div className="space-y-4">

          {/* ESTADO FACTURACIÓN */}
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1">
              Estado de Facturación
            </p>

            <ReactSelect
              options={ESTADOS_FACTURACION}
              value={ESTADOS_FACTURACION.find((e) => e.value === estadoFacturacionId)}
              onChange={(opt: any) => setEstadoFacturacionId(opt.value)}
              styles={selectStyles}
            />

            <p className="mt-1 text-[11px] text-slate-500">
              Estado actual seleccionado:{" "}
              <span className="font-semibold text-slate-700">
                {ESTADOS_FACTURACION.find((e) => e.value === estadoFacturacionId)?.label}
              </span>
            </p>
          </div>

          {/* DETALLE */}
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1">
              Detalle del Estado
            </p>
            <input
              type="text"
              className={inputClasses}
              placeholder="Ingresar detalle del estado (opcional)"
              value={detalleEstado}
              onChange={(e) => setDetalleEstado(e.target.value)}
            />
          </div>

          {/* IDOP ERP */}
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1">
              IDOP de ERP
            </p>
            <input
              type="text"
              className={inputClasses}
              placeholder="Opcional"
              value={idopErp}
              onChange={(e) => setIdopErp(e.target.value)}
            />
          </div>

          {/* BOTÓN PRINCIPAL IGUAL QUE ACTUALIZAR PAGO */}
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              ✓ Actualizar Facturación
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN - MISMO FORMATO */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70]">
          <div className="bg-white p-6 rounded-xl w-[360px] shadow-xl">
            <p className="text-lg font-semibold text-gray-800 mb-2">
              ¿Confirmar actualización de facturación?
            </p>
            <p className="text-sm text-gray-600">
              Se registrará el nuevo estado del pedido.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline"
                onClick={() => setConfirmOpen(false)}
              >
                Cancelar
              </Button>

              <Button
                disabled={loading}
                onClick={realizarActualizacionFacturacion}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? "Procesando..." : "Sí, actualizar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

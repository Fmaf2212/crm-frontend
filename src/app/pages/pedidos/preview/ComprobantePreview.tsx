import { PDFViewer } from "@react-pdf/renderer";
import PedidoComprobantePDF from "../components/PedidoComprobantePDF"; // ajusta la ruta si tu carpeta es distinta

// ⚠ Importa el tipo Pedido desde donde lo tengas definido
import type { Pedido } from "../SeguimientoPedido";

export default function ComprobantePreview() {
  // ===== MOCK para previsualizar =====
  const pedidoMock: Pedido = {
    codigo: "PED001",
    cliente: "Juan Pérez",
    telefono: "987654321",
    total: 150,
    asesor: "Carlos Mendoza",
    estadoPedido: "Confirmada",
    estadoPago: "Pendiente",
    estadoFacturacion: "Pendiente",
    fechaIngreso: "15/11/2025 - 14:30",
    fechaConfirmacion: "15/11/2025 - 15:45",
    fechaPactada: "16/11/2025",
    fechaEntrega: "16/11/2025",
  };

  return (
    <div className="w-full h-screen bg-gray-100 p-4">
      <h1 className="text-lg font-semibold mb-4">
        Vista previa del Comprobante de Pedido
      </h1>

      <PDFViewer width="100%" height="90%">
        <PedidoComprobantePDF pedido={pedidoMock} />
      </PDFViewer>
    </div>
  );
}

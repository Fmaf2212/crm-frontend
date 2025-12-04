import { PDFViewer } from "@react-pdf/renderer";
import PedidoComprobantePDF from "../components/PedidoComprobantePDF";

export default function ComprobantePreview() {
  const dataMock = {
    codigo: "PED001",
    fecha_Registro_Pedido: "15/11/2025 14:30",

    detalleClientePorPedido: {
      cliente: "Juan Pérez",
      tipo_Documento: "DNI",
      numero_Documento: "12345678",
    },

    detalleLeadPorPedido: {
      numero_De_Contacto: "987654321",
      asesor: "Carlos Mendoza",
      supervisor: "Ana Torres",
    },

    detalleDeliveryPorPedido: {
      direccion: "Av. Siempre Viva 742",
      provincia: "Lima",
      medio_Envio: "Shalom",
      indicaciones: null,
    },

    detallePedido: {
      nombre_Producto: "Producto Demo",
      precio_Regular: 100,
      nombre_Descuento: "Sin Descuento",
      precio_Promocional: 80,
      cantidad: 1,
      subtotal_Promocional: 80,
    },

    monto_Total_Regular: 100,
    monto_Total_Promocional: 80,
    precioDelivery: 0,

    estatus_Operacion: "Ingresada",
    estatus_Pago: "Pendiente",
    estatus_Facturacion: "Pendiente",
  };

  return (
    <div className="w-full h-screen bg-gray-100 p-4">
      <h1 className="text-lg font-semibold mb-4">
        Vista previa del Comprobante de Pedido
      </h1>

      <PDFViewer width="100%" height="90%">
        <PedidoComprobantePDF data={dataMock} />
      </PDFViewer>
    </div>
  );
}

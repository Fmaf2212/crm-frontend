import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Pedido } from "../SeguimientoPedido";

// ================ PDF: COMPROBANTE DE PEDIDO =================

type PedidoComprobanteProps = {
  pedido: Pedido;
};

const comprobanteStyles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 60,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logoBox: {
    width: 80,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 9,
    color: "#10B981",
  },
  headerTitleBlock: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#059669",
  },
  headerSub: {
    marginTop: 4,
    fontSize: 9,
    color: "#6B7280",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerCode: {
    fontSize: 11,
    fontWeight: 700,
    color: "#111827",
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#059669",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  card: {
    borderTopColor: "#E5E7EB",
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    paddingTop: 8,
  },
  row: {
    flexDirection: "row",
  },
  rowBlockInput: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 9,
    color: "#6B7280",
    marginTop: 4,
  },
  value: {
    marginLeft: 5,
    fontSize: 10,
    color: "#111827",
    marginTop: 1,
    lineHeight: .8,
  },
  table: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  th: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontSize: 9,
    fontWeight: 700,
    color: "#374151",
  },
  td: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 9,
    color: "#111827",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  resumenCard: {
    borderWidth: 1,
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    borderRadius: 6,
    padding: 8,
    width: 190,
    alignSelf: "flex-end",
    marginTop: 8,
  },
  resumenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  resumenRowTotalAPagar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    borderTopColor: "#E5E7EB",
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    paddingTop: 4,
  },
  resumenLabel: {
    fontSize: 9,
    color: "#6B7280",
  },
  resumenValue: {
    fontSize: 9,
    color: "#111827",
  },
  resumenTotalLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "#111827",
    marginTop: 4,
  },
  resumenTotalValue: {
    fontSize: 11,
    fontWeight: 700,
    color: "#059669",
    marginTop: 4,
  },
  infoExtraRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  badge: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgePedido: {
    backgroundColor: "#DBEAFE",
    borderColor: "none",
    color: "#1D4ED8",
  },
  badgePago: {
    backgroundColor: "#DCFCE7",
    borderColor: "none",
    color: "#059669",
  },
  badgeFacturacion: {
    backgroundColor: "#DCFCE7",
    borderColor: "none",
    color: "#059669",
  },
  specialBox: {
    marginTop: 3,
    borderWidth: 1,
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    borderRadius: 6,
    padding: 8,
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    borderTopColor: "#E5E7EB",
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    paddingTop: 12,
  },
});

// Mapea color de fondo y texto según estado del pedido
const getPedidoBadgeStyle = (estado: string) => {
  switch (estado) {
    case "Ingresada":
      return { backgroundColor: "#DBEAFE", color: "#1D4ED8" }; // azul
    case "Incidencia":
      return { backgroundColor: "#FEF3C7", color: "#B45309" }; // amarillo
    case "Confirmada":
      return { backgroundColor: "#DBEAFE", color: "#1D4ED8" };
    case "Cancelada":
    case "Cancelada Retornar":
      return { backgroundColor: "#FECACA", color: "#B91C1C" }; // rojo
    case "Listo Despacho":
    case "Entregada":
    case "Liquidada":
      return { backgroundColor: "#DCFCE7", color: "#059669" }; // verde
    case "En Ruta":
      return { backgroundColor: "#E0F2FE", color: "#0284C7" }; // celeste
    case "En Retorno":
      return { backgroundColor: "#FFEDD5", color: "#C2410C" }; // naranja
    case "Retornada":
      return { backgroundColor: "#E5E7EB", color: "#374151" }; // gris
    default:
      return { backgroundColor: "#E5E7EB", color: "#374151" }; // neutro
  }
};

// Mapea estado de pago
const getPagoBadgeStyle = (estado: string) => {
  switch (estado) {
    case "Pendiente":
      return { backgroundColor: "#FEF3C7", color: "#B45309" };
    case "Pagado":
      return { backgroundColor: "#DCFCE7", color: "#059669" };
    case "Anulado":
      return { backgroundColor: "#FECACA", color: "#B91C1C" };
    default:
      return { backgroundColor: "#E5E7EB", color: "#374151" };
  }
};

// Mapea estado de facturación
const getFacturacionBadgeStyle = (estado: string) => {
  switch (estado) {
    case "Pendiente":
      return { backgroundColor: "#FEF3C7", color: "#B45309" };
    case "Facturado":
      return { backgroundColor: "#DCFCE7", color: "#059669" };
    case "Anulado":
    case "Por Anular":
      return { backgroundColor: "#FECACA", color: "#B91C1C" };
    default:
      return { backgroundColor: "#E5E7EB", color: "#374151" };
  }
};

const PedidoComprobantePDF: React.FC<PedidoComprobanteProps> = ({ pedido }) => {
  // mock de productos (por ahora fijo como el modal)
  const productos = [
    {
      nombre: "Suplemento Multivitamínico Natural",
      codigo: "SUP-001",
      cantidad: 2,
      precio: 85,
      descuento: 5,
      subtotal: 151.5,
    },
    {
      nombre: "Té Verde Detox Premium",
      codigo: "TEA-002",
      cantidad: 2,
      precio: 35,
      descuento: 7,
      subtotal: 63,
    },
    {
      nombre: "Aceite de Coco Orgánico",
      codigo: "CCT-003",
      cantidad: 1,
      precio: 28,
      descuento: 2,
      subtotal: 25.2,
    },
  ];

  const subtotal = productos.reduce((a, p) => a + p.subtotal, 0);
  const descuentoTotal = 18.3; // mock según imagen
  const costoEnvio = 12;
  const totalPagar = subtotal - descuentoTotal + costoEnvio;

  return (
    <Document>
      <Page size="A4" style={comprobanteStyles.page}>
        <View style={comprobanteStyles.headerRow}>
          <View style={comprobanteStyles.logoBox}>
            <Text style={comprobanteStyles.logoText}>LOGO</Text>
          </View>
          <View style={comprobanteStyles.headerRight}>
            <Text style={comprobanteStyles.headerTitle}>
              COMPROBANTE DE PEDIDO
            </Text>
            <Text style={comprobanteStyles.headerSub}>
              Nº ORD-2025-00125
            </Text>
            <Text style={comprobanteStyles.headerSub}>
              {pedido.fechaIngreso}
            </Text>
          </View>
        </View>

        <View style={comprobanteStyles.section}>
          <Text style={comprobanteStyles.sectionTitle}>
            INFORMACIÓN DEL CLIENTE
          </Text>
          <View style={comprobanteStyles.card}>
            <View style={comprobanteStyles.row}>
              <View style={comprobanteStyles.col}>
                <View style={comprobanteStyles.rowBlockInput}>
                  <Text style={comprobanteStyles.label}>Nombre:</Text>
                  <Text style={comprobanteStyles.value}>{pedido.cliente}</Text>
                </View>
                <View style={comprobanteStyles.rowBlockInput}>
                  <Text style={comprobanteStyles.label}>Documento:</Text>
                  <Text style={comprobanteStyles.value}>DNI 12345678</Text>
                </View>
                <View style={comprobanteStyles.rowBlockInput}>
                  <Text style={comprobanteStyles.label}>Teléfono:</Text>
                  <Text style={comprobanteStyles.value}>
                    +51 {pedido.telefono}
                  </Text>
                </View>
              </View>

              <View style={[comprobanteStyles.col, { paddingLeft: 12 }]}>
                <View style={comprobanteStyles.rowBlockInput}>
                  <Text style={comprobanteStyles.label}>Dirección:</Text>
                  <Text style={[comprobanteStyles.value, { maxWidth: 180}]}>
                    Av. Primavera 123 – Santiago de Surco – Lima
                  </Text>
                </View>

                <View style={comprobanteStyles.rowBlockInput}>
                  <Text style={comprobanteStyles.label}>Medio de envío:</Text>
                  <Text style={comprobanteStyles.value}>Shalom</Text>
                </View>

                <View style={comprobanteStyles.rowBlockInput}>
                  <Text style={comprobanteStyles.label}>Fecha de entrega:</Text>
                  <Text style={comprobanteStyles.value}>
                    {pedido.fechaPactada}
                  </Text>
                </View>

                <View style={comprobanteStyles.rowBlockInput}>
                  <Text style={comprobanteStyles.label}>Horario:</Text>
                  <Text style={comprobanteStyles.value}>Entre 9:00 y 13:00 h</Text>
                </View>
              </View>
            </View>
          </View>
        </View>


        <View style={comprobanteStyles.section}>
          <Text style={comprobanteStyles.sectionTitle}>
            INFORMACIÓN DEL PEDIDO
          </Text>

          <View style={comprobanteStyles.card}>
            <View style={comprobanteStyles.table}>

              <View style={comprobanteStyles.tableHeader}>
                <View style={{ flex: 3 }}>
                  <Text style={comprobanteStyles.th}>Producto</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[comprobanteStyles.th, { textAlign: "center" }]}>
                    Cantidad
                  </Text>
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={[comprobanteStyles.th, { textAlign: "right" }]}>
                    Precio Unit.
                  </Text>
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={[comprobanteStyles.th, { textAlign: "right" }]}>
                    Descuento
                  </Text>
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={[comprobanteStyles.th, { textAlign: "right" }]}>
                    Subtotal
                  </Text>
                </View>
              </View>


              {productos.map((p, idx) => (
                <View key={idx} style={comprobanteStyles.tableRow}>
                  <View style={{ flex: 3 }}>
                    <Text style={comprobanteStyles.td}>{p.nombre}</Text>
                    <Text
                      style={[
                        comprobanteStyles.td,
                        { fontSize: 8, color: "#6B7280" },
                      ]}
                    >
                      COD: {p.codigo}
                    </Text>
                  </View>
                  <View style={{ flex: 1, justifyContent: "center" }}>
                    <Text
                      style={[
                        comprobanteStyles.td,
                        { textAlign: "center", marginTop: 0 },
                      ]}
                    >
                      {p.cantidad}
                    </Text>
                  </View>
                  <View style={{ flex: 1.2, justifyContent: "center" }}>
                    <Text
                      style={[
                        comprobanteStyles.td,
                        { textAlign: "right", marginTop: 0 },
                      ]}
                    >
                      S/ {p.precio.toFixed(2)}
                    </Text>
                  </View>
                  <View style={{ flex: 1.2, justifyContent: "center" }}>
                    <Text
                      style={[
                        comprobanteStyles.td,
                        { textAlign: "right", marginTop: 0, color: "#DC2626" },
                      ]}
                    >
                      - S/ {p.descuento.toFixed(2)}
                    </Text>
                  </View>
                  <View style={{ flex: 1.2, justifyContent: "center" }}>
                    <Text
                      style={[
                        comprobanteStyles.td,
                        { textAlign: "right", marginTop: 0 },
                      ]}
                    >
                      S/ {p.subtotal.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={comprobanteStyles.resumenCard}>
            <View style={comprobanteStyles.resumenRow}>
              <Text style={comprobanteStyles.resumenLabel}>Subtotal:</Text>
              <Text style={comprobanteStyles.resumenValue}>
                S/ {subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={comprobanteStyles.resumenRow}>
              <Text style={comprobanteStyles.resumenLabel}>
                Descuento total:
              </Text>
              <Text style={[comprobanteStyles.resumenValue, { color: "#DC2626" }]}>
                - S/ {descuentoTotal.toFixed(2)}
              </Text>
            </View>
            <View style={comprobanteStyles.resumenRow}>
              <Text style={comprobanteStyles.resumenLabel}>Costo de envío:</Text>
              <Text style={comprobanteStyles.resumenValue}>
                S/ {costoEnvio.toFixed(2)}
              </Text>
            </View>

            <View style={comprobanteStyles.resumenRowTotalAPagar}>
              <Text style={comprobanteStyles.resumenTotalLabel}>
                TOTAL A PAGAR:
              </Text>
              <Text style={comprobanteStyles.resumenTotalValue}>
                S/ {totalPagar.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={comprobanteStyles.section}>
          <Text style={comprobanteStyles.sectionTitle}>
            INFORMACIÓN ADICIONAL
          </Text>

          <View style={comprobanteStyles.card}>
            <View style={comprobanteStyles.infoExtraRow}>
              <View style={comprobanteStyles.col}>
                <View style={comprobanteStyles.rowBlockInput}>
                  <Text style={comprobanteStyles.label}>
                    Asesor responsable:
                  </Text>
                  <Text style={comprobanteStyles.value}>{pedido.asesor}</Text>
                </View>
                <View style={comprobanteStyles.rowBlockInput}>
                  <Text style={comprobanteStyles.label}>Supervisor:</Text>
                  <Text style={comprobanteStyles.value}>Jorge Pérez</Text>
                </View>
              </View>

              <View style={comprobanteStyles.col}>
                <View style={comprobanteStyles.rowBlockInput}>
                  <Text style={[comprobanteStyles.label, { marginTop: 1 }]}>
                    Estado del pedido:
                    </Text>
                  <Text
                    style={[
                      comprobanteStyles.badge,
                      {
                        ...getPedidoBadgeStyle(pedido.estadoPedido),
                        marginLeft: 4,
                        paddingVertical: 4,
                        paddingHorizontal: 6,
                        lineHeight: 1,
                      }
                    ]}
                  >
                    {pedido.estadoPedido}
                  </Text>
                </View>

                <View style={comprobanteStyles.rowBlockInput}>
                  <Text style={[comprobanteStyles.label, { marginTop: 1 }]}>
                    Estado del pago:
                  </Text>
                  <Text
                    style={[
                      comprobanteStyles.badge,
                      {
                        ...getPagoBadgeStyle(pedido.estadoPago),
                        marginLeft: 4,
                        paddingVertical: 4,
                        paddingHorizontal: 6,
                        lineHeight: 1,
                      }
                    ]}
                  >
                    {pedido.estadoPago}
                  </Text>
                </View>

                <View style={comprobanteStyles.rowBlockInput}>
                  <Text style={[comprobanteStyles.label, { marginTop: 1 }]}>
                    Estado de facturación:
                  </Text>
                  <Text
                    style={[
                      comprobanteStyles.badge,
                      {
                        ...getFacturacionBadgeStyle(pedido.estadoFacturacion),
                        marginLeft: 4,
                        paddingVertical: 4,
                        paddingHorizontal: 6,
                        lineHeight: 1,
                      }
                    ]}
                  >
                    {pedido.estadoFacturacion}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={comprobanteStyles.section}>
          <Text style={comprobanteStyles.sectionTitle}>
            INSTRUCCIONES ESPECIALES
          </Text>

          <View style={comprobanteStyles.card}>
            <View style={comprobanteStyles.specialBox}>
              <Text style={{ fontSize: 9, color: "#4B5563" }}>
                Entregar preferiblemente en horario de mañana. Tocar el timbre dos
                veces. Si no hay nadie en casa, coordinar nueva fecha de entrega
                con el cliente.
              </Text>
            </View>
          </View>
        </View>

        <View style={comprobanteStyles.footer}>
          <Text style={{ fontSize: 12, color: "#4B5563", marginBottom: 4 }}>
            Gracias por su compra. Santa Natura – Productos naturales que cuidan tu salud.
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 24,
              marginBottom: 6,
              marginTop: 6,
            }}
          >
            <Text style={{ fontSize: 10, color: "#4B5563" }}>/SantaNaturaPeru</Text>
            <Text style={{ fontSize: 10, color: "#4B5563" }}>@santanaturaperu</Text>
            <Text style={{ fontSize: 10, color: "#4B5563" }}>www.santanatura.com.pe</Text>
          </View>

          <Text style={{ fontSize: 10, color: "#9CA3AF" }}>
            Este documento es generado automáticamente por el sistema de gestión de pedidos Santa Natura.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PedidoComprobantePDF;
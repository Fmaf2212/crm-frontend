import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// ================ PDF: COMPROBANTE DE PEDIDO =================

type PedidoComprobanteProps = {
  data: any; // Recibe TODO el detalle real del backend
};

const styles = StyleSheet.create({
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
  logoText: { fontSize: 9, color: "#10B981" },
  headerTitle: { fontSize: 14, fontWeight: 700, color: "#059669" },
  headerSub: { marginTop: 4, fontSize: 9, color: "#6B7280"},

  section: { marginTop: 14 },
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
    borderTopStyle: "solid",
    paddingTop: 8,
  },
  row: { flexDirection: "row" },
  col: { flex: 1 },
  rowBlockInput: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  label: { fontSize: 9, color: "#6B7280", marginTop: 4 },
  value: { marginLeft: 5, fontSize: 10, color: "#111827", marginTop: 1 },

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
  th: { paddingVertical: 6, paddingHorizontal: 6, fontSize: 9, fontWeight: 700 },
  td: { paddingVertical: 4, paddingHorizontal: 6, fontSize: 9 },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  infoExtraRow: {
    flexDirection: "row",
    marginTop: 6,
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
  resumenRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  resumenTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    borderTopColor: "#E5E7EB",
    borderTopWidth: 1,
    paddingTop: 4,
  },
  resumenLabel: { fontSize: 9, color: "#6B7280" },
  resumenValue: { fontSize: 9, color: "#111827" },
  resumenTotalLabel: { fontSize: 10, fontWeight: 700 },
  resumenTotalValue: { fontSize: 11, fontWeight: 700, color: "#059669" },

  footer: {
    marginTop: 20,
    textAlign: "center",
    borderTopColor: "#E5E7EB",
    borderTopWidth: 1,
    paddingTop: 12,
  },

  badge: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
});

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


const PedidoComprobantePDF: React.FC<PedidoComprobanteProps> = ({ data }) => {
  const cliente = data?.detalleClientePorPedido ?? {};
  const lead = data?.detalleLeadPorPedido ?? {};
  const delivery = data?.detalleDeliveryPorPedido ?? {};
  const producto = data?.detallePedido ?? {};

  const subtotal = Number(data.monto_Total_Regular ?? 0);
  const descuento = subtotal - Number(data.monto_Total_Promocional ?? 0);
  const costoEnvio = Number(data.precioDelivery ?? 0);
  const total = Number(data.monto_Total_Promocional ?? 0) + costoEnvio;

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ======================= HEADER ======================= */}
        <View style={styles.headerRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>LOGO</Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.headerTitle}>COMPROBANTE DE PEDIDO</Text>
            <Text style={styles.headerSub}>{data.id_Pedido ?? ""}</Text>
            <Text style={styles.headerSub}>{data.fecha_Registro_Pedido}</Text>
          </View>
        </View>

        {/* ======================= CLIENTE ======================= */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN DEL CLIENTE</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.col}>
                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Nombre:</Text>
                  <Text style={styles.value}>{cliente?.cliente}</Text>
                </View>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Documento:</Text>
                  <Text style={styles.value}>
                    {cliente?.tipo_Documento} {cliente?.numero_Documento}
                  </Text>
                </View>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Teléfono:</Text>
                  <Text style={styles.value}>{lead?.numero_De_Contacto}</Text>
                </View>
              </View>

              <View style={[styles.col, { paddingLeft: 12 }]}>
                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Tipo de entrega:</Text>
                  <Text style={styles.value}>
                    {delivery?.tipo_de_Entrega ?? "No registrado"}
                  </Text>
                </View>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Dirección:</Text>
                  <Text style={[styles.value, { maxWidth: 180 }]}>
                    {delivery?.direccion_Delivery ?? "Sin dirección registrada"}
                  </Text>
                </View>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Provincia:</Text>
                  <Text style={styles.value}>
                    {delivery?.provincia ?? "No registrado"}
                  </Text>
                </View>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Distrito:</Text>
                  <Text style={styles.value}>
                    {delivery?.distrito ?? "No registrado"}
                  </Text>
                </View>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Medio de envío:</Text>
                  <Text style={styles.value}>
                    {delivery?.medio_de_Envio ?? "Sin información"}
                  </Text>
                </View>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Fecha pactada:</Text>
                  <Text style={styles.value}>
                    {delivery?.fecha_Pactada_Delivery ?? "—"}
                  </Text>
                </View>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Horario pactado:</Text>
                  <Text style={styles.value}>
                    {delivery?.horario_Pactado ?? "—"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ======================= PRODUCTOS ======================= */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRODUCTOS DEL PEDIDO</Text>

          <View style={styles.card}>
            <View style={styles.table}>

              {/* HEADER */}
              <View style={styles.tableHeader}>
                <View style={{ flex: 2.5 }}>
                  <Text style={styles.th}>Producto</Text>
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={[styles.th, { textAlign: "right" }]}>
                    Precio Base
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.th, { textAlign: "center" }]}>
                    Descuento
                  </Text>
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={[styles.th, { textAlign: "right" }]}>
                    Precio con Desc.
                  </Text>
                </View>
                <View style={{ flex: 0.8 }}>
                  <Text style={[styles.th, { textAlign: "center" }]}>
                    Cant.
                  </Text>
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={[styles.th, { textAlign: "right" }]}>
                    Subtotal
                  </Text>
                </View>
              </View>

              {/* FILAS DE PRODUCTOS - ITERACIÓN DEL ARRAY */}
              {data?.detallePedido && Array.isArray(data.detallePedido) && data.detallePedido.length > 0 ? (
                data.detallePedido.map((producto: any, index: number) => (
                  <View key={index} style={styles.tableRow}>
                    <View style={{ flex: 2.5 }}>
                      <Text style={styles.td}>{producto.nombre_Producto}</Text>
                    </View>

                    <View style={{ flex: 1.2 }}>
                      <Text style={[styles.td, { textAlign: "right" }]}>
                        S/ {producto.precio_Regular?.toFixed(2) || "0.00"}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.td, { textAlign: "center", color: "#DC2626" }]}>
                        {producto.nombre_Descuento === "Sin Descuento" ? "-" : producto.nombre_Descuento}
                      </Text>
                    </View>

                    <View style={{ flex: 1.2 }}>
                      <Text style={[styles.td, { textAlign: "right" }]}>
                        S/ {producto.precio_Promocional?.toFixed(2) || "0.00"}
                      </Text>
                    </View>

                    <View style={{ flex: 0.8 }}>
                      <Text style={[styles.td, { textAlign: "center" }]}>
                        {producto.cantidad}
                      </Text>
                    </View>

                    <View style={{ flex: 1.2 }}>
                      <Text style={[styles.td, { textAlign: "right", fontWeight: "bold" }]}>
                        S/ {producto.subtotal_Promocional?.toFixed(2) || "0.00"}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.tableRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.td, { textAlign: "center", color: "#6B7280" }]}>
                      No hay productos en este pedido
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* ======================= RESUMEN ======================= */}
          <View style={styles.resumenCard}>
            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>Subtotal:</Text>
              <Text style={styles.resumenValue}>S/ {subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>Descuento total:</Text>
              <Text style={[styles.resumenValue, { color: "#DC2626" }]}>
                -S/ {descuento.toFixed(2)}
              </Text>
            </View>

            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>Costo de envío:</Text>
              <Text style={styles.resumenValue}>
                S/ {costoEnvio.toFixed(2)}
              </Text>
            </View>

            <View style={styles.resumenTotalRow}>
              <Text style={styles.resumenTotalLabel}>TOTAL A PAGAR:</Text>
              <Text style={styles.resumenTotalValue}>S/ {total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* ====================== INFORMACIÓN ADICIONAL ====================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN ADICIONAL</Text>

          <View style={styles.card}>

            {/* Creamos dos columnas verticales que NO interfieren entre sí */}
            <View style={[styles.row, { alignItems: "flex-start" }]}>

              {/* COLUMNA IZQUIERDA */}
              <View style={{ flex: 1, paddingRight: 12 }}>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Asesor responsable:</Text>
                </View>
                <Text style={[styles.value, { marginBottom: 6 }]}>
                  {lead?.asesor ?? "No registrado"}
                </Text>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Supervisor:</Text>
                </View>
                <Text style={styles.value}>
                  {lead?.supervisor ?? "No registrado"}
                </Text>

              </View>

              {/* COLUMNA DERECHA */}
              <View style={{ flex: 1, paddingLeft: 12 }}>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Estado del pedido:</Text>
                  <Text
                    style={[
                      styles.badge,
                      getPedidoBadgeStyle(data?.estatus_Operacion ?? ""),
                    ]}
                  >
                    {data?.estatus_Operacion ?? "—"}
                  </Text>
                </View>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Estado del pago:</Text>
                  <Text
                    style={[
                      styles.badge,
                      getPagoBadgeStyle(data?.estatus_Pago ?? ""),
                    ]}
                  >
                    {data?.estatus_Pago ?? "—"}
                  </Text>
                </View>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Estado de facturación:</Text>
                  <Text
                    style={[
                      styles.badge,
                      getFacturacionBadgeStyle(data?.estatus_Facturacion ?? ""),
                    ]}
                  >
                    {data?.estatus_Facturacion ?? "—"}
                  </Text>
                </View>

              </View>

            </View>
          </View>
        </View>

        {/* ====================== INSTRUCCIONES ESPECIALES ====================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INSTRUCCIONES ESPECIALES</Text>

          <View style={styles.card}>
            <View
              style={{
                borderWidth: 1,
                backgroundColor: "#F9FAFB",
                borderColor: "#E5E7EB",
                borderRadius: 6,
                padding: 8,
              }}
            >
              <Text style={{ fontSize: 9, color: "#4B5563" }}>
                {delivery?.indicaciones_De_Entrega?.trim()
                  ? delivery.indicaciones_De_Entrega
                  : "No hay indicaciones registradas para este pedido."}
              </Text>
            </View>
          </View>
        </View>


        {/* ====================== FOOTER ====================== */}
        <View style={styles.footer}>
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

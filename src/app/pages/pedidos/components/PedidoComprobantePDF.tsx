// ===========================================
//   PDF COMPACTADO • TOTALMENTE OPTIMIZADO
//   PARA KENNY + ZOILA (SIN ELIMINAR CAMPOS)
// ===========================================

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

type PedidoComprobanteProps = {
  data: any;
};

// ===============================
//   ESTILOS COMPACTADOS
// ===============================
const styles = StyleSheet.create({
  page: {
    paddingTop: 26,
    paddingBottom: 30,
    paddingHorizontal: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },

  // ---- HEADER ----
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  logoBox: { width: 140, height: 60 },
  headerTitle: { fontSize: 14, fontWeight: 700, color: "#059669" },
  headerNroPedido: { fontSize: 14, fontWeight: 700 },
  headerSub: { marginTop: 2, fontSize: 9, color: "#6B7280" },

  // ---- SECCIONES ----
  section: { marginTop: 12 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#059669",
    marginBottom: 4,
    textTransform: "uppercase",
  },

  card: {
    borderTopColor: "#E5E7EB",
    borderTopWidth: 1,
    paddingTop: 6,
  },

  row: { flexDirection: "row" },
  col: { flex: 1 },
  rowBlockInput: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  label: { fontSize: 8, color: "#6B7280" },
  value: { marginLeft: 4, fontSize: 9 },

  // ---- TABLA ----
  table: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  th: { paddingVertical: 2, paddingHorizontal: 4, fontSize: 8, fontWeight: 700 },
  td: { paddingVertical: 1, paddingHorizontal: 4, fontSize: 8 },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  // ---- TOTALES EN UNA FILA ----
  resumenFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 4,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    padding: 6,
    marginTop: 6,
  },
  resumenTexto: { fontSize: 8 },
  resumenTotal: { fontSize: 9, fontWeight: "bold", color: "#059669" },

  // ---- FOOTER ----
  footer: {
    marginTop: 18,
    textAlign: "center",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    paddingTop: 10,
  },
});

// ===============================
//  COMPONENTE PRINCIPAL
// ===============================

const PedidoComprobantePDF: React.FC<PedidoComprobanteProps> = ({ data }) => {
  const cliente = data?.detalleClientePorPedido ?? {};
  const lead = data?.detalleLeadPorPedido ?? {};
  const delivery = data?.detalleDeliveryPorPedido ?? {};

  const subtotal = Number(data.monto_Total_Regular ?? 0);
  const descuento = subtotal - Number(data.monto_Total_Promocional ?? 0);
  const envio = Number(data.precioDelivery ?? 0);
  const total = Number(data.monto_Total_Promocional ?? 0) + envio;
  const diferenciaPorPagar = Number(data.diferencia_Por_Pagar ?? 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ========================== HEADER ========================== */}
        <View style={styles.headerRow}>
          <View style={styles.logoBox}>
            <Image src="/assets/logoSN_PDF.png" />
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.headerTitle}>COMPROBANTE DE PEDIDO</Text>
            <Text style={styles.headerNroPedido}>
              Nro Pedido: {data.id_Pedido}
            </Text>
            <Text style={styles.headerSub}>{data.fecha_Registro_Pedido}</Text>
          </View>
        </View>

        {/* ========================== CLIENTE ========================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN DEL CLIENTE</Text>

          <View style={styles.card}>
            {/* Nombre - Documento */}
            <View style={styles.row}>
              <View style={styles.col}>
                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Nombre:</Text>
                  <Text style={styles.value}>{cliente?.cliente}</Text>
                </View>
              </View>

              <View style={[styles.col, { paddingLeft: 8 }]}>
                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Documento:</Text>
                  <Text style={styles.value}>
                    {cliente?.tipo_Documento} {cliente?.numero_Documento}
                  </Text>
                </View>
              </View>
            </View>

            {/* Dirección (con maxWidth para evitar overflow) */}
            <View style={styles.row}>
              <View style={styles.col}>
                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Dirección:</Text>
                  <View style={{ maxWidth: 260 }}>
                    <Text style={styles.value}>
                      {delivery?.direccion_Delivery?.trim() ||
                        "Sin dirección registrada"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Provincia - Distrito - Teléfonos */}
            <View style={styles.row}>
              <View style={styles.col}>
                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Provincia:</Text>
                  <Text style={styles.value}>{delivery?.provincia}</Text>
                </View>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Teléfono:</Text>
                  <Text style={styles.value}>
                    {data?.telefono_Alterno || "—"}
                  </Text>
                </View>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Tipo de entrega:</Text>
                  <Text style={styles.value}>{delivery?.tipo_de_Entrega}</Text>
                </View>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Horario pactado:</Text>
                  <Text style={styles.value}>{delivery?.horario_Pactado}</Text>
                </View>
              </View>

              <View style={[styles.col, { paddingLeft: 8 }]}>
                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Distrito:</Text>
                  <Text style={styles.value}>{delivery?.distrito}</Text>
                </View>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Teléfono Alternativo:</Text>
                  <Text style={styles.value}>
                    {data?.numero_De_Contacto?.trim() || "—"}
                  </Text>
                </View>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Medio de envío:</Text>
                  <Text style={styles.value}>{delivery?.medio_de_Envio}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ========================== PRODUCTOS ========================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRODUCTOS DEL PEDIDO</Text>

          <View style={styles.card}>
            <View style={styles.table}>
              {/* Header */}
              <View style={styles.tableHeader}>
                <View style={{ flex: 2.4 }}>
                  <Text style={styles.th}>Producto</Text>
                </View>
                <View style={{ flex: 1 }}>
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
                    Precio Desc.
                  </Text>
                </View>
                <View style={{ flex: 0.6 }}>
                  <Text style={[styles.th, { textAlign: "center" }]}>
                    Cant.
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.th, { textAlign: "right" }]}>
                    Subtotal
                  </Text>
                </View>
              </View>

              {/* Rows */}
              {data.detallePedido?.length > 0 ? (
                data.detallePedido.map((prod: any, i: number) => (
                  <View key={i} style={styles.tableRow}>
                    <View style={{ flex: 2.4 }}>
                      <Text style={styles.td}>{prod.nombre_Producto}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.td, { textAlign: "right" }]}>
                        S/ {prod.precio_Regular?.toFixed(2)}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.td, { textAlign: "center" }]}>
                        {prod.nombre_Descuento === "Sin Descuento"
                          ? "-"
                          : prod.nombre_Descuento}
                      </Text>
                    </View>

                    <View style={{ flex: 1.2 }}>
                      <Text style={[styles.td, { textAlign: "right" }]}>
                        S/ {prod.precio_Promocional?.toFixed(2)}
                      </Text>
                    </View>

                    <View style={{ flex: 0.6 }}>
                      <Text style={[styles.td, { textAlign: "center" }]}>
                        {prod.cantidad}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.td,
                          { textAlign: "right", fontWeight: "bold" },
                        ]}
                      >
                        S/ {prod.subtotal_Promocional?.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.tableRow}>
                  <Text style={[styles.td, { textAlign: "center", color: "#6B7280" }]}>
                    No hay productos
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ========================== RESUMEN (HORIZONTAL) ========================== */}
          <View style={styles.resumenFila}>
            <Text style={styles.resumenTexto}>
              Subtotal: S/ {subtotal.toFixed(2)}
            </Text>
            <Text style={styles.resumenTexto}>
              Desc: -S/ {descuento.toFixed(2)}
            </Text>
            <Text style={styles.resumenTexto}>Envío: S/ {envio.toFixed(2)}</Text>
            <Text style={styles.resumenTotal}>Total: S/ {total.toFixed(2)}</Text>
          </View>
        </View>

        {/* ========================== INFO ADICIONAL ========================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN ADICIONAL</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Asesor responsable:</Text>
                  <Text style={styles.value}>{lead?.asesor || "—"}</Text>
                </View>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Acuerdo de pago:</Text>
                  <Text style={styles.value}>
                    {data.acuerdo_De_Pago || "—"}
                  </Text>
                </View>
              </View>

              <View style={{ flex: 1, paddingLeft: 8 }}>
                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Estado del pago:</Text>
                  <Text style={[styles.value, { fontWeight: "bold" }]}>
                    {data.estatus_Pago || "—"}
                  </Text>
                </View>

                <View style={styles.rowBlockInput}>
                  <Text style={styles.label}>Diferencia por pagar:</Text>
                  <Text style={[styles.value, { fontWeight: "bold" }]}>
                    S/ {diferenciaPorPagar.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ========================== INDICACIONES ========================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INSTRUCCIONES ESPECIALES</Text>

          <View style={styles.card}>
            <View
              style={{
                borderWidth: 1,
                borderRadius: 4,
                borderColor: "#E5E7EB",
                backgroundColor: "#F9FAFB",
                padding: 6,
              }}
            >
              <Text style={{ fontSize: 8 }}>
                {delivery?.indicaciones_De_Entrega?.trim()
                  ? delivery.indicaciones_De_Entrega
                  : "No hay indicaciones registradas para este pedido."}
              </Text>
            </View>
          </View>
        </View>

        {/* ========================== FOOTER ========================== */}
        <View style={styles.footer}>
          <Text style={{ fontSize: 11, marginBottom: 3 }}>
            SANTA NATURA – VIVIR BIEN ESTÁ EN NUESTRAS RAÍCES
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 20,
              marginBottom: 4,
            }}
          >
            {/* WhatsApp */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                src="/assets/icoWsp.png"
                style={{ width: 12, height: 12, marginRight: 3 }}
              />
              <Text style={{ fontSize: 10, color: "#059669" }}>922879308</Text>
            </View>

            <Text style={{ fontSize: 10 }}>www.santanatura.com.pe</Text>
          </View>

          <Text style={{ fontSize: 8, color: "#6B7280" }}>
            Este documento es generado automáticamente por el sistema de gestión de pedidos Santa Natura.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PedidoComprobantePDF;

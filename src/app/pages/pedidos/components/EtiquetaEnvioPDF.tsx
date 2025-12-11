// ==============================================
// EtiquetaEnvioPDF.tsx - Versión Final SN
// Basado en diseño aprobado por Zoila
// Usa data real de GetDetallePedido
// ==============================================

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Conversión mm → pt
const MM_TO_PT = 2.83465;
const PAGE_WIDTH = 150 * MM_TO_PT; 
const PAGE_HEIGHT = 100 * MM_TO_PT; 

// Props esperadas con data real
export interface EtiquetaEnvioData {
  numeroOrden: string;
  nombre: string;
  dni: string;
  telefono: string;
  direccion: string;
  provincia: string;
  distrito: string;
  agencia: string;
  tipoEntrega: string;
}

export default function EtiquetaEnvioPDF({ data }: { data: EtiquetaEnvioData }) {
  return (
    <Document>
      <Page size={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }} style={styles.page}>
        <View style={styles.card}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerSquare} />
            <Text style={styles.headerTitle}>ETIQUETA DE ENVÍO</Text>

						<View style={styles.headerRightContainer}>
							<Text style={styles.headerRightLabel}>N° ORDEN</Text>
							<Text style={styles.headerRightValue}>{data.numeroOrden}</Text>
						</View>
					</View>

          {/* DATOS DEL DESTINATARIO */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>DATOS DEL DESTINATARIO</Text>
          </View>

          <View style={styles.section}>
            {/* Nombre - Provincia */}
            <View style={styles.twoCols}>
              <View style={styles.colLeft}>
                <Text style={styles.label}>NOMBRE:</Text>
                <Text style={styles.value}>{data.nombre}</Text>
              </View>

              <View style={styles.colRightRow}>
                <Text style={styles.label}>PROVINCIA:</Text>
                <Text style={styles.smallValueRow}>{data.provincia}</Text>
              </View>
            </View>

            {/* DNI - Distrito */}
            <View style={styles.twoCols}>
              <View style={styles.colLeftRow}>
                <Text style={styles.label}>DNI:</Text>
                <Text style={styles.smallValueRow}>{data.dni}</Text>
              </View>

              <View style={styles.colRightRow}>
                <Text style={styles.label}>DISTRITO:</Text>
                <Text style={styles.smallValueRow}>{data.distrito}</Text>
              </View>
            </View>

            {/* Teléfono - Agencia */}
            <View style={styles.twoCols}>
              <View style={styles.colLeftRow}>
                <Text style={styles.label}>TELÉFONO:</Text>
                <Text style={styles.smallValueRow}>{data.telefono || "-"}</Text>
              </View>

              <View style={styles.colRightRow}>
                <Text style={styles.label}>AGENCIA:</Text>
                <Text style={styles.smallValueRow}>{data.agencia}</Text>
              </View>
            </View>

            {/* Dirección */}
            <View style={styles.direccionBox}>
              <Text style={styles.label}>DIRECCIÓN:</Text>
              <Text style={styles.smallValue}>{data.direccion}</Text>
            </View>
          </View>

          {/* REFERENCIA DEL PEDIDO */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>REFERENCIA DEL PEDIDO</Text>
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.label}>Tipo de Entrega:</Text>
            <Text style={[styles.smallValueRow]}>
              {data.tipoEntrega}
            </Text>
          </View>

          {/* FOOTER */}
          <View style={styles.footerBrand}>
            <View>
              <Text style={styles.footerBrandTitle}>Santa Natura</Text>
              <Text style={styles.footerBrandSubtitle}>
                Vivir bien está en nuestras raíces
              </Text>
            </View>

            <Text style={styles.footerBrandWeb}>santanatura.com.pe</Text>
          </View>

        </View>
      </Page>
    </Document>
  );
}

// ==============================================
// ESTILOS
// ==============================================
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#F3F4F6",
    padding: 10,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#047857",
    padding: 8,
  },

  headerSquare: {
    width: 10,
    height: 10,
    backgroundColor: "white",
    borderRadius: 2,
    marginRight: 6,
  },

  headerTitle: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    flex: 1,
  },

  headerRightLabel: {
    fontSize: 6,
    color: "#D1FAE5",
  },

  headerValue: {
    fontSize: 9,
    color: "white",
    fontWeight: "bold",
  },

	headerRightContainer: {
		width: 60,           // ancho fijo para centrar contenido
		textAlign: "center", // centra horizontalmente ambos textos
	},

	headerRightValue: {
		fontSize: 10,
		fontWeight: "bold",
		color: "white",
		marginTop: 2,
		textAlign: "center",
	},

  sectionHeader: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 4,
    paddingHorizontal: 10,
  },

  sectionHeaderText: {
    color: "#047857",
    fontSize: 7,
    fontWeight: "bold",
  },

  section: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  sectionRow: {
		flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  twoCols: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  colLeft: { flex: 1 },
  colLeftRow: { flex: 1, flexDirection: "row", },
  colRight: { flex: 1, textAlign: "left" },
  colRightRow: { flex: 1, textAlign: "left", flexDirection: "row", },

  label: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#6B7280",
  },

  value: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 2,
  },

  smallValue: {
    fontSize: 7,
    color: "#111827",
		marginTop: 2,
  },

  smallValueRow: {
    fontSize: 7,
    color: "#111827",
		marginLeft: 4,
  },

  direccionBox: {
    marginTop: 4,
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#FACC15",
    backgroundColor: "#FEF9C3",
  },

  footerBrand: {
    marginTop: 10,
    padding: 6,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerBrandTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#047857",
  },

  footerBrandSubtitle: {
    fontSize: 7,
    color: "#6B7280",
  },

  footerBrandWeb: {
    fontSize: 8,
    color: "#6B7280",
  },
});

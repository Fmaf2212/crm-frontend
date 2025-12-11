import { Document, Page } from "@react-pdf/renderer";
import PedidoComprobanteContent from "./PedidoComprobanteContent";
// << Este es tu contenido sin <Document> ni <Page>

type PedidoComprobanteMultiplePDFProps = {
  pedidos: any[];
};

const PedidoComprobanteMultiplePDF: React.FC<PedidoComprobanteMultiplePDFProps> = ({ pedidos }) => {
  return (
    <Document>
      {pedidos.map((pedido, i) => (
        <Page key={i} size="A4">
          <PedidoComprobanteContent data={pedido} />
        </Page>
      ))}
    </Document>
  );
};

export default PedidoComprobanteMultiplePDF;

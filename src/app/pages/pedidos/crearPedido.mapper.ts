export interface PedidoUI {
  id_Pedido?: number;

  lead: {
    id_Lead: number;
    numero_De_Contacto: string;
    id_Campana: number;
    id_Medio_Registro_Lead: number;
  };

  cliente: {
    id_Tipo_Documento: number;
    numero_Documento: string;
    cliente: string;
    mail: string;
    id_Tipo_Comprobante: number;
  };

  delivery: {
    id_Medio_de_Envio: number;
    id_Tipo_de_Entrega: number;
    id_Departamento: number;
    id_Provincia: number;
    id_Distrito: number;
    direccion_Delivery: string;
    referencia: string;
    indicaciones_De_Entrega: string;
    link_Geolocalizacion: string;
    receptor_Autorizado: boolean;
    nombre_Receptor_Autorizado: string;
    fecha_Pactada_Delivery: string;
    id_Horario_Pactado: number;
  };

  detalle: any[];

  telefono_Alterno: string;
  id_Acuerdo_de_Pago: number;
}

export const mapEdicionToPedidoUI = (data: any): PedidoUI => ({
  id_Pedido: data.id_Pedido,

  lead: data.leadParaEdicion ?? {},

  cliente: data.clienteParaEdicion ?? {},

  delivery: data.deliveryParaEdicion ?? {},

  detalle: data.detallePedidoParaEdicion ?? [],

  telefono_Alterno: data.telefono_Alterno ?? "",
  id_Acuerdo_de_Pago: data.id_Acuerdo_de_Pago,
});


export const mapRecompraToPedidoUI = (data: any): PedidoUI => ({
  lead: data.leadParaRecompra ?? {},

  cliente: data.clienteParaRecompra ?? {},

  delivery: data.deliveryParaRecompra ?? {},

  detalle: data.detallePedidoParaRecompras ?? [],

  telefono_Alterno: data.telefono_Alterno ?? "",
  id_Acuerdo_de_Pago: data.id_Acuerdo_de_Pago,
});

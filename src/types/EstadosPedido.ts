export type EstadoOperacion =
  | "Ingresada"
  | "Incidencia"
  | "Confirmada"
  | "Cancelada"
  | "Listo Despacho"
  | "En Ruta"
  | "Cancelada Retornar"
  | "En Retorno"
  | "Retornada"
  | "Reprogramada"
  | "Entregada"
  | "Liquidada";

export type EstadoFacturacion =
  | "Pendiente"
  | "Facturado"
  | "Re-Facturado"
  | "Por Anular"
  | "Anulado";

export type EstadoPago =
  | "Pendiente"
  | "Adelanto"
  | "Pagado"
  | "Reembolsado"
  | "Reembolsado Parcial";
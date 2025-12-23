export interface EstatusEspecificoLeadItem {
  id_Estatus_Especifico_Lead: number;
  estado_Estatus_Especifico_Lead: string;
}

export interface EstatusEspecificoLeadResponse {
  data: EstatusEspecificoLeadItem[];
  error: boolean;
  message: string;
}

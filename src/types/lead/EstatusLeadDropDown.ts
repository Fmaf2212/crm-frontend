export interface EstatusLeadDropDownItem {
  id_Estatus_Lead: number;
  estatus_Lead: string;
}

export interface EstatusLeadDropDownResponse {
  data: EstatusLeadDropDownItem[];
  error: boolean;
  message: string;
}

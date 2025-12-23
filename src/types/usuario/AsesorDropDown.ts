export interface AsesorDropDownItem {
  id_Usuario: number;
  asesor: string;
}

export interface AsesorDropDownResponse {
  data: AsesorDropDownItem[];
  error: boolean;
  message: string;
}
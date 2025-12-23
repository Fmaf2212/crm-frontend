export interface CampanaDropDownItem {
  id_Campana: number;
  campana: string;
}

export interface CampanaDropDownResponse {
  data: CampanaDropDownItem[];
  error: boolean;
  message: string;
}

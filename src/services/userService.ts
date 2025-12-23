import { API_BASE_URL, API_TOKEN } from "@/config/apiConfig";
import type { AsesorDropDownResponse } from "@/types/usuario/AsesorDropDown";

export const UserService = {
  login: async (body: { userName: string; password: string }) => {
    const url = `${API_BASE_URL}/Usuario/Login`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    return res.json();
  },

  getAsesorDropDown: async ():Promise<AsesorDropDownResponse> => {
    const url = `${API_BASE_URL}/Usuario/GetAsesorDropDown`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        Accept: "application/json",
      },
    });

    return res.json();
  },
};

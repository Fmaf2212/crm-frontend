import { API_BASE_URL, API_TOKEN } from "@/config/apiConfig";

export const LocationService = {
  getDepartamentos: async () => {
    const url = `${API_BASE_URL}/Location/GetDepartamentoDropDown`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return res.json();
  },

  getProvincias: async (idDepartamento: number) => {
    const url = `${API_BASE_URL}/Location/GetProvinciaDropDown`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idDepartamento }),
    });

    return res.json();
  },

  getDistritos: async (idProvincia: number) => {
    const url = `${API_BASE_URL}/Location/GetDistritoDropDown`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idProvincia }),
    });

    return res.json();
  },
};

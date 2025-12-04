import { API_BASE_URL, API_TOKEN } from "@/config/apiConfig";

export const ClienteService = {
  getClientePorDocumento: async (numeroDocumento: string) => {
    const url = `${API_BASE_URL}/Cliente/GetClientePorDocumento`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ numero_Documento: numeroDocumento }),
    });

    return res.json();
  },
};

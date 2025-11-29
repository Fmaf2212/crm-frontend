import { API_BASE_URL, API_TOKEN } from "@/config/apiConfig";

export const ProductService = {
  getEstadoProducto: async () => {
    const url = `${API_BASE_URL}/EstadoProducto/GetEstado_ProductoForDropDown`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return res.json();
  },

  getLineaProducto: async () => {
    const url = `${API_BASE_URL}/LineaProducto/GetLinea_ProductoForDropDown`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return res.json();
  },

  getTipoProducto: async () => {
    const url = `${API_BASE_URL}/TipoProducto/GetTipo_ProductoForDropDown`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return res.json();
  },

  insertProducto: async (body: any) => {
    const url = `${API_BASE_URL}/Producto/InsertProducto`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return res.json();
  },
};

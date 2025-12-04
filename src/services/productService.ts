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

  uploadImage: async (file: File, deleteImage: string = "") => {
    const url = `${API_BASE_URL}/Producto/GuardarImagenProducto`;

    const formData = new FormData();
    formData.append("imageFile", file);
    formData.append("deleteImage", deleteImage);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: formData,
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

  getProductoDropDown: async () => {
    const url = `${API_BASE_URL}/Producto/GetProductoDropDown`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return res.json();
  },

  getProductoDetalleParaPaquete: async (idProducto: number) => {
    const url = `${API_BASE_URL}/Producto/GetProductoDetalleParaPaquete`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idProducto }),
    });

    return res.json();
  },

  getProductosAdmin: async (body: any) => {
    const url = `${API_BASE_URL}/Producto/GetProductForAdminPagination`;

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

  getProductForEdit: async (body: any) => {
    const url = `${API_BASE_URL}/Producto/GetProductForEdit`;

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

  updateProducto: async (body: any) => {
    const url = `${API_BASE_URL}/Producto/UpdateProducto`;

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

  deleteProducto: async (idProducto: number) => {
    const url = `${API_BASE_URL}/Producto/DeleteProducto`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idProducto }),
    });

    return res.json();
  },
};

import { API_BASE_URL, API_TOKEN } from "@/config/apiConfig";

export const PedidoService = {
  insertPedido: async (body: any) => {
    const url = `${API_BASE_URL}/Pedido/InsertPedido`;

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

  getSeguimientoPedido: async (body: any) => {
    const url = `${API_BASE_URL}/Pedido/GetSeguimientoPedido`;

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

  getDetallePedido: async (id_Pedido: number) => {
    const url = `${API_BASE_URL}/Pedido/GetDetallePedido`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_Pedido }),
    });

    return res.json();
  },

  // updateEstadosPedido: async (body: any) => {
  //   const url = `${API_BASE_URL}/HistoricoPedidoEstado/UpdateEstadosPedido`;

  //   const res = await fetch(url, {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${API_TOKEN}`,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(body),
  //   });

  //   return res.json();
  // },
  insertPedidoEstatusOperacion: async (body: any) => {
    const url = `${API_BASE_URL}/HistoricoPedidoEstado/InsertHistoricoPedidoEstatusOperacion`;

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
  insertPedidoEstatusPago: async (body: any) => {
    const url = `${API_BASE_URL}/HistoricoPedidoEstado/InsertPedidoEstatusPago`;

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
  getHistoricoPago: async (id_Pedido: number) => {
    const url = `${API_BASE_URL}/HistoricoPedidoEstado/GetHistoricoPedidoEstatusPago`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_Pedido }),
    });

    return res.json();
  },
  insertPedidoEstatusFacturacion: async (body: any) => {
    const url = `${API_BASE_URL}/HistoricoPedidoEstado/InsertHistoricoPedidoEstatusFacturacion`;

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

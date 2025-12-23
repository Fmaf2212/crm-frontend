import { API_BASE_URL, API_TOKEN } from "@/config/apiConfig";
import type { CampanaDropDownResponse } from "@/types/campana/CampanaDropDown";
import type { EstatusEspecificoLeadResponse } from "@/types/lead/EstatusEspecificoLead";
import type { EstatusLeadDropDownResponse } from "@/types/lead/EstatusLeadDropDown";

export const LeadService = {
  getCampanaForDropDown: async (): Promise<CampanaDropDownResponse> => {
    const url = `${API_BASE_URL}/Campana/GetCampanaForDropDown`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return res.json();
  },

  getMedioRegistroLeadForDropDown: async () => {
    const url = `${API_BASE_URL}/MedioRegistroLead/GetMedioRegistroLeadForDropDown`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return res.json();
  },

  getLeadGeneralPagination: async (body: {
    number: number;
    size: number;
    numeroDeContacto: string;
    fechaInicio: string;
    fechaFin: string;
    idCampana: number;
  }) => {
    const url = `${API_BASE_URL}/Lead/GetLeadGeneralPagination`;

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

  insertLead: async (body: {
    numeroDeContacto: string;
    idMedioRegistroLead: number;
    idCampana: number;
    idAsesorActual: number;
    idUsuarioRegistroLead: number;
  }) => {
    const url = `${API_BASE_URL}/Lead/InsertLead`;

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

  getSeguimientoLead: async (body: any) => {
    const url = `${API_BASE_URL}/Lead/GetSeguimientoLead`;

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

  updateHistoricoEstadoLead: async (body: any) => {
    const url = `${API_BASE_URL}/Lead/UpdateHistoricoEstadoLead`;

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

  transferirLeads: async (body: any) => {
    const url = `${API_BASE_URL}/Lead/UpdateHistoricoAsesorLead`;

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

  getDetalleActualizarEstadoLead: async (body: { id_Lead: number }) => {
    const url = `${API_BASE_URL}/Lead/GetDetalleActualizarEstadoLead`;

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

  getEstatusLeadForDropDown: async (): Promise<EstatusLeadDropDownResponse> => {
    const url = `${API_BASE_URL}/EstatusLead/GetEstatusLeadForDropDown`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return res.json();
  },

  getEstatusEspecificoLeadForDropDown: async (): Promise<EstatusEspecificoLeadResponse>=> {
    const url = `${API_BASE_URL}/EstatusEspecificoLead/GetEstatusEspecificoLead`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return res.json();
  },
};
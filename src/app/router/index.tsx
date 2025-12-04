import { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "../layout/AppLayout";
import ComprobantePreview from "../pages/pedidos/preview/ComprobantePreview";
import LoginPage from "../login/page";
import { PrivateRoute } from "./PrivateRoute";

// Lead
const CrearLead = lazy(() => import("../pages/lead/CrearLead"));
const SeguimientoLead = lazy(() => import("../pages/lead/SeguimientoLead"));

// Pedidos
const CrearPedido = lazy(() => import("../pages/pedidos/CrearPedido"));
const SeguimientoPedido = lazy(() => import("../pages/pedidos/SeguimientoPedido"));
const ValidacionesPedido = lazy(() => import("../pages/pedidos/ValidacionesPedido"));

// Productos
const CrearProducto = lazy(() => import("../pages/productos/CrearProducto"));

// Sistema / Configuración
// const Usuarios = lazy(() => import("../pages/sistema/Usuarios"));
// const AsignarRoles = lazy(() => import("../pages/sistema/AsignarRoles"));
// const Roles = lazy(() => import("../pages/sistema/Roles"));
// const TipoDocumento = lazy(() => import("../pages/sistema/TipoDocumento"));
// const AgregarCanal = lazy(() => import("../pages/sistema/AgregarCanal"));
// const HorariosEnvio = lazy(() => import("../pages/sistema/HorariosEnvio"));
// const AgregarBanco = lazy(() => import("../pages/sistema/AgregarBanco"));
// const MetodoPago = lazy(() => import("../pages/sistema/MetodoPago"));
// const MedioEnvioDelivery = lazy(() => import("../pages/sistema/MedioEnvioDelivery"));
// const MedioRegistroLead = lazy(() => import("../pages/sistema/MedioRegistroLead"));
// const EstadoInteraccionLead = lazy(() => import("../pages/sistema/EstadoInteraccionLead"));
// const EstadoPedido = lazy(() => import("../pages/sistema/EstadoPedido"));
// const EstadoDelivery = lazy(() => import("../pages/sistema/EstadoDelivery"));
// const EstadoPago = lazy(() => import("../pages/sistema/EstadoPago"));
// const EstadoFacturacion = lazy(() => import("../pages/sistema/EstadoFacturacion"));

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Redirige la ruta raíz a /lead/crear */}
      <Route path="/" element={<Navigate to="/lead/crear" replace />} />

      {/* Lead */}
      <Route path="/lead/crear" element={
        <PrivateRoute>
          <CrearLead />
        </PrivateRoute>} />
      <Route path="/lead/seguimiento" element={
        <PrivateRoute><SeguimientoLead /></PrivateRoute>} />

      {/* Pedidos */}
      <Route path="/pedidos/crear" element={
        <PrivateRoute><CrearPedido /></PrivateRoute>} />
      <Route path="/pedidos/seguimiento" element={<PrivateRoute><SeguimientoPedido /></PrivateRoute>} />
      <Route path="/pedidos/preview" element={<PrivateRoute><ComprobantePreview /></PrivateRoute>} />
      <Route path="/pedidos/validaciones" element={<PrivateRoute><ValidacionesPedido /></PrivateRoute>} />

      {/* Productos */}
      <Route path="/productos/crear" element={<PrivateRoute><CrearProducto /></PrivateRoute>} />

      {/* Sistema */}
      {/* <Route path="/sistema/usuarios" element={<Usuarios />} />
        <Route path="/sistema/asignar-roles" element={<AsignarRoles />} />
        <Route path="/sistema/roles" element={<Roles />} />
        <Route path="/sistema/tipo-documento" element={<TipoDocumento />} />
        <Route path="/sistema/agregar-canal" element={<AgregarCanal />} />
        <Route path="/sistema/horarios-envio" element={<HorariosEnvio />} />
        <Route path="/sistema/agregar-banco" element={<AgregarBanco />} />
        <Route path="/sistema/metodo-pago" element={<MetodoPago />} />
        <Route path="/sistema/medio-envio-delivery" element={<MedioEnvioDelivery />} />
        <Route path="/sistema/medio-registro-lead" element={<MedioRegistroLead />} />
        <Route path="/sistema/estado-interaccion-lead" element={<EstadoInteraccionLead />} />
        <Route path="/sistema/estado-pedido" element={<EstadoPedido />} />
        <Route path="/sistema/estado-delivery" element={<EstadoDelivery />} />
        <Route path="/sistema/estado-pago" element={<EstadoPago />} />
        <Route path="/sistema/estado-facturacion" element={<EstadoFacturacion />} /> */}

    </Routes>
  );
}

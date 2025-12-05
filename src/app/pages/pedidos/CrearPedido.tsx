import { AppLayout } from "@/app/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/sectionTitle";
import { ShoppingCart, Trash2, Truck, PlusCircle, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import ReactSelect from "react-select";
import { API_BASE_URL, API_TOKEN } from "@/config/apiConfig";
import { showToast } from "@/components/ui/toastManager";
import { PedidoService } from "@/services/pedidoService";
import { ConfirmModal } from "@/components/ui/confirmModal";
import { useLocation, useNavigate } from "react-router-dom";

type Option = {
  value: number | string;
  label: string;
};

type DiscountOption = {
  value: number;
  label: string;
  percent: number;
};

type ItemPaquete = {
  id_Producto: number;
  nombre_Producto: string;
  precio_Regular: number;
  precio_Interno: number;
  tipo_Agrupacion: boolean;
};

type ProductDetail = {
  id_Producto: number;
  precio_Regular: number;
  precio_Interno: number;
  nombre_Producto: string;
  tipo_Agrupacion: boolean;
  detalleProductoPaqueteParaPedidos: ItemPaquete[] | null;
};

type CartItem = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  priceRegularUnit: number;
  pricePromotionalUnit: number;
  discountPercent: number;
  discountId: number | null;
  subtotalRegular: number;
  subtotalPromotional: number;
  type: "product" | "package";
  items?: {
    id: number;
    name: string;
    qtyInternal: number;
    priceRegularUnit: number;
    pricePromotionalUnit: number;
  }[];
  showDetails?: boolean;
};

const reactSelectStyles = {
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: "white",
    borderColor: state.isFocused ? "#16a34a" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #16a34a" : "none",
    borderRadius: "0.75rem",
    minHeight: "42px",
    height: "42px",
    paddingLeft: "4px",
    "&:hover": {
      borderColor: state.isFocused ? "#16a34a" : "#9ca3af",
    },
    fontSize: "14px",
  }),
  valueContainer: (base: any) => ({
    ...base,
    height: "42px",
    display: "flex",
    alignItems: "center",
    paddingLeft: "2px",
  }),
  placeholder: (base: any) => ({
    ...base,
    fontSize: "14px",
    color: "#6b7280",
  }),
  singleValue: (base: any) => ({
    ...base,
    fontSize: "14px",
    color: "#374151",
  }),
  menu: (base: any) => ({
    ...base,
    marginTop: 4,
    borderRadius: 6,
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)",
  }),
  menuList: (base: any) => ({
    ...base,
    padding: 0,
  }),
  option: (base: any, state: any) => ({
    ...base,
    fontSize: "14px",
    padding: "8px 12px",
    backgroundColor: state.isSelected
      ? "#f3f4f6"
      : state.isFocused
      ? "#f9fafb"
      : "white",
    color: "#111827",
    cursor: "pointer",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base: any, state: any) => ({
    ...base,
    color: state.isFocused ? "#16a34a" : "#6b7280",
    paddingRight: "6px",
    "&:hover": { color: "#16a34a" },
  }),
};

const tipoDocumentoOptions: Option[] = [
  { value: 1, label: "DNI" },
  { value: 2, label: "RUC" },
  { value: 3, label: "CE" },
  { value: 4, label: "PASS" },
];

const tipoComprobanteOptions: Option[] = [
  { value: 1, label: "Boleta" },
  { value: 2, label: "Factura" },
];

const nivelDescuentoOptions: DiscountOption[] = [
  { value: 1, label: "Sin Descuento", percent: 0.0 },
  // { value: 2, label: "5%", percent: 0.05 },
  { value: 3, label: "10%", percent: 0.1 },
  { value: 4, label: "15%", percent: 0.15 },
  { value: 5, label: "20%", percent: 0.2 },
  { value: 6, label: "25%", percent: 0.25 },
  { value: 7, label: "30%", percent: 0.3 },
  // { value: 8, label: "35%", percent: 0.35 },
  // { value: 9, label: "40%", percent: 0.4 },
];

const acuerdoPagoOptions: Option[] = [
  { value: 1, label: "Contra entrega" },
  { value: 2, label: "Pagado" },
  { value: 3, label: "Pago parcial" },
];

const tipoEntregaOptions: Option[] = [
  { value: 1, label: "Lima Next Day" },
  { value: 2, label: "Lima Same Day" },
  { value: 3, label: "Provincias Pago en Destino" },
  { value: 4, label: "Provincias Pago Completo" },
  { value: 5, label: "Recojo en Tienda" },
  { value: 6, label: "Entregas Marketplace" },
];

const medioEnvioOptions: Option[] = [
  { value: 1, label: "Courier Propio" },
  { value: 2, label: "Indriver" },
  { value: 3, label: "Shalom" },
  { value: 4, label: "Olva" },
  { value: 5, label: "Marvisur" },
  { value: 6, label: "Flores" },
  { value: 7, label: "Marvisur" },
  { value: 8, label: "Cavassa" },
  { value: 9, label: "GM Internacional" },
  { value: 10, label: "Emtrafesa" },
];

const horarioPactadoOptions: Option[] = [
  { value: 1, label: "9am a 1pm" },
  { value: 2, label: "11am a 5pm" },
  { value: 3, label: "11am a 3pm" },
  { value: 4, label: "1pm a 6pm" },
];

const idLead = Number(localStorage.getItem("sn_idLead")) || 0;
const numeroContactoLead = localStorage.getItem("sn_numeroContacto") || "";

const CrearPedido: React.FC = () => {
  const location = useLocation();

  const usuarioLS = localStorage.getItem("sn_user");
  const idUsuario = usuarioLS ? JSON.parse(usuarioLS).id_Usuario : 0;

  const [telefono, setTelefono] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");
  const [telefonoAlternativo, setTelefonoAlternativo] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState<Option | null>(null);
  const [tipoComprobante, setTipoComprobante] = useState<Option | null>(null);
  const [acuerdoPago, setAcuerdoPago] = useState<Option | null>(null);

  const [departamentos, setDepartamentos] = useState<Option[]>([]);
  const [provincias, setProvincias] = useState<Option[]>([]);
  const [distritos, setDistritos] = useState<Option[]>([]);
  const [departamentoSel, setDepartamentoSel] = useState<Option | null>(null);
  const [provinciaSel, setProvinciaSel] = useState<Option | null>(null);
  const [distritoSel, setDistritoSel] = useState<Option | null>(null);

  const [direccion, setDireccion] = useState("");
  const [linkUbicacion, setLinkUbicacion] = useState("");
  const [referencia, setReferencia] = useState("");
  const [indicacionesEntrega, setIndicacionesEntrega] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState<Option | null>(null);
  const [medioEnvio, setMedioEnvio] = useState<Option | null>(null);
  const [fechaPactada, setFechaPactada] = useState("");
  const [horarioPactado, setHorarioPactado] = useState<Option | null>(null);

  const [authorizedReceiver, setAuthorizedReceiver] = useState<Option | null>(null);
  const [receiverName, setReceiverName] = useState("");

  const [productos, setProductos] = useState<Option[]>([]);
  const [selectedProductOption, setSelectedProductOption] = useState<Option | null>(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState<ProductDetail | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [discountLevel, setDiscountLevel] = useState<DiscountOption>(nivelDescuentoOptions[0]);
  const [discountDisabled, setDiscountDisabled] = useState(false);

  const [clienteMail, setClienteMail] = useState("");

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: () => { },
  });

  const navigate = useNavigate();
  const [leadIdUI, setLeadIdUI] = useState(location.state?.idLead || null);
  const [telefonoLeadUI, setTelefonoLeadUI] = useState(location.state?.numeroContacto || null);

  useEffect(() => {
    if (location.state) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, []);

  useEffect(() => {
    const fetchDepartamentos = async () => {
      const url = `${API_BASE_URL}/Location/GetDepartamentoDropDown`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      if (json?.data) {
        const opts = json.data.map((d: any) => ({
          value: d.idDepartamento,
          label: d.descripcion,
        }));
        setDepartamentos(opts);
      }
    };

    const fetchProductos = async () => {
      const url = `${API_BASE_URL}/Producto/GetProductoDropDown`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      if (json?.data) {
        const opts = json.data.map((p: any) => ({
          value: p.id_Producto,
          label: p.nombre_Producto,
        }));
        setProductos(opts);
      }
    };

    fetchDepartamentos();
    fetchProductos();
  }, []);

  const handleDepartamentoChange = async (value: any) => {
    setDepartamentoSel(value);
    setProvinciaSel(null);
    setDistritoSel(null);
    setProvincias([]);
    setDistritos([]);

    if (!value) return;

    const url = `${API_BASE_URL}/Location/GetProvinciaDropDown`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idDepartamento: value.value }),
    });
    const json = await res.json();

    if (json?.data) {
      const opts = json.data.map((p: any) => ({
        value: p.idProvincia,
        label: p.descripcion,
      }));
      setProvincias(opts);
    }
  };

  const handleProvinciaChange = async (value: any) => {
    setProvinciaSel(value);
    setDistritoSel(null);
    setDistritos([]);

    if (!value) return;

    const url = `${API_BASE_URL}/Location/GetDistritoDropDown`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idProvincia: value.value }),
    });
    const json = await res.json();

    if (json?.data) {
      const opts = json.data.map((d: any) => ({
        value: d.idDistrito,
        label: d.descripcion,
      }));
      setDistritos(opts);
    }
  };

  const handleDistritoChange = (value: any) => {
    setDistritoSel(value);
  };

  const handleBuscarCliente = async () => {
    if (!numeroDocumento.trim()) {
      alert("Ingrese un número de documento");
      return;
    }

    const url = `${API_BASE_URL}/Cliente/GetClientePorDocumento`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ numero_Documento: numeroDocumento }),
    });

    const json = await res.json();
    if (!json || json.error || !json.data) {
      alert("Cliente no encontrado");
      setClienteNombre("");
      setTipoDocumento(null);
      setTelefonoAlternativo("");
      return;
    }

    const data = json.data;
    setClienteNombre(data.cliente || "");
    const tipoDoc = tipoDocumentoOptions.find((x) => x.value === data.id_Tipo_Documento) || null;
    setTipoDocumento(tipoDoc);
    setTelefonoAlternativo(data.telefono_Alternativo || "");
    setClienteMail(data.mail || "");
  };

  const handleProductoChange = async (option: any) => {
    setSelectedProductOption(option);
    setSelectedProductDetail(null);
    setQuantity(1);
    setDiscountLevel(nivelDescuentoOptions[0]);
    setDiscountDisabled(false);

    if (!option) return;

    const url = `${API_BASE_URL}/Producto/GetDetalleProductoParaPedido`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idProducto: option.value }),
    });

    const json = await res.json();
    if (json?.data) {
      const detalle: ProductDetail = json.data;
      setSelectedProductDetail(detalle);

      if (detalle.tipo_Agrupacion) {
        setDiscountLevel(nivelDescuentoOptions[0]);
        setDiscountDisabled(true);
      }
    }
  };

  const handleAddToCart = () => {
    if (!selectedProductOption || !selectedProductDetail) return;

    const detalle = selectedProductDetail;
    const isPackage = detalle.tipo_Agrupacion;

    const discountData = isPackage ? nivelDescuentoOptions[0] : discountLevel;
    const discountPercent = discountData.percent;
    const discountId = isPackage ? nivelDescuentoOptions[0].value : discountData.value;

    const priceRegularUnit = detalle.precio_Regular;
    const pricePromotionalUnit = isPackage
      ? detalle.precio_Interno
      : detalle.precio_Regular * (1 - discountPercent);

    const subtotalRegular = priceRegularUnit * quantity;
    const subtotalPromotional = pricePromotionalUnit * quantity;

    let internalItems:
      | {
          id: number;
          name: string;
          qtyInternal: number;
          priceRegularUnit: number;
          pricePromotionalUnit: number;
        }[]
      | undefined = undefined;

    if (isPackage && detalle.detalleProductoPaqueteParaPedidos) {
      internalItems = detalle.detalleProductoPaqueteParaPedidos.map((i) => ({
        id: i.id_Producto,
        name: i.nombre_Producto,
        qtyInternal: 1,
        priceRegularUnit: i.precio_Regular,
        pricePromotionalUnit: i.precio_Interno,
      }));
    }

    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.productId === detalle.id_Producto && item.discountId === discountId
      );

      if (!existing) {
        return [
          ...prev,
          {
            id: Date.now(),
            productId: detalle.id_Producto,
            productName: detalle.nombre_Producto,
            quantity,
            priceRegularUnit,
            pricePromotionalUnit,
            discountPercent,
            discountId,
            subtotalRegular,
            subtotalPromotional,
            type: isPackage ? "package" : "product",
            items: internalItems,
            showDetails: false,
          },
        ];
      }

      const newQuantity = existing.quantity + quantity;

      return prev.map((item) =>
        item.productId === detalle.id_Producto && item.discountId === discountId
          ? {
              ...item,
              quantity: newQuantity,
              subtotalRegular: priceRegularUnit * newQuantity,
              subtotalPromotional: pricePromotionalUnit * newQuantity,
            }
          : item
      );
    });

    setSelectedProductOption(null);
    setSelectedProductDetail(null);
    setQuantity(1);
    setDiscountLevel(nivelDescuentoOptions[0]);
    setDiscountDisabled(false);
  };

  const togglePackageDetails = (id: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, showDetails: !item.showDetails } : item))
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalRegular = cartItems.reduce((sum, item) => sum + item.subtotalRegular, 0);
  const totalPromotional = cartItems.reduce((sum, item) => sum + item.subtotalPromotional, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    if (!tipoDocumento) {
      showToast("Debe seleccionar el tipo de documento", "info");
      return;
    }

    if (!numeroDocumento.trim()) {
      showToast("Debe ingresar el número de documento", "info");
      return;
    }

    if (!clienteNombre.trim()) {
      showToast("Debe ingresar el nombre del cliente", "info");
      return;
    }

    if (!tipoComprobante) {
      showToast("Debe seleccionar el tipo de comprobante", "info");
      return;
    }

    if (!acuerdoPago) {
      showToast("Debe seleccionar el acuerdo de pago", "info");
      return;
    }

    if (cartItems.length === 0) {
      showToast("Debe agregar al menos un producto al carrito", "info");
      return;
    }

    if (!tipoEntrega) {
      showToast("Debe seleccionar el tipo de entrega", "info");
      return;
    }

    if (!departamentoSel) {
      showToast("Debe seleccionar un departamento", "info");
      return;
    }

    if (!provinciaSel) {
      showToast("Debe seleccionar una provincia", "info");
      return;
    }

    if (!distritoSel) {
      showToast("Debe seleccionar un distrito", "info");
      return;
    }

    if (!direccion.trim()) {
      showToast("Debe ingresar la dirección", "info");
      return;
    }

    if (!medioEnvio) {
      showToast("Debe seleccionar el medio de envío", "info");
      return;
    }

    if (!fechaPactada) {
      showToast("Debe seleccionar la fecha pactada", "info");
      return;
    }

    if (!horarioPactado) {
      showToast("Debe seleccionar el horario pactado", "info");
      return;
    }

    if (authorizedReceiver?.value === "other" && !receiverName.trim()) {
      showToast("Debe ingresar el nombre del receptor autorizado", "info");
      return;
    }

    const detallePedido = cartItems.map((item) => ({
      id_Producto: item.productId,
      precio_Regular: item.priceRegularUnit,
      precio_Promocional: item.pricePromotionalUnit,
      id_Descuento_Aplicado: item.discountId,
      cantidad: item.quantity,
      subtotal_Regular: item.subtotalRegular,
      subtotal_Promocional: item.subtotalPromotional,
    }));

    const fechaFormateada = (() => {
      if (!fechaPactada) return "";
      const [year, month, day] = fechaPactada.split("-");
      return `${day}/${month}/${year}`;
    })();

    const body = {
      id_Lead: leadIdUI,
      telefono_Alterno: telefonoLeadUI,
      cantidad_Productos: cartItems.reduce((s, i) => s + i.quantity, 0),
      monto_Total_Regular: totalRegular,
      monto_Total_Promocional: totalPromotional,
      id_Tipo_Comprobante: Number(tipoComprobante?.value),
      id_Usuario_Registro_Pedido: idUsuario,
      id_Acuerdo_de_Pago: Number(acuerdoPago?.value),
      requestInsertCliente: {
        cliente: clienteNombre,
        id_Tipo_Documento: Number(tipoDocumento?.value),
        numero_Documento: numeroDocumento,
        mail: clienteMail,
      },
      requestDelivery: {
        id_Tipo_de_Entrega: Number(tipoEntrega?.value),
        id_Medio_de_Envio: Number(medioEnvio?.value),
        id_Departamento: Number(departamentoSel?.value),
        id_Provincia: Number(provinciaSel?.value),
        id_Distrito: Number(distritoSel?.value),
        direccion_Delivery: direccion,
        referencia,
        indicaciones_De_Entrega: indicacionesEntrega,
        link_Geolocalizacion: linkUbicacion,
        receptor_Autorizado: authorizedReceiver?.value === "other",
        nombre_Receptor_Autorizado: receiverName,
        fecha_Pactada_Delivery: fechaFormateada,
        id_Horario_Pactado: Number(horarioPactado?.value) || 0,
      },
      requestDetallePedido: detallePedido,
    };

    setConfirmConfig({
      open: true,
      title: "Confirmar creación",
      message: "¿Desea registrar este pedido?",
      onConfirm: async () => {
        setConfirmConfig((prev) => ({ ...prev, open: false }));
        setLoading(true);

        try {
          console.log(body);
          const res = await PedidoService.insertPedido(body);

          console.log(res);
          if (!res.error) {
            showToast("Pedido registrado correctamente", "success");

            setLeadIdUI(null);
            setTelefonoLeadUI(null);

            setNumeroDocumento("");
            setClienteNombre("");
            setClienteMail("");
            setTelefonoAlternativo("");
            setTipoDocumento(null);
            setTipoComprobante(null);
            setAcuerdoPago(null);

            setProductos([]);
            setSelectedProductOption(null);
            setSelectedProductDetail(null);
            setQuantity(1);
            setDiscountLevel(nivelDescuentoOptions[0]);
            setDiscountDisabled(false);
            setCartItems([]);

            setTipoEntrega(null);

            setDepartamentos([]);
            setProvincias([]);
            setDistritos([]);

            setDepartamentoSel(null);
            setProvinciaSel(null);
            setDistritoSel(null);

            setDireccion("");
            setReferencia("");
            setIndicacionesEntrega("");
            setLinkUbicacion("");
            setMedioEnvio(null);
            setFechaPactada("");
            setHorarioPactado(null);

            setAuthorizedReceiver(null);
            setReceiverName("");

            setLoading(false);

          } else {
            showToast(res.message || "No se pudo registrar el pedido", "error");
          }
        } catch (err) {
          showToast("Error de conexión al registrar el pedido", "error");
        } finally {
          setLoading(false);
        }
      },
    });
  };

useEffect(() => {
  if (numeroContactoLead) setTelefono(numeroContactoLead);
}, []);

  return (
    <AppLayout title="Crear Pedido">
      <ConfirmModal
        open={confirmConfig.open}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onCancel={() =>
          setConfirmConfig({
            open: false,
            title: "",
            message: "",
            onConfirm: () => { },
          })
        }
        onConfirm={confirmConfig.onConfirm}
      />

      <div className="h-full w-full bg-slate-50">
        <div className="text-sm text-gray-500">
          Gestionar Pedidos › <span className="text-gray-800">Crear Pedido</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 pb-10 grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(320px,1fr)]"
        >
          <div className="space-y-6">
            <Card>
              <SectionTitle icon={ShoppingCart}>Información del Pedido</SectionTitle>

              <div className="px-6 py-5 space-y-6 bg-white rounded-b-2xl">
                <div className="border-b pb-6">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex flex-wrap gap-4 justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-emerald-700 uppercase">
                        Lead Seleccionado
                      </p>
                      <p className="mt-1 text-sm font-semibold text-emerald-900">{leadIdUI}</p>
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-medium text-emerald-700 uppercase">Teléfono</p>
                      <p className="mt-1 text-sm font-semibold text-emerald-900">{telefonoLeadUI}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <h3 className="text-md font-normal text-slate-900">Datos del Cliente</h3>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Tipo de Documento <span className="text-red-500">*</span>
                        </label>
                        <ReactSelect
                          classNamePrefix="rs"
                          value={tipoDocumento}
                          onChange={(v) => setTipoDocumento(v as Option)}
                          options={tipoDocumentoOptions}
                          styles={reactSelectStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          isSearchable
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Número de Documento <span className="text-red-500">*</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={numeroDocumento}
                            onChange={(e) => setNumeroDocumento(e.target.value)}
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleBuscarCliente}
                            className="rounded-xl border border-slate-300 bg-white p-2 hover:bg-slate-100"
                          >
                            <Search className="w-5 h-5 text-slate-700" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Cliente <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={clienteNombre}
                          onChange={(e) => setClienteNombre(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 mt-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Teléfono Alternativo
                        </label>
                        <input
                          type="text"
                          value={telefonoAlternativo}
                          onChange={(e) => setTelefonoAlternativo(e.target.value)}
                          placeholder="Número alternativo"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Correo
                        </label>
                        <input
                          type="email"
                          value={clienteMail}
                          onChange={(e) => setClienteMail(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Tipo de Comprobante <span className="text-red-500">*</span>
                        </label>
                        <ReactSelect
                          classNamePrefix="rs"
                          value={tipoComprobante}
                          onChange={(v) => setTipoComprobante(v as Option)}
                          options={tipoComprobanteOptions}
                          styles={reactSelectStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          isSearchable
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-b pb-6">
                  <h3 className="text-md font-normal text-slate-900">Agregar Productos</h3>

                  <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr] items-end">
                    <div>
                      <label className="block text-sm font-medium mb-1">Producto</label>
                      <ReactSelect
                        classNamePrefix="rs"
                        value={selectedProductOption}
                        onChange={handleProductoChange}
                        options={productos}
                        placeholder="Seleccione producto"
                        styles={reactSelectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        isSearchable
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Cantidad</label>
                      <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.max(1, Number(e.target.value) || 1))
                        }
                        className="w-full rounded-xl border px-3 py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Nivel de Descuento</label>
                      <ReactSelect
                        classNamePrefix="rs"
                        value={discountLevel}
                        onChange={(v) => setDiscountLevel(v as DiscountOption)}
                        options={nivelDescuentoOptions}
                        isDisabled={discountDisabled}
                        styles={reactSelectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        isSearchable
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="rounded-xl bg-emerald-700 text-white text-sm font-semibold py-2.5 hover:bg-emerald-800"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pb-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Acuerdo de pago <span className="text-red-500">*</span>
                    </label>
                    <ReactSelect
                      classNamePrefix="rs"
                      value={acuerdoPago}
                      onChange={(v) => setAcuerdoPago(v as Option)}
                      options={acuerdoPagoOptions}
                      styles={reactSelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      isSearchable
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="my-6">
              <SectionTitle icon={Truck}>Datos de Delivery</SectionTitle>

              <div className="px-6 py-5 bg-white rounded-b-2xl space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tipo de Entrega <span className="text-red-500">*</span>
                  </label>
                  <ReactSelect
                    classNamePrefix="rs"
                    value={tipoEntrega}
                    onChange={(v) => setTipoEntrega(v as Option)}
                    options={tipoEntregaOptions}
                    styles={reactSelectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    isSearchable
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Departamento <span className="text-red-500">*</span>
                    </label>
                    <ReactSelect
                      classNamePrefix="rs"
                      value={departamentoSel}
                      onChange={handleDepartamentoChange}
                      options={departamentos}
                      styles={reactSelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      isSearchable
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Provincia <span className="text-red-500">*</span>
                    </label>
                    <ReactSelect
                      classNamePrefix="rs"
                      value={provinciaSel}
                      onChange={handleProvinciaChange}
                      options={provincias}
                      styles={reactSelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      isSearchable
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Distrito <span className="text-red-500">*</span>
                    </label>
                    <ReactSelect
                      classNamePrefix="rs"
                      value={distritoSel}
                      onChange={handleDistritoChange}
                      options={distritos}
                      styles={reactSelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      isSearchable
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Dirección <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Av. Principal 123"
                      type="text"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Link de Ubicación
                  </label>
                  <input
                    type="url"
                    value={linkUbicacion}
                    onChange={(e) => setLinkUbicacion(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Referencia</label>
                  <input
                    type="text"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Indicaciones de Entrega
                  </label>
                  <input
                    type="text"
                    value={indicacionesEntrega}
                    onChange={(e) => setIndicacionesEntrega(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Receptor Autorizado <span className="text-red-500">*</span>
                    </label>
                    <ReactSelect
                      classNamePrefix="rs"
                      value={authorizedReceiver}
                      onChange={(v) => {
                        setAuthorizedReceiver(v as Option);
                        if (v?.value === "same") setReceiverName("");
                      }}
                      options={[
                        { value: "same", label: "Mismo cliente" },
                        { value: "other", label: "Otra persona" },
                      ]}
                      styles={reactSelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      isSearchable
                    />

                    {authorizedReceiver?.value === "other" && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Nombre del Receptor <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={receiverName}
                          onChange={(e) => setReceiverName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Medio de Envío Delivery <span className="text-red-500">*</span>
                    </label>
                    <ReactSelect
                      classNamePrefix="rs"
                      value={medioEnvio}
                      onChange={(v) => setMedioEnvio(v as Option)}
                      options={medioEnvioOptions}
                      styles={reactSelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      isSearchable
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Fecha Pactada <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={fechaPactada}
                      onChange={(e) => setFechaPactada(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Horario Pactado <span className="text-red-500">*</span>
                    </label>
                    <ReactSelect
                      classNamePrefix="rs"
                      value={horarioPactado}
                      onChange={(v) => setHorarioPactado(v as Option)}
                      options={horarioPactadoOptions}
                      styles={reactSelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      isSearchable
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card className="sticky top-1">
              <SectionTitle icon={ShoppingCart}>Carrito</SectionTitle>

              <div className="px-6 py-5 bg-white rounded-b-2xl space-y-4">
                {cartItems.length === 0 ? (
                  <p className="text-md text-slate-500 min-h-40 flex justify-center items-center">
                    No hay productos en el carrito
                  </p>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pb-5">
                    {cartItems.map((item) => {
                      const precioRegular = item.priceRegularUnit;
                      const precioPromo = item.pricePromotionalUnit;
                      const descuentoUnit = precioPromo - precioRegular;
                      const descuentoTotal = descuentoUnit * item.quantity;

                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border p-4 bg-slate-50 space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-semibold">
                                {item.productName}{" "}
                                <span className="text-slate-500">
                                  (S/{precioRegular.toFixed(2)})
                                </span>
                              </p>
                              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                {item.quantity} x |
                                <span className="text-emerald-700 font-semibold">
                                  S/{precioPromo.toFixed(2)}
                                </span>
                                | Descuento:
                                <span className="text-red-600 font-semibold">
                                  S/{descuentoTotal.toFixed(2)}
                                </span>
                              </p>
                            </div>

                            <button onClick={() => handleRemoveItem(item.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>

                          {item.type === "package" && (
                            <button
                              type="button"
                              onClick={() => togglePackageDetails(item.id)}
                              className="flex items-center text-xs text-emerald-700 mt-1"
                            >
                              <PlusCircle className="w-4 h-4" />
                              Ver productos del paquete
                            </button>
                          )}

                          {item.showDetails &&
                            item.items &&
                            item.items.map((p, idx) => {
                              const qtyTotal = p.qtyInternal * item.quantity;
                              const descUnit = p.pricePromotionalUnit - p.priceRegularUnit;
                              const descTotal = descUnit * qtyTotal;

                              return (
                                <div
                                  key={idx}
                                  className="mt-2 pl-3 border-l border-emerald-200"
                                >
                                  <p className="text-xs text-slate-700 font-medium">
                                    {qtyTotal} x {p.name}{" "}
                                    <span className="text-slate-500">
                                      (S/{p.priceRegularUnit.toFixed(2)})
                                    </span>{" "}
                                    |
                                    <span className="text-emerald-700 font-semibold">
                                      S/{p.pricePromotionalUnit.toFixed(2)}
                                    </span>{" "}
                                    | Descuento:
                                    <span className="text-red-600 font-semibold">
                                      S/{descTotal.toFixed(2)}
                                    </span>
                                  </p>
                                </div>
                              );
                            })}

                          <div className="pt-2 border-t flex justify-between text-sm font-semibold">
                            <span>Subtotal:</span>
                            <span>
                              <span className="line-through text-slate-400 mr-2">
                                S/{item.subtotalRegular.toFixed(2)}
                              </span>
                              S/{item.subtotalPromotional.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    <div className="border-t pt-4 flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span>S/{totalPromotional.toFixed(2)}</span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full rounded-xl bg-emerald-700 text-white py-2.5 text-sm font-semibold hover:bg-emerald-800 ${loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                      {loading ? "Procesando..." : "Crear Pedido"}
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </aside>
        </form>
      </div>
    </AppLayout>
  );
};

export default CrearPedido;

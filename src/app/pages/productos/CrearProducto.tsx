import { AppLayout } from "@/app/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { PackagePlus, PackageSearch, Copy, Edit, Trash, UploadCloud, X } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import ReactSelect from "react-select";
import { ProductService } from "@/services/productService";
import { showToast } from "@/components/ui/ToastManager";
import { AlertModal } from "@/components/ui/AlertModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const productosDisponiblesMock: ProductoOption[] = [
  {
    value: "1",
    label: "SN-5001 - Maca Premium 500mg",
    precioRegular: 45.90
  }
];

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

type OptionBasic = { value: string; label: string };

type ProductoOption = {
  value: string;
  label: string;
  precioRegular: number;
};

const mockListaProductos = [
  { nombre: "Maca Power 500mg", codigo: "PROD-001", linea: "Suplementos", tipo: "Unidad", precio: 45.0 },
  { nombre: "Pack Energía Natural", codigo: "PROD-002", linea: "Suplementos", tipo: "Pack", precio: 120.0 },
];

const selectFlotanteStyles = {
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
};

const CrearProducto: React.FC = () => {
  const [codigo, setCodigo] = useState("");
  const [codigoERP, setCodigoERP] = useState("");
  const [nombre, setNombre] = useState("");
  const [precioRegular, setPrecioRegular] = useState("0.00");
  const [precioPromocional, setPrecioPromocional] = useState("0.00");
  const [peso, setPeso] = useState("0.00");
  const [descripcion, setDescripcion] = useState("");

  const [fabricacionPropia, setFabricacionPropia] = useState("");
  const [lineaDeProducto, setLineaDeProducto] = useState("");
  const [tipoAgrupacion, setTipoAgrupacion] = useState("");
  const [tipoDeProducto, setTipoDeProducto] = useState("");
  const [estadoProducto, setEstadoProducto] = useState("");

  const [listaEstados, setListaEstados] = useState<any[]>([]);
  const [listaLineas, setListaLineas] = useState<any[]>([]);
  const [listaTipos, setListaTipos] = useState<any[]>([]);

  const [alertConfig, setAlertConfig] = useState({
    open: false,
    title: "",
    message: "",
  });

  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: () => { },
  });

  const [productosPaquete, setProductosPaquete] = useState<ProductoPaqueteFila[]>([]);
  type ProductoPaqueteFila = {
    producto: ProductoOption | null;
    precioRegularPaquete: number;
    precioPromocionalPaquete: number;
    cantidad: number;
    subtotalRegular: number;
    subtotalPromocional: number;
    diferencia: number;
  };

  const [imagenProducto, setImagenProducto] = useState<File | null>(null);
  const [previewImagen, setPreviewImagen] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [bodyTemp, setBodyTemp] = useState<any>(null);

  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroLinea, setFiltroLinea] = useState("");
  const [filtroTipoAgrupacion, setFiltroTipoAgrupacion] = useState("");
  const [filtroTipoProducto, setFiltroTipoProducto] = useState("");
  const [filtroFabricacion, setFiltroFabricacion] = useState("");
  const [filtroMin, setFiltroMin] = useState("");
  const [filtroMax, setFiltroMax] = useState("");

  const [lista, setLista] = useState(mockListaProductos);

  const showAlert = (title: string, message: string) => {
    setAlertConfig({
      open: true,
      title,
      message,
    });
  };

  const limpiarCampos = () => {
    setCodigoERP("");
    setNombre("");
    setPrecioRegular("0.00");
    setPrecioPromocional("0.00");
    setPeso("0.00");
    setDescripcion("");
    setFabricacionPropia("");
    setLineaDeProducto("");
    setTipoAgrupacion("");
    setTipoDeProducto("");
    setEstadoProducto("");
    setProductosPaquete([]);
    setImagenProducto(null);
    setPreviewImagen("");
  };

  const validarCampos = () => {
    if (!codigoERP.trim())
      return "Debe ingresar el Código ERP.";

    if (!nombre.trim())
      return "Debe ingresar el Nombre del Producto.";

    const esPaquete = tipoAgrupacion === "paquete";

    if (!esPaquete) {
      if (!precioRegular || Number(precioRegular) <= 0)
        return "Debe ingresar un Precio Regular válido.";

      if (precioPromocional === "" || Number(precioPromocional) < 0)
        return "Debe ingresar un Precio Promocional válido.";
    }

    if (!peso || Number(peso) <= 0)
      return "Debe ingresar el Peso del Producto.";

    if (!fabricacionPropia)
      return "Debe seleccionar Fabricación Propia.";

    if (!lineaDeProducto)
      return "Debe seleccionar Línea de Producto.";

    if (!tipoAgrupacion)
      return "Debe seleccionar Tipo de Agrupación.";

    if (!tipoDeProducto)
      return "Debe seleccionar Tipo de Producto.";

    if (!estadoProducto)
      return "Debe seleccionar Estado del Producto.";

    if (esPaquete) {
      if (productosPaquete.length === 0)
        return "Debe agregar al menos un producto al paquete.";

      for (const fila of productosPaquete) {
        if (!fila.producto)
          return "Debe seleccionar un producto en cada fila del paquete.";

        if (fila.cantidad <= 0)
          return "La cantidad en el paquete debe ser mayor a 0.";

        if (fila.precioPromocionalPaquete < 0)
          return "El precio promocional del paquete no puede ser negativo.";
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errorMsg = validarCampos();
    if (errorMsg) {
      showAlert("Dato obligatorio", errorMsg);
      return;
    }

    let imagenBase64 = "";
    if (imagenProducto) {
      imagenBase64 = await fileToBase64(imagenProducto);
    }

    const esPaquete = tipoAgrupacion === "paquete";

    const requestInsertProductoPaquetes = esPaquete
      ? productosPaquete.map((f) => ({
        idProducto: Number(f.producto?.value) || 0,
        precioRegularEnPaquete: parseFloat(f.precioRegularPaquete.toFixed(2)),
        precioPromocionalEnPaquete: parseFloat(f.precioPromocionalPaquete.toFixed(2)),
        cantidadEnPaquete: f.cantidad,
        subtotalRegularPaquete: parseFloat(f.subtotalRegular.toFixed(2)),
        subtotalPromocionalPaquete: parseFloat(f.subtotalPromocional.toFixed(2)),
        diferencia: parseFloat(f.diferencia.toFixed(2)),
      }))
      : [];

    const payload = {
      idProductoERP: codigoERP,
      nombreProducto: nombre,
      precioRegular: parseFloat(Number(precioRegular).toFixed(2)),
      precioInterno: parseFloat(Number(precioPromocional).toFixed(2)),
      peso: Number(peso) || 0,
      descripcion,
      fabricacionPropia: fabricacionPropia === "1",
      idLineaProducto: Number(lineaDeProducto),
      tipoAgrupacion: tipoAgrupacion === "paquete",
      idTipoProducto: Number(tipoDeProducto),
      idEstadoProducto: Number(estadoProducto),
      imagenProducto: imagenBase64,
      idUsuarioRegistroProducto: 1,
      requestInsertProductoPaquetes,
    };

    setBodyTemp(payload);

    setConfirmConfig({
      open: true,
      title: "Confirmar creación",
      message: "¿Desea registrar este producto?",
      onConfirm: confirmarGuardar,
    });
  };

  const confirmarGuardar = async () => {
    try {
      const response = await ProductService.insertProducto(bodyTemp);

      if (!response.error) {
        showToast("Producto registrado correctamente.", "success");
        limpiarCampos();
      } else {
        showToast(response.message || "Error al registrar producto.", "error");
      }
    } catch (err) {
      showToast("Ocurrió un error al registrar.", "error");
    } finally {
      setConfirmConfig({ open: false, title: "", message: "", onConfirm: () => {} });
    }
  };

  const handleClickAdjuntarImagen = () => {
    fileInputRef.current?.click();
  };

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagenProducto(file);


    const reader = new FileReader();
    reader.onload = (ev) => setPreviewImagen(String(ev.target?.result));
    reader.readAsDataURL(file);
  };

  const agregarProductoPaquete = () => {
    setProductosPaquete((prev) => [
      ...prev,
      {
        producto: null,
        precioRegularPaquete: 0,
        precioPromocionalPaquete: 0,
        cantidad: 1,
        subtotalRegular: 0,
        subtotalPromocional: 0,
        diferencia: 0,
      },
    ]);
  };

  const eliminarFilaProducto = (index: number) => {
    const nuevo = [...productosPaquete];
    nuevo.splice(index, 1);
    setProductosPaquete(nuevo);
  };

  const actualizarFila = (index: number, campo: string, valor: any) => {
    const filas = [...productosPaquete];
    const fila = filas[index];

    if (campo === "producto") {
      fila.producto = valor;

      const prod = productosDisponiblesMock.find((p) => p.value === valor.value);
      fila.precioRegularPaquete = prod ? prod.precioRegular : 0;
    }

    if (campo === "precioPromocionalPaquete") {
      let val = Number(valor);

      if (isNaN(val) || val < 0) val = 0;

      fila.precioPromocionalPaquete = val;
    }

    if (campo === "cantidad") {
      fila.cantidad = Number(valor) > 0 ? Number(valor) : 1;
    }

    fila.subtotalRegular = fila.precioRegularPaquete * fila.cantidad;
    fila.subtotalPromocional = fila.precioPromocionalPaquete * fila.cantidad;
    fila.diferencia = fila.subtotalRegular - fila.subtotalPromocional;

    filas[index] = fila;
    setProductosPaquete(filas);
  };

  const duplicarProducto = (index: number) => {
    const producto = lista[index];
    const copia = {
      ...producto,
      codigo: producto.codigo + "-COPY",
    };

    const nuevaLista = [...lista.slice(0, index + 1), copia, ...lista.slice(index + 1)];
    setLista(nuevaLista);
  };

  useEffect(() => {
    if (tipoAgrupacion === "paquete") {
      if (productosPaquete.length === 0) {
        setPrecioRegular("0.00");
        setPrecioPromocional("0.00");
        return;
      }

      const totalRegular = productosPaquete.reduce(
        (acc, fila) => acc + (Number(fila.subtotalRegular) || 0),
        0
      );

      const totalPromocional = productosPaquete.reduce(
        (acc, fila) => acc + (Number(fila.subtotalPromocional) || 0),
        0
      );

      setPrecioRegular(totalRegular.toFixed(2));
      setPrecioPromocional(totalPromocional.toFixed(2));
    }
  }, [productosPaquete, tipoAgrupacion]);

  useEffect(() => {
    const cargarCombos = async () => {
      try {
        const resEstado = await ProductService.getEstadoProducto();
        if (!resEstado.error) setListaEstados(resEstado.data);

        const resLinea = await ProductService.getLineaProducto();
        if (!resLinea.error) setListaLineas(resLinea.data);

        const resTipo = await ProductService.getTipoProducto();
        if (!resTipo.error) setListaTipos(resTipo.data);
      } catch (err) {
        console.error("Error cargando combos", err);
      }
    };

    cargarCombos();
  }, []);

  const esPaquete = tipoAgrupacion === "paquete";

  const opcionesFabricacion: OptionBasic[] = [
    { value: "1", label: "Sí" },
    { value: "0", label: "No" },
  ];

  const opcionesTipoAgrupacion: OptionBasic[] = [
    { value: "individual", label: "Individual" },
    { value: "paquete", label: "Paquete" },
  ];

  const opcionesEstado: OptionBasic[] = listaEstados.map((e: any) => ({
    value: String(e.id_Estado_Producto),
    label: e.estado_Producto,
  }));

  const opcionesLinea: OptionBasic[] = listaLineas.map((l: any) => ({
    value: String(l.id_Linea_Producto),
    label: l.nombre_Linea_Producto,
  }));

  const opcionesTipoProducto: OptionBasic[] = listaTipos.map((t: any) => ({
    value: String(t.id_Tipo_Producto),
    label: t.nombre_Tipo_Producto,
  }));

  const opcionesTipoAgrupacionFiltro: OptionBasic[] = [
    { value: "Unidad", label: "Unidad" },
    { value: "Pack", label: "Pack" },
  ];

  return (
    <AppLayout title="Crear Producto">
      <AlertModal
        open={alertConfig.open}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() =>
          setAlertConfig({
            open: false,
            title: "",
            message: "",
          })
        }
      />

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
      <div className="w-full bg-slate-50">
        <div className="text-sm text-gray-500">
          Gestionar Productos <span className="mx-1">›</span>
          <span className="text-gray-800">Crear Producto</span>
        </div>

        <Card className="mt-6">
          <SectionTitle icon={PackagePlus}>Información del Producto</SectionTitle>

          <form
            onSubmit={handleSubmit}
            className="px-6 py-6 bg-white rounded-br-2xl rounded-bl-2xl space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Código Producto
                </label>
                <input
                  value={codigo}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Código Producto en ERP <span className="text-red-500">*</span>
                </label>
                <input
                  value={codigoERP}
                  onChange={(e) => setCodigoERP(e.target.value)}
                  placeholder="Ingrese código ERP"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre del Producto <span className="text-red-500">*</span>
              </label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingrese nombre del producto"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Precio Regular (S/) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={precioRegular}
                  onChange={(e) => {
                    if (!esPaquete) setPrecioRegular(e.target.value);
                  }}
                  readOnly={esPaquete}
                  placeholder="0.00"
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
                    esPaquete
                      ? "border-slate-200 bg-slate-100 text-slate-600 cursor-default"
                      : "border-slate-200 bg-white"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Precio Promocional (S/) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={precioPromocional}
                  onChange={(e) => {
                    if (!esPaquete) setPrecioPromocional(e.target.value);
                  }}
                  readOnly={esPaquete}
                  placeholder="0.00"
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
                    esPaquete
                      ? "border-slate-200 bg-slate-100 text-slate-600 cursor-default"
                      : "border-slate-200 bg-white"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Peso (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none 
                  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ingrese descripción del producto"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 min-h-24"
              />
            </div>

            {/* Imagen + preview */}
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Imagen del Producto
                </label>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleClickAdjuntarImagen}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Adjuntar Imagen
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImagenChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Preview
                </label>

                <div className="w-full h-48 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden">
                  {previewImagen ? (
                    <img
                      src={previewImagen}
                      alt="Preview del producto"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-sm text-slate-400">Sin imagen</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fabricación Propia <span className="text-red-500">*</span>
                </label>
                <ReactSelect
                  options={opcionesFabricacion}
                  value={
                    opcionesFabricacion.find((o) => o.value === fabricacionPropia) || null
                  }
                  onChange={(opt) => setFabricacionPropia(opt?.value || "")}
                  isClearable
                  menuPortalTarget={document.body}
                  styles={selectFlotanteStyles}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Línea de Producto <span className="text-red-500">*</span>
                </label>

                <ReactSelect
                  options={opcionesLinea}
                  value={opcionesLinea.find((o) => o.value === lineaDeProducto) || null}
                  onChange={(opt) => setLineaDeProducto(opt?.value || "")}
                  isClearable
                  menuPortalTarget={document.body}
                  styles={selectFlotanteStyles}
                  placeholder="Seleccione línea"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de Agrupación <span className="text-red-500">*</span>
                </label>
                <ReactSelect
                  options={opcionesTipoAgrupacion}
                  value={
                    opcionesTipoAgrupacion.find((o) => o.value === tipoAgrupacion) || null
                  }
                  onChange={(opt) => setTipoAgrupacion(opt?.value || "")}
                  isClearable
                  menuPortalTarget={document.body}
                  styles={selectFlotanteStyles}
                  placeholder="Seleccione tipo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de Producto <span className="text-red-500">*</span>
                </label>
                <ReactSelect
                  options={opcionesTipoProducto}
                  value={
                    opcionesTipoProducto.find((o) => o.value === tipoDeProducto) || null
                  }
                  onChange={(opt) => setTipoDeProducto(opt?.value || "")}
                  isClearable
                  menuPortalTarget={document.body}
                  styles={selectFlotanteStyles}
                  placeholder="Seleccione tipo"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Estado de Producto <span className="text-red-500">*</span>
                </label>

                <ReactSelect
                  options={opcionesEstado}
                  value={opcionesEstado.find((o) => o.value === estadoProducto) || null}
                  onChange={(opt) => setEstadoProducto(opt?.value || "")}
                  isClearable
                  menuPortalTarget={document.body}
                  styles={selectFlotanteStyles}
                  placeholder="Seleccione estado"
                />
              </div>
            </div>

            {tipoAgrupacion === "paquete" && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Productos del Paquete
                </label>

                <div className="flex justify-end mb-4">
                  <button
                    type="button"
                    onClick={agregarProductoPaquete}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 text-emerald-700 px-4 py-2 text-sm hover:bg-emerald-50"
                  >
                    <span className="text-lg font-bold">＋</span> Agregar Producto
                  </button>
                </div>

                {productosPaquete.length === 0 && (
                  <p className="text-center text-slate-500 text-sm py-6">
                    No hay productos en el paquete. Haga clic en <b>“Agregar Producto”</b>{" "}
                    para comenzar.
                  </p>
                )}

                {productosPaquete.map((fila, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-4 p-4 border rounded-xl bg-slate-50"
                  >
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Producto
                      </label>
                      <ReactSelect
                        options={productosDisponiblesMock}
                        value={fila.producto}
                        onChange={(opt) => actualizarFila(index, "producto", opt)}
                        menuPortalTarget={document.body}
                        styles={selectFlotanteStyles}
                        placeholder="Seleccione producto"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Precio Regular Paquete (S/)
                      </label>
                      <input
                        type="number"
                        value={fila.precioRegularPaquete}
                        readOnly
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-100 text-slate-600 cursor-default"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Precio Promocional Paquete (S/)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={fila.precioPromocionalPaquete}
                        onChange={(e) =>
                          actualizarFila(
                            index,
                            "precioPromocionalPaquete",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={fila.cantidad}
                        onChange={(e) => actualizarFila(index, "cantidad", e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Subtotal Regular
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`S/ ${(fila.subtotalRegular || 0).toFixed(2)}`}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-100"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Subtotal
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`S/ ${(fila.subtotalPromocional || 0).toFixed(2)}`}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-100"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Diferencia
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`S/ ${(fila.diferencia || 0).toFixed(2)}`}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-100"
                      />
                    </div>

                    <div className="flex justify-center items-center md:col-span-1">
                      <button
                        type="button"
                        onClick={() => eliminarFilaProducto(index)}
                        className="rounded-xl border border-red-400 text-red-600 px-3 py-2 text-sm hover:bg-red-50 w-fit"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={limpiarCampos}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Limpiar campos
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
              >
                Crear Producto
              </button>
            </div>
          </form>
        </Card>

        <Card className="my-8">
          <SectionTitle icon={PackageSearch}>Lista de Productos</SectionTitle>

          <div className="px-6 py-6 bg-white rounded-br-2xl rounded-bl-2xl space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  placeholder="Filtrar por nombre"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none
                     focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Línea de Producto
                </label>
                <ReactSelect
                  options={opcionesLinea}
                  value={opcionesLinea.find((o) => o.value === filtroLinea) || null}
                  onChange={(opt) => setFiltroLinea(opt?.value || "")}
                  isClearable
                  menuPortalTarget={document.body}
                  styles={selectFlotanteStyles}
                  placeholder="Seleccione línea"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de Agrupación
                </label>
                <ReactSelect
                  options={opcionesTipoAgrupacionFiltro}
                  value={
                    opcionesTipoAgrupacionFiltro.find(
                      (o) => o.value === filtroTipoAgrupacion
                    ) || null
                  }
                  onChange={(opt) => setFiltroTipoAgrupacion(opt?.value || "")}
                  isClearable
                  menuPortalTarget={document.body}
                  styles={selectFlotanteStyles}
                  placeholder="Seleccione tipo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de Producto
                </label>
                <ReactSelect
                  options={opcionesTipoProducto}
                  value={
                    opcionesTipoProducto.find((o) => o.value === filtroTipoProducto) ||
                    null
                  }
                  onChange={(opt) => setFiltroTipoProducto(opt?.value || "")}
                  isClearable
                  menuPortalTarget={document.body}
                  styles={selectFlotanteStyles}
                  placeholder="Seleccione tipo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fabricación Propia
                </label>
                <ReactSelect
                  options={opcionesFabricacion}
                  value={
                    opcionesFabricacion.find((o) => o.value === filtroFabricacion) ||
                    null
                  }
                  onChange={(opt) => setFiltroFabricacion(opt?.value || "")}
                  isClearable
                  menuPortalTarget={document.body}
                  styles={selectFlotanteStyles}
                  placeholder="Seleccione"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Precio Mínimo (S/)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={filtroMin}
                  onChange={(e) => setFiltroMin(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none 
                     focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Precio Máximo (S/)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={filtroMax}
                  onChange={(e) => setFiltroMax(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none 
                     focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="text-left text-sm text-slate-600 border-b border-slate-200">
                    <th className="py-3 px-2">Código</th>
                    <th className="py-3 px-2">Nombre</th>
                    <th className="py-3 px-2">Línea</th>
                    <th className="py-3 px-2">Tipo</th>
                    <th className="py-3 px-2">Precio (S/)</th>
                    <th className="py-3 px-2">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {lista.map((p, index) => (
                    <tr key={p.codigo} className="border-b border-slate-100 text-sm text-slate-800">
                      <td className="py-3 px-2 text-emerald-700 font-semibold">{p.codigo}</td>
                      <td className="py-3 px-2">{p.nombre}</td>
                      <td className="py-3 px-2">{p.linea}</td>
                      <td className="py-3 px-2">{p.tipo}</td>
                      <td className="py-3 px-2">S/ {p.precio.toFixed(2)}</td>

                      <td className="py-3 px-2 flex gap-2">
                        <button className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100">
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicarProducto(index)}
                          className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100"
                        >
                          <Copy size={16} />
                        </button>
                        <button className="p-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50">
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CrearProducto;

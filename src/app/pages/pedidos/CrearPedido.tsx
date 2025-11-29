import { AppLayout } from "@/app/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ShoppingCart, Trash2, Truck, PlusCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import ReactSelect from "react-select";

type CartItem = {
  id: number;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discountPercent: number;
  subtotalRegular: number;
  subtotalDiscounted: number;
  type: "product" | "package";
  items?: { name: string; qty: number }[];
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
    boxShadow:
      "0 4px 10px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)",
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

const mockProducts = [
  {
    id: "P001",
    name: "Inmunidad Total",
    price: 50,
    type: "product" as const,
  },
  {
    id: "P002",
    name: "Colágeno Marino",
    price: 80,
    type: "product" as const,
  },
  {
    id: "PK001",
    name: "Paquete Energía Completa",
    price: 120,
    type: "package" as const,
    items: [
      { name: "Cápsulas Energéticas", qty: 1 },
      { name: "Vitaminas Plus", qty: 2 },
      { name: "Batido PowerMax", qty: 1 },
    ],
  },
];

const discountLevels = [
  { id: "none", label: "Sin descuento", percent: 0 },
  { id: "level1", label: "Nivel 1 - 5%", percent: 5 },
  { id: "level2", label: "Nivel 2 - 10%", percent: 10 },
];

const CrearPedido: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [discountLevel, setDiscountLevel] = useState<any>({
    value: "none",
    label: "Sin descuento",
  });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [authorizedReceiver, setAuthorizedReceiver] = useState<any>(null);
  const [receiverName, setReceiverName] = useState("");


  // Cuando se selecciona un paquete, forzar "Sin descuento" y luego deshabilitar el select, y resetear cantidad y descuento al cambiar de producto
  useEffect(() => {
    if (!selectedProduct) return;

    // 1) Resetear cantidad siempre
    setQuantity(1);

    // 2) Resetear descuento siempre
    setDiscountLevel({ value: "none", label: "Sin descuento" });

    // 3) Si es paquete, mantener Sin descuento (ya está)
    const product = mockProducts.find((p) => p.id === selectedProduct.value);
    if (product?.type === "package") {
      setDiscountLevel({ value: "none", label: "Sin descuento" });
    }
    if (authorizedReceiver?.value === "same") {
      setReceiverName("");
    }
  }, [selectedProduct, authorizedReceiver]);

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const product = mockProducts.find((p) => p.id === selectedProduct.value);
    if (!product) return;

    let discountPercent = 0;

    if (product.type === "product") {
      const discountObj = discountLevels.find(
        (d) => d.id === discountLevel.value
      );
      discountPercent = discountObj ? discountObj.percent : 0;
    }

    const subtotalRegular = product.price * quantity;
    const subtotalDiscounted =
      subtotalRegular - (subtotalRegular * discountPercent) / 100;

    setCartItems((prev) => {
      // Junta cantidades solo si el producto es el mismo y el descuento es el mismo
      const exists = prev.find(
        (item) =>
          item.productId === product.id &&
          item.discountPercent === discountPercent
      );

      // Si no existe → agregar normal
      if (!exists) {
        return [
          ...prev,
          {
            id: Date.now(),
            productId: product.id,
            productName: product.name,
            quantity,
            price: product.price,
            discountPercent,
            subtotalRegular,
            subtotalDiscounted,
            type: product.type,
            items: product.type === "package" ? product.items : undefined,
            showDetails: false,
          },
        ];
      }

      // Si existe → actualizar cantidades y subtotales
      return prev.map((item) => {
        if (item.productId !== product.id) return item;

        const newQuantity = item.quantity + quantity;
        const newSubtotalRegular = newQuantity * item.price;
        const newSubtotalDiscounted =
          newSubtotalRegular -
          (newSubtotalRegular * item.discountPercent) / 100;

        return {
          ...item,
          quantity: newQuantity,
          subtotalRegular: newSubtotalRegular,
          subtotalDiscounted: newSubtotalDiscounted,
        };
      });
    });

    // Reset de campos
    setSelectedProduct(null);
    setQuantity(1);
    setDiscountLevel({ value: "none", label: "Sin descuento" });
  };

  const togglePackageDetails = (id: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, showDetails: !item.showDetails } : item
      )
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.subtotalDiscounted,
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación: si receptor = otra persona → nombre obligatorio
    if (authorizedReceiver?.value === "other" && receiverName.trim() === "") {
      alert("Debe ingresar el nombre del receptor autorizado.");
      return;
    }

    // Aquí más validaciones si deseas…

    console.log("Formulario válido, enviando pedido...");
  };

  return (
    <AppLayout title="Crear Pedido">
      <div className="h-full w-full bg-slate-50">
        <div className="text-sm text-gray-500">
          Gestionar Pedidos ›{" "}
          <span className="text-gray-800">Crear Pedido</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 pb-10 grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(320px,1fr)]"
        >
          <div className="space-y-6">
            <Card>
              <SectionTitle icon={ShoppingCart}>
                Información del Pedido
              </SectionTitle>

              <div className="px-6 py-5 space-y-6 bg-white rounded-b-2xl">
                <div className="border-b pb-6">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex flex-wrap gap-4 justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                        Lead Seleccionado
                      </p>
                      <p className="mt-1 text-sm font-semibold text-emerald-900">
                        LEAD089
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                        Teléfono
                      </p>
                      <p className="mt-1 text-sm font-semibold text-emerald-900">
                        51949778250
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <h3 className="text-md font-normal text-slate-900">
                      Datos del Cliente
                    </h3>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Cliente <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          readOnly
                          value="María Pérez López"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm shadow-sm outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Tipo de Documento{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <ReactSelect
                          classNamePrefix="rs"
                          placeholder="Seleccione…"
                          isSearchable
                          styles={reactSelectStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          options={[
                            { value: "DNI", label: "DNI" },
                            { value: "CE", label: "Carné de Extranjería" },
                            { value: "RUC", label: "RUC" },
                          ]}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Número de Documento{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          defaultValue="71234567"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm shadow-sm outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <h3 className="text-md font-normal text-slate-900">
                      Datos del Pedido
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Teléfono Alternativo
                        </label>
                        <input
                          type="text"
                          placeholder="Número alternativo"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Tipo de Comprobante{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <ReactSelect
                          classNamePrefix="rs"
                          placeholder="Seleccione comprobante"
                          isSearchable
                          styles={reactSelectStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          options={[
                            { value: "boleta", label: "Boleta" },
                            { value: "factura", label: "Factura" },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-b pb-6">
                  <h3 className="text-md font-normal text-slate-900">
                    Agregar Productos
                  </h3>

                  <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr] items-end">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Producto
                      </label>
                      <ReactSelect
                        classNamePrefix="rs"
                        value={selectedProduct}
                        onChange={setSelectedProduct}
                        options={mockProducts.map((p) => ({
                          value: p.id,
                          label: p.name,
                        }))}
                        placeholder="Seleccione producto"
                        isSearchable
                        styles={reactSelectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min={1}
                        className="w-full rounded-xl border px-3 py-2.5 text-sm"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.max(1, Number(e.target.value) || 1))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nivel de Descuento
                      </label>
                      <ReactSelect
                        classNamePrefix="rs"
                        value={discountLevel}
                        onChange={setDiscountLevel}
                        isDisabled={
                          selectedProduct &&
                          mockProducts.find(
                            (p) => p.id === selectedProduct?.value
                          )?.type === "package"
                        }
                        options={discountLevels.map((d) => ({
                          value: d.id,
                          label: d.label,
                        }))}
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
                      Método de Pago <span className="text-red-500">*</span>
                    </label>
                    <ReactSelect
                      classNamePrefix="rs"
                      placeholder="Seleccione método"
                      options={[
                        { value: "efectivo", label: "Efectivo" },
                        { value: "tarjeta", label: "Tarjeta" },
                        { value: "transferencia", label: "Transferencia" },
                        { value: "yape", label: "Yape" },
                      ]}
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
                    placeholder="Seleccione tipo de entrega"
                    options={[
                      { value: "delivery", label: "Delivery" },
                      { value: "tienda", label: "Recojo en tienda" },
                    ]}
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
                      placeholder="Seleccione departamento"
                      options={[{ value: "lima", label: "Lima" }]}
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
                      placeholder="Seleccione provincia"
                      options={[{ value: "lima", label: "Lima" }]}
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
                      placeholder="Seleccione distrito"
                      options={[
                        { value: "miraflores", label: "Miraflores" },
                        { value: "surco", label: "Santiago de Surco" },
                      ]}
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
                      type="text"
                      defaultValue="Av. Principal 123"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Link de Ubicación
                  </label>
                  <input
                    type="url"
                    placeholder="https://maps.google.com/..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Referencia
                  </label>
                  <input
                    type="text"
                    placeholder="Cerca al parque, casa color azul"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Indicaciones de Entrega
                  </label>
                  <input
                    type="text"
                    placeholder="Dejar en el portero, llamar a Juan"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Receptor Autorizado{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <ReactSelect
                      classNamePrefix="rs"
                      placeholder="Seleccione receptor"
                      options={[
                        { value: "same", label: "Mismo cliente" },
                        { value: "other", label: "Otra persona" },
                      ]}
                      value={authorizedReceiver}
                      onChange={(value) => {
                        setAuthorizedReceiver(value);

                        // Limpia automáticamente si selecciona "Mismo cliente"
                        if (value?.value === "same") {
                          setReceiverName("");
                        }
                      }}
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
                          placeholder="Nombre completo del receptor"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Medio de Envío Delivery
                    </label>
                    <ReactSelect
                      classNamePrefix="rs"
                      placeholder="Seleccione medio de envío"
                      options={[
                        { value: "propio", label: "Reparto propio" },
                        { value: "courier", label: "Courier externo" },
                      ]}
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
                      Fecha Pactada
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Horario Pactado
                    </label>
                    <ReactSelect
                      classNamePrefix="rs"
                      placeholder="Seleccione horario"
                      options={[
                        { value: "manana", label: "Mañana (9:00 - 13:00)" },
                        { value: "tarde", label: "Tarde (14:00 - 18:00)" },
                      ]}
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
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border p-3 bg-slate-50"
                      >
                        <div className="flex justify-between">
                          <p className="text-sm font-semibold">
                            {item.productName}
                          </p>

                          <button onClick={() => handleRemoveItem(item.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-500">
                          {item.quantity} x S/ {item.price.toFixed(2)}
                        </p>

                        {item.type === "package" && (
                          <button
                            type="button"
                            onClick={() => togglePackageDetails(item.id)}
                            className="flex items-center text-xs text-emerald-600 mt-1"
                          >
                            <PlusCircle className="w-4 h-4 mr-1" />
                            Ver productos del paquete
                          </button>
                        )}

                        {item.showDetails && item.items && (
                          <ul className="mt-2 pl-4 text-xs text-slate-600 list-disc">
                            {item.items.map((p, index) => (
                              <li key={index}>
                                {p.qty} × {p.name}
                              </li>
                            ))}
                          </ul>
                        )}

                        {item.discountPercent > 0 && (
                          <p className="text-xs text-red-600 mt-1">
                            Descuento: {item.discountPercent}%
                          </p>
                        )}

                        <div className="mt-1 flex justify-between text-sm font-semibold">
                          <span>Subtotal:</span>

                          <span>
                            {item.discountPercent > 0 && (
                              <span className="line-through text-slate-400 mr-2">
                                S/ {item.subtotalRegular.toFixed(2)}
                              </span>
                            )}
                            S/ {item.subtotalDiscounted.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-3 mt-4 flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span>S/ {total.toFixed(2)}</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-emerald-700 text-white py-2.5 text-sm font-semibold hover:bg-emerald-800"
                    >
                      Crear Pedido
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

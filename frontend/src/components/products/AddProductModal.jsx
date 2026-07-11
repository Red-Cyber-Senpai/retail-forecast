import { useEffect, useState } from "react";

const initialState = {
  barcode: "",
  name: "",
  brand: "",
  category: "",
  description: "",
  image_url: "",
  unit: "pcs",
  cost_price: 0,
  selling_price: 0,
  currency: "INR",
};

function AddProductModal({
  isOpen,
  onClose,
  onSave,
  editingProduct,
}) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (editingProduct) {
      setForm(editingProduct);
    } else {
      setForm(initialState);
    }
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-2xl rounded-xl bg-white p-6">

        <h2 className="mb-5 text-2xl font-bold">
          {editingProduct ? "Edit Product" : "Add Product"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4"
        >

          <input
            name="barcode"
            value={form.barcode}
            onChange={handleChange}
            placeholder="Barcode"
            className="rounded border p-2"
            required
          />

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Product Name"
            className="rounded border p-2"
            required
          />

          <input
            name="brand"
            value={form.brand || ""}
            onChange={handleChange}
            placeholder="Brand"
            className="rounded border p-2"
          />

          <input
            name="category"
            value={form.category || ""}
            onChange={handleChange}
            placeholder="Category"
            className="rounded border p-2"
          />

          <input
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="rounded border p-2"
          />

          <input
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="rounded border p-2"
          />

          <input
            type="number"
            name="cost_price"
            value={form.cost_price}
            onChange={handleChange}
            className="rounded border p-2"
          />

          <input
            type="number"
            name="selling_price"
            value={form.selling_price}
            onChange={handleChange}
            className="rounded border p-2"
          />

          <input
            name="image_url"
            value={form.image_url || ""}
            onChange={handleChange}
            placeholder="Image URL"
            className="col-span-2 rounded border p-2"
          />

          <textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            className="col-span-2 rounded border p-2"
            rows={3}
          />

          <div className="col-span-2 flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="rounded bg-gray-300 px-5 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded bg-blue-600 px-5 py-2 text-white"
            >
              {editingProduct ? "Update Product" : "Save Product"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddProductModal;
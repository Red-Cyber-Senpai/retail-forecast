import { useEffect, useState } from "react";

function StockModal({
  isOpen,
  onClose,
  onSave,
  mode = "add", // "add" or "remove"
  initialProductId = "",
}) {
  const [form, setForm] = useState({
    product_id: "",
    quantity: 1,
    remarks: "",
  });

  useEffect(() => {
    if (isOpen) {
      setForm({
        product_id: initialProductId || "",
        quantity: 1,
        remarks: "",
      });
    }
  }, [isOpen, initialProductId]);

  if (!isOpen) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "quantity" || name === "product_id" ? Number(value) : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  const title = mode === "add" ? "Add Stock" : "Remove Stock";
  const buttonText = mode === "add" ? "Add" : "Remove";
  const buttonClass =
    mode === "add"
      ? "bg-green-600 hover:bg-green-700"
      : "bg-red-600 hover:bg-red-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">
          {title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Product ID
            </label>
            <input
              type="number"
              name="product_id"
              value={form.product_id}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              min="1"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Optional remarks"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-200 px-5 py-2 text-gray-800 hover:bg-gray-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`rounded-lg px-5 py-2 text-white ${buttonClass}`}
            >
              {buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StockModal;
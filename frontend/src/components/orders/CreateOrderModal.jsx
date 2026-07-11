import { useState } from "react";

function CreateOrderModal({ open, onClose, onCreate }) {
  const [orderType, setOrderType] = useState("RETAILER_TO_DISTRIBUTOR");
  const [supplierId, setSupplierId] = useState("");
  const [distributorId, setDistributorId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      order_type: orderType,
      supplier_id:
        orderType === "DISTRIBUTOR_TO_SUPPLIER"
          ? Number(supplierId)
          : null,
      distributor_id:
        orderType === "RETAILER_TO_DISTRIBUTOR"
          ? Number(distributorId)
          : null,
      items: [
        {
          product_id: Number(productId),
          quantity: Number(quantity),
        },
      ],
    };

    try {
      setSaving(true);
      await onCreate(payload);

      setSupplierId("");
      setDistributorId("");
      setProductId("");
      setQuantity("");
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-xl rounded-xl bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-2xl font-bold">
          Create Order
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block font-medium">
              Order Type
            </label>

            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-full rounded-lg border p-3"
            >
              <option value="RETAILER_TO_DISTRIBUTOR">
                Retailer → Distributor
              </option>
              <option value="DISTRIBUTOR_TO_SUPPLIER">
                Distributor → Supplier
              </option>
            </select>
          </div>

          {orderType === "RETAILER_TO_DISTRIBUTOR" ? (
            <div>
              <label className="mb-2 block font-medium">
                Distributor ID
              </label>

              <input
                type="number"
                value={distributorId}
                onChange={(e) => setDistributorId(e.target.value)}
                className="w-full rounded-lg border p-3"
                required
              />
            </div>
          ) : (
            <div>
              <label className="mb-2 block font-medium">
                Supplier ID
              </label>

              <input
                type="number"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full rounded-lg border p-3"
                required
              />
            </div>
          )}

          <div>
            <label className="mb-2 block font-medium">
              Product ID
            </label>

            <input
              type="number"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-lg border p-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Quantity
            </label>

            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg border p-3"
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-200 px-5 py-2 hover:bg-gray-300"
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? "Creating..." : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateOrderModal;
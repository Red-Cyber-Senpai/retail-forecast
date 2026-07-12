import {
  Plus,
  Boxes,
  ShoppingCart,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">

      <h2 className="mb-5 text-xl font-semibold">
        Quick Actions
      </h2>

      <div className="grid gap-4 md:grid-cols-3">

        <button
          onClick={() =>
            navigate("/products")
          }
          className="rounded-xl bg-blue-600 p-5 text-white hover:bg-blue-700"
        >
          <Plus className="mx-auto mb-2" />

          Add Product

        </button>

        <button
          onClick={() =>
            navigate("/inventory")
          }
          className="rounded-xl bg-green-600 p-5 text-white hover:bg-green-700"
        >
          <Boxes className="mx-auto mb-2" />

          Update Inventory

        </button>

        <button
          onClick={() =>
            navigate("/orders")
          }
          className="rounded-xl bg-purple-600 p-5 text-white hover:bg-purple-700"
        >
          <ShoppingCart className="mx-auto mb-2" />

          Create Order

        </button>

      </div>

    </div>
  );
}

export default QuickActions;
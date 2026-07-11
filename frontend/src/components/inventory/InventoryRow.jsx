import { Plus, Minus } from "lucide-react";

import StockBadge from "./StockBadge";
import useAuth from "../../hooks/useAuth";

function InventoryRow({
  item,
  onAddStock,
  onRemoveStock,
}) {
  const { user } = useAuth();

  const role = user?.role;

  return (
    <tr className="border-b hover:bg-gray-50">

      <td className="p-4">
        {item.id}
      </td>

      <td className="p-4">
        {item.product_id}
      </td>

      <td className="p-4">
        {item.quantity}
      </td>

      <td className="p-4">
        {item.minimum_stock}
      </td>

      <td className="p-4">
        {item.reorder_level}
      </td>

      <td className="p-4">
        <StockBadge stock={item.quantity} />
      </td>

      <td className="p-4">

        {(role === "manager" || role === "admin") ? (

          <div className="flex gap-2">

            <button
              onClick={() => onAddStock(item)}
              className="rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700"
              title="Add Stock"
            >
              <Plus size={16} />
            </button>

            <button
              onClick={() => onRemoveStock(item)}
              className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
              title="Remove Stock"
            >
              <Minus size={16} />
            </button>

          </div>

        ) : (

          <span className="text-sm text-gray-400">
            View Only
          </span>

        )}

      </td>

    </tr>
  );
}

export default InventoryRow;
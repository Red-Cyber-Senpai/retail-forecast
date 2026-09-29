import StatusBadge from "./StatusBadge";
import useAuth from "../../hooks/useAuth";

function OrderRow({ order, onStatusChange }) {
  const { user } = useAuth();

  const role = user?.role || "employee";

  const canEdit = [
    "manager",
    "admin",
    "superadmin",
  ].includes(role);

  return (
    <tr className="border-b hover:bg-gray-50">

      <td className="p-4 font-medium">
        #{order.id}
      </td>

      <td className="p-4">
        {order.order_type}
      </td>

      <td className="p-4 font-semibold">
        ₹{Number(order.total_amount || 0).toLocaleString()}
      </td>

      <td className="p-4">
        {order.items?.length || 0}
      </td>

      <td className="p-4">
        <StatusBadge status={order.status} />
      </td>

      <td className="p-4">
        {order.created_at
          ? new Date(order.created_at).toLocaleDateString()
          : "-"}
      </td>

      <td className="p-4">

        {canEdit ? (
          <select
            value={order.status}
            onChange={(e) =>
              onStatusChange(
                order.id,
                e.target.value
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="PENDING">
              PENDING
            </option>

            <option value="CONFIRMED">
              CONFIRMED
            </option>

            <option value="SHIPPED">
              SHIPPED
            </option>

            <option value="DELIVERED">
              DELIVERED
            </option>

            <option value="CANCELLED">
              CANCELLED
            </option>

          </select>
        ) : (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            View Only
          </span>
        )}

      </td>

    </tr>
  );
}

export default OrderRow;
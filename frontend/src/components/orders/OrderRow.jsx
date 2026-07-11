import StatusBadge from "./StatusBadge";
import useAuth from "../../hooks/useAuth";

function OrderRow({ order, onStatusChange }) {
  const { user } = useAuth();
  const role = user?.role || "employee";

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-4">{order.id}</td>

      <td className="p-4">{order.order_type}</td>

      <td className="p-4">₹{Number(order.total_amount || 0).toLocaleString()}</td>

      <td className="p-4">{order.items?.length || 0}</td>

      <td className="p-4">
        <StatusBadge status={order.status} />
      </td>

      <td className="p-4">
        {order.created_at
          ? new Date(order.created_at).toLocaleDateString()
          : "-"}
      </td>

      <td className="p-4">
        {(role === "manager" || role === "admin") ? (
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            className="rounded-lg border p-2"
          >
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        ) : (
          <span className="text-sm text-gray-500">View Only</span>
        )}
      </td>
    </tr>
  );
}

export default OrderRow;
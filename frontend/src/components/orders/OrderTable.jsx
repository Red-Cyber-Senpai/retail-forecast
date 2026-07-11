import OrderRow from "./OrderRow";

function OrderTable({
  orders,
  onStatusChange,
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md">

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>

            <th className="p-4 text-left">
              Order ID
            </th>

            <th className="p-4 text-left">
              Type
            </th>

            <th className="p-4 text-left">
              Amount
            </th>

            <th className="p-4 text-left">
              Items
            </th>

            <th className="p-4 text-left">
              Status
            </th>

            <th className="p-4 text-left">
              Created
            </th>

            <th className="p-4 text-left">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              onStatusChange={onStatusChange}
            />
          ))}

        </tbody>

      </table>

    </div>
  );
}

export default OrderTable;
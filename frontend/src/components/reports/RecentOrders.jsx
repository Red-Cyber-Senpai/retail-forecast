function RecentOrders({
  dashboard,
}) {
  const orders =
    dashboard?.recent_orders || [];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">

      <h2 className="mb-5 text-xl font-semibold">
        Recent Orders
      </h2>

      {orders.length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          No recent orders.
        </div>
      ) : (
        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="py-3">
                ID
              </th>

              <th className="py-3">
                Status
              </th>

              <th className="py-3">
                Amount
              </th>

              <th className="py-3">
                Date
              </th>

            </tr>

          </thead>

          <tbody>

            {orders.map((order) => (

              <tr
                key={order.id}
                className="border-b hover:bg-gray-50"
              >

                <td>
                  #{order.id}
                </td>

                <td>
                  {order.status}
                </td>

                <td>
                  ₹{Number(
                    order.total_amount || 0
                  ).toLocaleString()}
                </td>

                <td>
                  {new Date(
                    order.created_at
                  ).toLocaleDateString()}
                </td>

              </tr>

            ))}

          </tbody>

        </table>
      )}

    </div>
  );
}

export default RecentOrders;
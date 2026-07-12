function RecentOrdersCard({
  orders = [],
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">

      <h2 className="mb-5 text-xl font-semibold">
        Recent Orders
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">
          No recent orders.
        </p>
      ) : (
        <div className="space-y-3">

          {orders
            .slice(0, 5)
            .map((order) => (
              <div
                key={order.order_id}
                className="flex justify-between rounded-lg border p-3"
              >

                <span>
                  #{order.order_id}
                </span>

                <span>
                  {order.status}
                </span>

                <span>
                  ₹
                  {Number(
                    order.total_amount
                  ).toLocaleString()}
                </span>

              </div>
            ))}

        </div>
      )}

    </div>
  );
}

export default RecentOrdersCard;
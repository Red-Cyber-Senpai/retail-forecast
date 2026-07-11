function LowStockAlerts({ products = [] }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <h2 className="mb-5 text-xl font-semibold text-red-600">
        Low Stock Alerts
      </h2>

      {(products || []).length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          No low stock products 🎉
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-red-200 bg-red-50 p-4"
            >
              <h3 className="font-semibold">
                Product ID: {item.product_id}
              </h3>

              <p className="text-red-600">
                Remaining Stock: {item.quantity}
              </p>

              <p className="text-sm text-gray-500">
                Reorder Level: {item.reorder_level}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LowStockAlerts;
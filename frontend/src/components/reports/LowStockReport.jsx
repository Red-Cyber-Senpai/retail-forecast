function LowStockReport({
  inventory,
}) {
  const lowStock =
    inventory.filter(
      (item) =>
        item.quantity <=
        item.reorder_level
    );

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">

      <h2 className="mb-5 text-xl font-semibold text-red-600">
        Low Stock Products
      </h2>

      {lowStock.length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          No low stock products 🎉
        </div>
      ) : (
        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b">

                <th className="p-3 text-left">
                  Product ID
                </th>

                <th className="p-3 text-left">
                  Quantity
                </th>

                <th className="p-3 text-left">
                  Minimum
                </th>

                <th className="p-3 text-left">
                  Reorder
                </th>

              </tr>

            </thead>

            <tbody>

              {lowStock.map((item) => (

                <tr
                  key={item.id}
                  className="border-b hover:bg-red-50"
                >

                  <td className="p-3">
                    {item.product_id}
                  </td>

                  <td className="p-3 font-semibold text-red-600">
                    {item.quantity}
                  </td>

                  <td className="p-3">
                    {item.minimum_stock}
                  </td>

                  <td className="p-3">
                    {item.reorder_level}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}

export default LowStockReport;
function RecentProducts({ products = [] }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <h2 className="mb-5 text-xl font-semibold text-gray-800">
        Top Selling Products
      </h2>

      {(products || []).length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          No sales data available.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="py-3 pl-4 text-left">Product</th>
                <th className="py-3 text-left">Category</th>
                <th className="py-3 text-right">Units Sold</th>
                <th className="py-3 pr-4 text-right">Revenue</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr
                  key={product.product_id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-3 pl-4 font-medium">
                    {product.name}
                  </td>
                  <td className="py-3">
                    {product.category || "Uncategorized"}
                  </td>
                  <td className="py-3 text-right">
                    {product.units_sold || 0}
                  </td>
                  <td className="py-3 pr-4 text-right font-semibold text-green-600">
                    ₹{Number(product.revenue || 0).toLocaleString()}
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

export default RecentProducts;
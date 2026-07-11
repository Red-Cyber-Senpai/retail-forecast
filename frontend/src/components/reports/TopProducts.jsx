function TopProducts({
  dashboard,
}) {
  const products =
    dashboard?.top_selling_products || [];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">

      <h2 className="mb-5 text-xl font-semibold">
        Top Selling Products
      </h2>

      {products.length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          No product sales available.
        </div>
      ) : (
        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="py-3 text-left">
                Product
              </th>

              <th className="py-3 text-right">
                Units
              </th>

              <th className="py-3 text-right">
                Revenue
              </th>

            </tr>

          </thead>

          <tbody>

            {products.map((product) => (

              <tr
                key={product.product_id}
                className="border-b hover:bg-gray-50"
              >

                <td className="py-3">
                  {product.name}
                </td>

                <td className="text-right">
                  {product.units_sold}
                </td>

                <td className="text-right font-semibold text-green-600">
                  ₹{Number(
                    product.revenue
                  ).toLocaleString()}
                </td>

              </tr>

            ))}

          </tbody>

        </table>
      )}

    </div>
  );
}

export default TopProducts;
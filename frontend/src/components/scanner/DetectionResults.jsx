function DetectionResults({ result }) {
  if (!result) {
    return (
      <div className="rounded-2xl bg-white p-10 shadow-md text-center text-gray-500">
        Scan an image to view AI detection results.
      </div>
    );
  }

  const confidence = (
    result.confidence * 100
  ).toFixed(1);

  let badge =
    "bg-red-100 text-red-700";

  if (confidence >= 90)
    badge =
      "bg-green-100 text-green-700";
  else if (confidence >= 70)
    badge =
      "bg-yellow-100 text-yellow-700";

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">

      <h2 className="mb-6 text-xl font-semibold">
        Detection Results
      </h2>

      <div className="mb-6 flex flex-wrap gap-4">

        <div>
          <p className="text-sm text-gray-500">
            Predicted Category
          </p>

          <h3 className="text-xl font-bold">
            {result.predicted_category}
          </h3>
        </div>

        <div>

          <p className="text-sm text-gray-500">
            Confidence
          </p>

          <span
            className={`rounded-full px-4 py-1 font-semibold ${badge}`}
          >
            {confidence}%
          </span>

        </div>

      </div>

      {result.matched_products.length === 0 ? (
        <div className="rounded-lg bg-yellow-50 p-5 text-yellow-700">
          No matching products found.
        </div>
      ) : (
        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="p-3 text-left">
                Name
              </th>

              <th className="p-3 text-left">
                Brand
              </th>

              <th className="p-3 text-left">
                Category
              </th>

              <th className="p-3 text-left">
                Price
              </th>

            </tr>

          </thead>

          <tbody>

            {result.matched_products.map(
              (product) => (
                <tr
                  key={product.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-3 font-medium">
                    {product.name}
                  </td>

                  <td className="p-3">
                    {product.brand ||
                      "-"}
                  </td>

                  <td className="p-3">
                    {product.category}
                  </td>

                  <td className="p-3 font-semibold text-green-600">
                    ₹
                    {Number(
                      product.selling_price
                    ).toLocaleString()}
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>
      )}

    </div>
  );
}

export default DetectionResults;
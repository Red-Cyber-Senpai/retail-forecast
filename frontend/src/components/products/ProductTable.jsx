import ProductRow from "./ProductRow";

function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md">

      <table className="w-full">

        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left">ID</th>
            <th className="p-4 text-left">Product</th>
            <th className="p-4 text-left">Category</th>
            <th className="p-4 text-left">Price</th>
            <th className="p-4 text-left">Unit</th>
            <th className="p-4 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>

      </table>

    </div>
  );
}

export default ProductTable;
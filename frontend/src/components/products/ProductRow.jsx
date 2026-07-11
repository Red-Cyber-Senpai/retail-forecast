import { Pencil, Trash2 } from "lucide-react";

import useAuth from "../../hooks/useAuth";

function ProductRow({
  product,
  onEdit,
  onDelete,
}) {
  const { user } = useAuth();

  const role = user?.role;

  return (
    <tr className="border-b hover:bg-gray-50">

      <td className="p-4">
        {product.id}
      </td>

      <td className="p-4">

        <div className="flex items-center gap-3">

          <img
            src={
              product.image_url ||
              "https://placehold.co/60x60?text=No+Image"
            }
            alt={product.name}
            className="h-12 w-12 rounded-lg object-cover"
          />

          <div>

            <p className="font-semibold">
              {product.name}
            </p>

            <p className="text-sm text-gray-500">
              {product.brand || "Unknown"}
            </p>

          </div>

        </div>

      </td>

      <td>
        {product.category}
      </td>

      <td>
        ₹{Number(product.selling_price).toFixed(2)}
      </td>

      <td>
        {product.unit}
      </td>

      <td>

        <div className="flex gap-3">

          {(role === "manager" ||
            role === "admin") && (

            <button
              onClick={() => onEdit(product)}
              className="text-blue-600 hover:text-blue-800"
              title="Edit Product"
            >
              <Pencil size={18} />
            </button>

          )}

          {role === "admin" && (

            <button
              onClick={() => {
                if (
                  window.confirm(
                    `Delete "${product.name}"?`
                  )
                ) {
                  onDelete(product);
                }
              }}
              className="text-red-600 hover:text-red-800"
              title="Delete Product"
            >
              <Trash2 size={18} />
            </button>

          )}

        </div>

      </td>

    </tr>
  );
}

export default ProductRow;
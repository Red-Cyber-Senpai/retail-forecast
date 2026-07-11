import { Pencil, Trash2 } from "lucide-react";

function SupplierRow({
  supplier,
  onEdit,
  onDelete,
}) {
  return (
    <tr className="border-b hover:bg-gray-50">

      <td className="p-4">
        {supplier.id}
      </td>

      <td className="p-4 font-medium">
        {supplier.company_name}
      </td>

      <td className="p-4">
        {supplier.contact_person || "-"}
      </td>

      <td className="p-4">
        {supplier.email || "-"}
      </td>

      <td className="p-4">
        {supplier.phone || "-"}
      </td>

      <td className="p-4">
        {supplier.city || "-"}
      </td>

      <td className="p-4">
        {supplier.lead_time_days} Days
      </td>

      <td className="p-4">

        <div className="flex gap-3">

          <button
            onClick={() => onEdit(supplier)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={() => onDelete(supplier)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={18} />
          </button>

        </div>

      </td>

    </tr>
  );
}

export default SupplierRow;
import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import RegionBadge from "./RegionBadge";

function DistributorRow({
  distributor,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <tr className="border-b hover:bg-gray-50">

      <td className="p-4 font-medium">
        {distributor.company_name}
      </td>

      <td className="p-4">
        {distributor.email || "-"}
      </td>

      <td className="p-4">
        {distributor.phone || "-"}
      </td>

      <td className="p-4">
        <RegionBadge
          region={distributor.region}
        />
      </td>

      <td className="p-4">

        <div className="flex gap-2">

          <button
            onClick={() =>
              onView(distributor)
            }
            className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"
          >
            <Eye size={16} />
          </button>

          <button
            onClick={() =>
              onEdit(distributor)
            }
            className="rounded-lg bg-green-600 p-2 text-white hover:bg-green-700"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={() =>
              onDelete(distributor)
            }
            className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
          >
            <Trash2 size={16} />
          </button>

        </div>

      </td>

    </tr>
  );
}

export default DistributorRow;
import SupplierRow from "./SupplierRow";

function SupplierTable({
  suppliers,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md">

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>

            <th className="p-4 text-left">
              ID
            </th>

            <th className="p-4 text-left">
              Company
            </th>

            <th className="p-4 text-left">
              Contact
            </th>

            <th className="p-4 text-left">
              Email
            </th>

            <th className="p-4 text-left">
              Phone
            </th>

            <th className="p-4 text-left">
              City
            </th>

            <th className="p-4 text-left">
              Lead Time
            </th>

            <th className="p-4 text-left">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {suppliers.map((supplier) => (

            <SupplierRow
              key={supplier.id}
              supplier={supplier}
              onEdit={onEdit}
              onDelete={onDelete}
            />

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default SupplierTable;
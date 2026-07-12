import DistributorRow from "./DistributorRow";

function DistributorTable({
  distributors,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md">

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>

            <th className="p-4 text-left">
              Company
            </th>

            <th className="p-4 text-left">
              Email
            </th>

            <th className="p-4 text-left">
              Phone
            </th>

            <th className="p-4 text-left">
              Region
            </th>

            <th className="p-4 text-left">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {distributors.map((distributor) => (

            <DistributorRow
              key={distributor.id}
              distributor={distributor}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default DistributorTable;
import UserRow from "./UserRow";

function UserTable({
  users,
  onRoleChange,
  onToggleStatus,
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
              Name
            </th>

            <th className="p-4 text-left">
              Email
            </th>

            <th className="p-4 text-left">
              Phone
            </th>

            <th className="p-4 text-left">
              Role
            </th>

            <th className="p-4 text-left">
              Status
            </th>

            <th className="p-4 text-left">
              Change Role
            </th>

            <th className="p-4 text-left">
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {users.map((user) => (

            <UserRow
              key={user.id}
              user={user}
              onRoleChange={onRoleChange}
              onToggleStatus={onToggleStatus}
            />

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default UserTable;
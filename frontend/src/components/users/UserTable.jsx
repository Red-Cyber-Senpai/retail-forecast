import UserRow from "./UserRow";

function UserTable({
  users,
  onRole,
  onActivate,
  onDeactivate,
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md">

      <table className="w-full">

        <thead className="bg-gray-50">

          <tr>

            <th className="p-4 text-left">
              Name
            </th>

            <th className="text-left">
              Email
            </th>

            <th className="text-left">
              Role
            </th>

            <th className="text-left">
              Status
            </th>

            <th className="text-left">
              Joined
            </th>

            <th className="text-center">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onRole={onRole}
              onActivate={
                onActivate
              }
              onDeactivate={
                onDeactivate
              }
            />
          ))}

        </tbody>

      </table>

    </div>
  );
}

export default UserTable;
import RoleBadge from "./RoleBadge";
import StatusBadge from "./StatusBadge";

function UserRow({
  user,
  onRoleChange,
  onToggleStatus,
}) {
  return (
    <tr className="border-b hover:bg-gray-50">

      <td className="p-4">
        {user.id}
      </td>

      <td className="p-4">
        {user.full_name}
      </td>

      <td className="p-4">
        {user.email}
      </td>

      <td className="p-4">
        {user.phone || "-"}
      </td>

      <td className="p-4">
        <RoleBadge role={user.role} />
      </td>

      <td className="p-4">
        <StatusBadge active={user.is_active} />
      </td>

      <td className="p-4">

        <select
          value={user.role}
          onChange={(e) =>
            onRoleChange(
              user,
              e.target.value
            )
          }
          className="rounded-lg border p-2"
        >

          <option value="employee">
            Employee
          </option>

          <option value="manager">
            Manager
          </option>

          <option value="admin">
            Admin
          </option>

          <option value="superadmin">
            Super Admin
          </option>

        </select>

      </td>

      <td className="p-4">

        <button
          onClick={() =>
            onToggleStatus(user)
          }
          className={`rounded-lg px-4 py-2 text-white ${
            user.is_active
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {user.is_active
            ? "Deactivate"
            : "Activate"}
        </button>

      </td>

    </tr>
  );
}

export default UserRow;
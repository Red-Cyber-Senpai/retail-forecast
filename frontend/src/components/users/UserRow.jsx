import {
  CheckCircle,
  Ban,
  Shield,
} from "lucide-react";

import RoleBadge from "./RoleBadge";
import StatusBadge from "./StatusBadge";

import useAuth from "../../hooks/useAuth";

function UserRow({
  user,
  onRole,
  onActivate,
  onDeactivate,
}) {
  const { user: currentUser } = useAuth();

  const self =
    currentUser?.id === user.id;

  return (
    <tr className="border-b hover:bg-gray-50">

      <td className="p-4 font-medium">
        {user.full_name}
      </td>

      <td>{user.email}</td>

      <td>
        <RoleBadge role={user.role} />
      </td>

      <td>
        <StatusBadge
          active={user.is_active}
        />
      </td>

      <td>
        {new Date(
          user.created_at
        ).toLocaleDateString()}
      </td>

      <td>

        {self ? (
          <span className="text-xs text-gray-400">
            Current User
          </span>
        ) : (
          <div className="flex gap-2">

            <button
              onClick={() =>
                onRole(user)
              }
              className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
            >
              <Shield size={15} />
            </button>

            {user.is_active ? (
              <button
                onClick={() =>
                  onDeactivate(user)
                }
                className="rounded bg-red-600 p-2 text-white hover:bg-red-700"
              >
                <Ban size={15} />
              </button>
            ) : (
              <button
                onClick={() =>
                  onActivate(user)
                }
                className="rounded bg-green-600 p-2 text-white hover:bg-green-700"
              >
                <CheckCircle
                  size={15}
                />
              </button>
            )}

          </div>
        )}

      </td>

    </tr>
  );
}

export default UserRow;
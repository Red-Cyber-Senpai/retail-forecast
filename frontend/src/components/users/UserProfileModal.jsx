import { useEffect, useState } from "react";

import useAuth from "../../hooks/useAuth";

function UserProfileModal({
  open,
  user,
  onClose,
  onSave,
}) {
  const { user: currentUser } = useAuth();

  const [role, setRole] = useState("");

  useEffect(() => {
    if (user) {
      setRole(user.role);
    }
  }, [user]);

  if (!open || !user) return null;

  const roleOptions =
    currentUser?.role === "superadmin"
      ? [
          "employee",
          "manager",
          "admin",
          "superadmin",
        ]
      : [
          "employee",
          "manager",
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        <h2 className="mb-6 text-2xl font-bold">
          Update User Role
        </h2>

        <div className="space-y-4">

          <div>

            <label className="mb-2 block text-sm font-medium">
              Name
            </label>

            <input
              value={user.full_name}
              disabled
              className="w-full rounded-lg border bg-gray-100 p-3"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              value={user.email}
              disabled
              className="w-full rounded-lg border bg-gray-100 p-3"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Role
            </label>

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
              className="w-full rounded-lg border p-3"
            >
              {roleOptions.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>

          </div>

        </div>

        <div className="mt-6 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2"
          >
            Cancel
          </button>

          <button
            onClick={() =>
              onSave(role)
            }
            className="rounded-lg bg-blue-600 px-5 py-2 text-white"
          >
            Update
          </button>

        </div>

      </div>

    </div>
  );
}

export default UserProfileModal;
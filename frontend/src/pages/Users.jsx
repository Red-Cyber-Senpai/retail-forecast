import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";

import UserToolbar from "../components/users/UserToolbar";
import UserTable from "../components/users/UserTable";

import {
  getUsers,
  changeRole,
  activateUser,
  deactivateUser,
} from "../services/users";

function Users() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);

      const data = await getUsers();

      setUsers(data);

      setError("");
    } catch (err) {
      console.error(err);

      setError("Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(user, role) {
    if (user.role === role) return;

    try {
      await changeRole(user.id, role);

      toast.success("Role Updated");

      await loadUsers();
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.detail ||
          "Unable to change role."
      );
    }
  }

  async function handleToggleStatus(user) {
    try {
      if (user.is_active) {
        await deactivateUser(user.id);

        toast.success("User Deactivated");
      } else {
        await activateUser(user.id);

        toast.success("User Activated");
      }

      await loadUsers();
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.detail ||
          "Unable to update user."
      );
    }
  }

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();

    return (
      user.full_name
        ?.toLowerCase()
        .includes(query) ||
      user.email
        ?.toLowerCase()
        .includes(query) ||
      user.role
        ?.toLowerCase()
        .includes(query)
    );
  });

  if (loading) return <Loader />;

  if (error)
    return (
      <ErrorState
        message={error}
        onRetry={loadUsers}
      />
    );

  return (
    <div className="space-y-6">

      <UserToolbar
        search={search}
        setSearch={setSearch}
      />

      {filteredUsers.length === 0 ? (
        <EmptyState message="No Users Found" />
      ) : (
        <UserTable
          users={filteredUsers}
          onRoleChange={handleRoleChange}
          onToggleStatus={handleToggleStatus}
        />
      )}

    </div>
  );
}

export default Users;
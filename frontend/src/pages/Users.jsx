import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";

import UserToolbar from "../components/users/UserToolbar";
import UserStats from "../components/users/UserStats";
import UserTable from "../components/users/UserTable";
import UserProfileModal from "../components/users/UserProfileModal";

import {
  getUsers,
  updateRole,
  activateUser,
  deactivateUser,
} from "../services/users";

function Users() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [filterRole, setFilterRole] =
    useState("");

  const [filterStatus, setFilterStatus] =
    useState("");

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [showModal, setShowModal] =
    useState(false);

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

      setError(
        "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRole(role) {
    try {
      await updateRole(
        selectedUser.id,
        role
      );

      toast.success(
        "Role Updated"
      );

      setShowModal(false);

      loadUsers();
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Update Failed"
      );
    }
  }

  async function handleActivate(user) {
    try {
      await activateUser(user.id);

      toast.success(
        "User Activated"
      );

      loadUsers();
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Operation Failed"
      );
    }
  }

  async function handleDeactivate(user) {
    try {
      await deactivateUser(user.id);

      toast.success(
        "User Deactivated"
      );

      loadUsers();
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Operation Failed"
      );
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.full_name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        user.email
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesRole =
        !filterRole ||
        user.role === filterRole;

      const matchesStatus =
        !filterStatus ||
        (filterStatus ===
          "active" &&
          user.is_active) ||
        (filterStatus ===
          "inactive" &&
          !user.is_active);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    filterRole,
    filterStatus,
  ]);

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
        filterRole={filterRole}
        setFilterRole={
          setFilterRole
        }
        filterStatus={
          filterStatus
        }
        setFilterStatus={
          setFilterStatus
        }
        onRefresh={loadUsers}
      />

      <UserStats
        users={filteredUsers}
      />

      {filteredUsers.length === 0 ? (
        <EmptyState message="No Users Found" />
      ) : (
        <UserTable
          users={filteredUsers}
          onRole={(user) => {
            setSelectedUser(user);
            setShowModal(true);
          }}
          onActivate={
            handleActivate
          }
          onDeactivate={
            handleDeactivate
          }
        />
      )}

      <UserProfileModal
        open={showModal}
        user={selectedUser}
        onClose={() =>
          setShowModal(false)
        }
        onSave={handleRole}
      />

    </div>
  );
}

export default Users;
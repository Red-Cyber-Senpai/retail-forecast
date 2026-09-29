import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Shield, ToggleLeft, ToggleRight, User, Mail, ShieldAlert } from "lucide-react";
import { getUsers, updateRole, activateUser, deactivateUser } from "../services/users";
import { useAuthContext } from "../context/AuthContext";

function Users() {
  const { user: currentUser } = useAuthContext();
  const isAdminOrSuper = ["admin", "superadmin"].includes(currentUser?.role);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users list");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    if (userId === currentUser.id) {
      toast.error("You cannot change your own role!");
      return;
    }
    try {
      await updateRole(userId, newRole);
      toast.success("User role updated successfully");
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to modify user role");
    }
  }

  async function handleToggleActive(userId, isCurrentlyActive) {
    if (userId === currentUser.id) {
      toast.error("You cannot deactivate your own account!");
      return;
    }
    try {
      if (isCurrentlyActive) {
        await deactivateUser(userId);
        toast.success("User deactivated successfully");
      } else {
        await activateUser(userId);
        toast.success("User activated successfully");
      }
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle user active state");
    }
  }

  return (
    <div className="page-container">
      {/* Title */}
      <div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: "800", fontFamily: "var(--font-display)" }}>
          User Control Center
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Admin panel to configure user permissions, toggle account status, and delegate roles.
        </p>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Status</th>
                {isAdminOrSuper && <th style={{ textAlign: "right" }}>Configure Access</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                
                let roleColor = "var(--color-info)";
                if (u.role === "superadmin") roleColor = "var(--color-danger)";
                else if (u.role === "admin") roleColor = "var(--color-warning)";
                else if (u.role === "manager") roleColor = "var(--color-primary)";

                return (
                  <tr key={u.id} style={{ opacity: u.is_active ? 1 : 0.65 }}>
                    <td style={{ fontWeight: "600" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <User size={16} style={{ color: "var(--text-muted)" }} />
                        {u.full_name} {isSelf && <span style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: "bold" }}>(You)</span>}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <Mail size={12} style={{ color: "var(--text-muted)" }} />
                        {u.email}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: "var(--color-primary-light)", color: roleColor }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? "badge-success" : "badge-danger"}`}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {isAdminOrSuper && (
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "12px", alignItems: "center" }}>
                          
                          {/* Role selector dropdown */}
                          <select
                            value={u.role}
                            disabled={isSelf}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="form-input"
                            style={{
                              width: "130px",
                              padding: "4px 8px",
                              fontSize: "0.8rem",
                              appearance: "auto",
                              backgroundColor: "light-dark(#fff, #0f131d)",
                            }}
                          >
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                          </select>

                          {/* Active state toggler */}
                          <button
                            onClick={() => handleToggleActive(u.id, u.is_active)}
                            disabled={isSelf}
                            className="btn btn-outline"
                            style={{ padding: "4px 8px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            {u.is_active ? (
                              <>
                                <ToggleRight size={16} style={{ color: "var(--color-success)" }} />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleLeft size={16} style={{ color: "var(--text-muted)" }} />
                                Activate
                              </>
                            )}
                          </button>

                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Users;

import { Search, RefreshCw } from "lucide-react";

function UserToolbar({
  search,
  setSearch,
  filterRole,
  setFilterRole,
  filterStatus,
  setFilterStatus,
  onRefresh,
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            User Management
          </h1>

          <p className="mt-1 text-gray-500">
            Manage user roles and account status.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3.5 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-lg border py-3 pl-10 pr-4"
          />

        </div>

        <select
          value={filterRole}
          onChange={(e) =>
            setFilterRole(e.target.value)
          }
          className="rounded-lg border p-3"
        >
          <option value="">All Roles</option>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
          <option value="superadmin">
            SuperAdmin
          </option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value)
          }
          className="rounded-lg border p-3"
        >
          <option value="">All Status</option>
          <option value="active">
            Active
          </option>
          <option value="inactive">
            Inactive
          </option>
        </select>

      </div>
    </div>
  );
}

export default UserToolbar;
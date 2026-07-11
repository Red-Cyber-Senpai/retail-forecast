import { Search } from "lucide-react";

function UserToolbar({
  search,
  setSearch,
}) {
  return (
    <div className="mb-6 flex items-center justify-between">

      <div>

        <h1 className="text-3xl font-bold">
          User Management
        </h1>

        <p className="text-gray-500">
          Manage users and roles
        </p>

      </div>

      <div className="relative">

        <Search
          className="absolute left-3 top-3 text-gray-400"
          size={18}
        />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search Users..."
          className="rounded-lg border py-2 pl-10 pr-4"
        />

      </div>

    </div>
  );
}

export default UserToolbar;
import {
  Plus,
  Search,
} from "lucide-react";

function DistributorToolbar({
  search,
  setSearch,
  onAdd,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md lg:flex-row lg:items-center lg:justify-between">

      <div>

        <h1 className="text-3xl font-bold">
          Distributor Management
        </h1>

        <p className="mt-1 text-gray-500">
          Manage distributors, regions and distribution network.
        </p>

      </div>

      <div className="flex gap-3">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search distributors..."
            className="rounded-xl border py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
          />

        </div>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus size={18} />

          Add Distributor
        </button>

      </div>

    </div>
  );
}

export default DistributorToolbar;
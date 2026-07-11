import { Search, Download, Plus } from "lucide-react";
import useAuth from "../../hooks/useAuth";

function InventoryToolbar({
  search,
  setSearch,
  onUpdateStock,
  onViewLogs,
}) {
  const { user } = useAuth();

  const role = user?.role;

  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>

        <h1 className="text-3xl font-bold">
          Inventory
        </h1>

        <p className="text-gray-500">
          Monitor and manage stock levels
        </p>

      </div>

      <div className="flex flex-wrap gap-3">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Inventory..."
            className="w-64 rounded-lg border py-2 pl-10 pr-4"
          />

        </div>

        {(role === "manager" || role === "admin") && (
          <button
            onClick={onUpdateStock}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            <Plus size={18} />

            Update Stock
          </button>
        )}

        {role === "admin" && (
          <button
            onClick={onViewLogs}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
          >
            <Download size={18} />

            Inventory Logs
          </button>
        )}

      </div>

    </div>
  );
}

export default InventoryToolbar;
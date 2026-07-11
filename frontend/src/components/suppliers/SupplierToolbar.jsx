import { Plus, Search } from "lucide-react";

function SupplierToolbar({
  search,
  setSearch,
  onAdd,
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      <h1 className="text-3xl font-bold">
        Suppliers
      </h1>

      <div className="flex gap-4">

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
            placeholder="Search Supplier..."
            className="w-64 rounded-lg border py-2 pl-10 pr-4"
          />

        </div>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >

          <Plus size={18} />

          Add Supplier

        </button>

      </div>

    </div>
  );
}

export default SupplierToolbar;
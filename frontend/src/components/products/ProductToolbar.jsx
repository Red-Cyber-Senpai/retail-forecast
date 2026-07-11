import { Plus, Search } from "lucide-react";
import useAuth from "../../hooks/useAuth";

function ProductToolbar({
  search,
  setSearch,
  onAdd,
}) {
  const { user } = useAuth();

  const role = user?.role;

  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>

        <h1 className="text-3xl font-bold">
          Products
        </h1>

        <p className="text-gray-500">
          Manage your product catalog
        </p>

      </div>

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
            placeholder="Search Products..."
            className="w-72 rounded-lg border py-2 pl-10 pr-4"
          />

        </div>

        {(role === "manager" ||
          role === "admin") && (

          <button
            onClick={onAdd}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >

            <Plus size={18} />

            Add Product

          </button>

        )}

      </div>

    </div>
  );
}

export default ProductToolbar;
import { Search, Plus } from "lucide-react";
import useAuth from "../../hooks/useAuth";

function OrderToolbar({
  search,
  setSearch,
  onCreate,
}) {
  const { user } = useAuth();

  const role = user?.role;

  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      <div>
        <h1 className="text-3xl font-bold">
          Orders
        </h1>

        <p className="text-gray-500">
          Manage purchase and supply orders
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
            placeholder="Search Orders..."
            className="w-64 rounded-lg border py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
          />

        </div>

        {(role === "manager" ||
          role === "admin") && (

          <button
            onClick={onCreate}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            <Plus size={18} />

            Create Order

          </button>

        )}

      </div>

    </div>
  );
}

export default OrderToolbar;
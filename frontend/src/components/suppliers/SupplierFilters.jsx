function SupplierFilters({
  activeFilter,
  setActiveFilter,
}) {
  return (
    <div className="flex gap-3">

      <button
        onClick={() => setActiveFilter("all")}
        className={`rounded-lg px-4 py-2 ${
          activeFilter === "all"
            ? "bg-blue-600 text-white"
            : "bg-gray-100"
        }`}
      >
        All
      </button>

      <button
        onClick={() => setActiveFilter("active")}
        className={`rounded-lg px-4 py-2 ${
          activeFilter === "active"
            ? "bg-green-600 text-white"
            : "bg-gray-100"
        }`}
      >
        Active
      </button>

      <button
        onClick={() => setActiveFilter("inactive")}
        className={`rounded-lg px-4 py-2 ${
          activeFilter === "inactive"
            ? "bg-red-600 text-white"
            : "bg-gray-100"
        }`}
      >
        Inactive
      </button>

    </div>
  );
}

export default SupplierFilters;
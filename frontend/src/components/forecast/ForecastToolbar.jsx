function ForecastToolbar({
  productId,
  setProductId,
  days,
  setDays,
  onGenerate,
  loading = false,
}) {
  return (
    <div className="flex flex-col gap-4 p-6 mb-6 bg-white shadow-md rounded-2xl lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold">AI Demand Forecast</h1>
        <p className="mt-1 text-gray-500">
          Generate ML demand prediction
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div>
          <label className="block mb-2 text-sm font-medium">
            Product ID
          </label>

          <input
            type="number"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="p-3 border rounded-lg"
            placeholder="e.g. 1"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Days
          </label>

          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="p-3 border rounded-lg"
          >
            <option value={7}>7</option>
            <option value={14}>14</option>
            <option value={21}>21</option>
            <option value={30}>30</option>
          </select>
        </div>

        <button
          onClick={onGenerate}
          disabled={loading}
          className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? "Generating..." : "Generate Forecast"}
        </button>
      </div>
    </div>
  );
}

export default ForecastToolbar;
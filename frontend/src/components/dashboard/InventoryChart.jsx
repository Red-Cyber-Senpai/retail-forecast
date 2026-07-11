import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function InventoryChart({
  activeProducts = 0,
  totalStockUnits = 0,
  lowStockCount = 0,
}) {
  const data = [
    {
      name: "Inventory",
      "Active Products": activeProducts,
      "Stock Units": totalStockUnits,
      "Low Stock": lowStockCount,
    },
  ];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <h2 className="mb-5 text-xl font-semibold text-gray-800">
        Inventory Overview
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="name" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="Active Products"
            fill="#2563eb"
          />

          <Bar
            dataKey="Stock Units"
            fill="#16a34a"
          />

          <Bar
            dataKey="Low Stock"
            fill="#ef4444"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default InventoryChart;
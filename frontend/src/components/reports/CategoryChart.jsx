import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#84cc16",
];

function CategoryChart({ dashboard }) {
  if (!dashboard) return null;

  const chartData = (dashboard.category_breakdown || []).map(
    (item) => ({
      name: item.category || "Others",
      value: Number(item.revenue || 0),
    })
  );

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <h2 className="mb-5 text-xl font-semibold text-gray-800">
        Revenue by Category
      </h2>

      {chartData.length === 0 ? (
        <div className="flex h-[320px] items-center justify-center text-gray-500">
          No category revenue available.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={110}
              innerRadius={55}
              paddingAngle={3}
              label
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => [
                `₹${Number(value).toLocaleString()}`,
                "Revenue",
              ]}
            />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default CategoryChart;
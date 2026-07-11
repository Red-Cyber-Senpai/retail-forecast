import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function SalesChart({ sales = [] }) {
  const chartData = sales
    .slice()
    .reverse()
    .map((sale) => ({
      sale: `#${sale.sale_id}`,
      revenue: sale.total_amount,
    }));

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <h2 className="mb-5 text-xl font-semibold text-gray-800">
        Recent Sales Revenue
      </h2>

      {chartData.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center text-gray-500">
          No sales available.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="sale" />

            <YAxis />

            <Tooltip
              formatter={(value) => [
                `₹${Number(value).toLocaleString()}`,
                "Revenue",
              ]}
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default SalesChart;
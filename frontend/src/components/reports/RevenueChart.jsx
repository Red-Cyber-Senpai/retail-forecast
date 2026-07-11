import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function RevenueChart({ dashboard }) {
  if (!dashboard) return null;

  const chartData = (dashboard.recent_sales || [])
    .slice()
    .reverse()
    .map((sale) => ({
      sale: `#${sale.sale_id}`,
      revenue: sale.total_amount,
      items: sale.total_items,
    }));

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">

      <h2 className="mb-5 text-xl font-semibold text-gray-800">
        Revenue Trend
      </h2>

      {chartData.length === 0 ? (
        <div className="flex h-[320px] items-center justify-center text-gray-500">
          No revenue data available.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>

            <defs>
              <linearGradient
                id="revenueGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#2563eb"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="#2563eb"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="sale" />

            <YAxis />

            <Tooltip
              formatter={(value, name) => {
                if (name === "Revenue")
                  return [
                    `₹${Number(value).toLocaleString()}`,
                    "Revenue",
                  ];

                return [value, name];
              }}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#2563eb"
              strokeWidth={3}
              fill="url(#revenueGradient)"
            />

          </AreaChart>
        </ResponsiveContainer>
      )}

    </div>
  );
}

export default RevenueChart;
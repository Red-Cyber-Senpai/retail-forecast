import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function ForecastChart({ forecast }) {
  if (!forecast) return null;

  const chartData = Array.isArray(forecast.forecast)
    ? forecast.forecast
    : [];

  return (
    <div className="p-6 bg-white shadow-md rounded-2xl">
      <h2 className="mb-5 text-xl font-semibold">
        Forecast Trend
      </h2>

      {chartData.length === 0 ? (
        <div className="flex h-[320px] items-center justify-center text-gray-500">
          No forecast data available.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value) => [
                `${Number(value).toLocaleString()} Units`,
                "Predicted Demand",
              ]}
            />
            <Line
              type="natural"
              dataKey="predicted_quantity"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default ForecastChart;
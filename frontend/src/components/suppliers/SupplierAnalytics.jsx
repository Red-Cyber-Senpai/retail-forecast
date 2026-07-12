import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#7c3aed",
  "#dc2626",
];

function SupplierAnalytics({
  suppliers = [],
}) {
  const cityMap = {};

  suppliers.forEach((supplier) => {
    const city =
      supplier.city || "Unknown";

    cityMap[city] =
      (cityMap[city] || 0) + 1;
  });

  const chartData =
    Object.entries(cityMap).map(
      ([city, total]) => ({
        name: city,
        value: total,
      })
    );

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">

      <h2 className="mb-5 text-xl font-semibold">
        Suppliers by City
      </h2>

      {chartData.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          No analytics available.
        </div>
      ) : (
        <ResponsiveContainer
          width="100%"
          height={320}
        >
          <PieChart>

            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={110}
              label
            >

              {chartData.map(
                (item, index) => (
                  <Cell
                    key={item.name}
                    fill={
                      COLORS[
                        index %
                          COLORS.length
                      ]
                    }
                  />
                )
              )}

            </Pie>

            <Tooltip />

            <Legend />

          </PieChart>
        </ResponsiveContainer>
      )}

    </div>
  );
}

export default SupplierAnalytics;
import {
  Brain,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";

function Card({
  title,
  value,
  icon,
  color,
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            {value}
          </h3>

        </div>

        <div
          className={`rounded-xl p-4 text-white ${color}`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

function ForecastSummary({
  dashboard,
}) {
  if (!dashboard) return null;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">

      <h2 className="mb-6 text-xl font-semibold">
        Forecast Summary
      </h2>

      <div className="grid gap-4 md:grid-cols-3">

        <Card
          title="Today's Revenue"
          value={`₹${Number(
            dashboard.todays_revenue || 0
          ).toLocaleString()}`}
          icon={<TrendingUp size={24} />}
          color="bg-blue-600"
        />

        <Card
          title="Today's Units Sold"
          value={dashboard.todays_units_sold || 0}
          icon={<ShoppingCart size={24} />}
          color="bg-green-600"
        />

        <Card
          title="AI Status"
          value="Healthy"
          icon={<Brain size={24} />}
          color="bg-purple-600"
        />

      </div>

    </div>
  );
}

export default ForecastSummary;
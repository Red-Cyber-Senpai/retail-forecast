import {
  TrendingUp,
  ShoppingCart,
  Target,
  Package,
} from "lucide-react";

import StatCard from "../dashboard/StatCard";

function ForecastSummary({ forecast }) {
  if (!forecast) return null;

  const predictedTotal = Number(forecast.predicted_total || 0);
  const predictedDailyAverage = Number(
    forecast.predicted_daily_average || 0
  );
  const recommendedOrderQuantity = Number(
    forecast.recommended_order_quantity || 0
  );
  const forecastConfidence = Number(
    forecast.forecast_confidence || 0
  );
  const daysUntilStockout = Number(
    forecast.days_until_stockout || 0
  );

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Current Stock"
        value={`${Number(forecast.current_stock || 0).toLocaleString()} Units`}
        subtitle={`Minimum ${Number(
          forecast.minimum_stock || 0
        ).toLocaleString()}`}
        icon={<Package size={28} />}
        bgColor="bg-slate-700"
      />

      <StatCard
        title="Predicted Demand"
        value={predictedTotal.toLocaleString()}
        subtitle={`Avg ${predictedDailyAverage.toFixed(1)}/day`}
        icon={<TrendingUp size={28} />}
        bgColor="bg-blue-600"
      />

      <StatCard
        title="Days Until Stockout"
        value={daysUntilStockout.toFixed(1)}
        subtitle="Forecasted coverage"
        icon={<Target size={28} />}
        bgColor="bg-purple-600"
      />

      <StatCard
        title="Recommended Order"
        value={`${recommendedOrderQuantity.toLocaleString()} Units`}
        subtitle={
          forecast.recommend_reorder
            ? "Reorder Required"
            : "Stock Sufficient"
        }
        icon={<ShoppingCart size={28} />}
        bgColor="bg-green-600"
      />
    </div>
  );
}

export default ForecastSummary;
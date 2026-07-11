import {
  Package,
  Warehouse,
  DollarSign,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

import StatCard from "../dashboard/StatCard";

function ReportCards({ dashboard }) {
  if (!dashboard) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

      <StatCard
        title="Total Revenue"
        value={`₹${Number(
          dashboard.all_time_revenue || 0
        ).toLocaleString()}`}
        subtitle={`Today ₹${Number(
          dashboard.todays_revenue || 0
        ).toLocaleString()}`}
        icon={<DollarSign size={28} />}
        bgColor="bg-green-600"
      />

      <StatCard
        title="Products"
        value={dashboard.catalog_products || 0}
        subtitle={`${dashboard.active_products || 0} Active Products`}
        icon={<Package size={28} />}
        bgColor="bg-blue-600"
      />

      <StatCard
        title="Inventory"
        value={Number(
          dashboard.total_stock_units || 0
        ).toLocaleString()}
        subtitle="Total Stock Units"
        icon={<Warehouse size={28} />}
        bgColor="bg-indigo-600"
      />

      <StatCard
        title="Low Stock"
        value={dashboard.low_stock_count || 0}
        subtitle="Needs Reorder"
        icon={<AlertTriangle size={28} />}
        bgColor="bg-red-600"
      />

      <StatCard
        title="Today's Sales"
        value={dashboard.todays_units_sold || 0}
        subtitle="Units Sold"
        icon={<ShoppingCart size={28} />}
        bgColor="bg-purple-600"
      />

      <StatCard
        title="Top Products"
        value={
          dashboard.top_selling_products?.length || 0
        }
        subtitle="Best Sellers"
        icon={<TrendingUp size={28} />}
        bgColor="bg-orange-600"
      />

    </div>
  );
}

export default ReportCards;
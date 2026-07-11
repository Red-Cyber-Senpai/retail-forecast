import {
  Warehouse,
  Package,
  AlertTriangle,
  Boxes,
} from "lucide-react";

function SummaryCard({
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

          <h3 className="mt-2 text-3xl font-bold">
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

function InventorySummary({
  dashboard,
  inventory,
}) {
  if (!dashboard) return null;

  const averageStock =
    inventory.length > 0
      ? Math.round(
          inventory.reduce(
            (sum, item) =>
              sum + item.quantity,
            0
          ) / inventory.length
        )
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2">

      <SummaryCard
        title="Total Stock Units"
        value={dashboard.total_stock_units}
        icon={<Warehouse size={26} />}
        color="bg-blue-600"
      />

      <SummaryCard
        title="Products"
        value={dashboard.catalog_products}
        icon={<Package size={26} />}
        color="bg-green-600"
      />

      <SummaryCard
        title="Average Stock"
        value={averageStock}
        icon={<Boxes size={26} />}
        color="bg-purple-600"
      />

      <SummaryCard
        title="Low Stock"
        value={dashboard.low_stock_count}
        icon={<AlertTriangle size={26} />}
        color="bg-red-600"
      />

    </div>
  );
}

export default InventorySummary;
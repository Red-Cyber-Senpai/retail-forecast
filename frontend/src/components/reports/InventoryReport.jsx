import InventorySummary from "./InventorySummary";
import LowStockReport from "./LowStockReport";

function InventoryReport({
  dashboard,
  inventory,
}) {
  if (!dashboard) return null;

  return (
    <div className="space-y-6">

      <InventorySummary
        dashboard={dashboard}
        inventory={inventory}
      />

      <LowStockReport
        inventory={inventory}
      />

    </div>
  );
}

export default InventoryReport;
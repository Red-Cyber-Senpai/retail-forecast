import RevenueChart from "./RevenueChart";
import CategoryChart from "./CategoryChart";

function SalesReport({ dashboard }) {
  if (!dashboard) return null;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <RevenueChart dashboard={dashboard} />

      <CategoryChart dashboard={dashboard} />
    </div>
  );
}

export default SalesReport;
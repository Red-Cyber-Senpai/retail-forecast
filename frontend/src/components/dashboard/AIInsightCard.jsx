import { Brain } from "lucide-react";

function AIInsightCard({
  dashboard,
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-md">

      <div className="mb-4 flex items-center gap-3">

        <Brain />

        <h2 className="text-xl font-semibold">
          AI Insight
        </h2>

      </div>

      <p>

        {dashboard?.low_stock_count > 0
          ? `AI recommends reordering ${dashboard.low_stock_count} low-stock products soon.`
          : "Inventory levels are healthy. No immediate reorder recommendations."}

      </p>

    </div>
  );
}

export default AIInsightCard;
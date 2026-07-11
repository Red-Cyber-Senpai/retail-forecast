import { useEffect, useMemo, useState } from "react";

import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";

import ReportsToolbar from "../components/reports/ReportsToolbar";
import ReportCards from "../components/reports/ReportCards";
import SalesReport from "../components/reports/SalesReport";
import InventoryReport from "../components/reports/InventoryReport";
import ForecastSummary from "../components/reports/ForecastSummary";
import TopProducts from "../components/reports/TopProducts";
import RecentOrders from "../components/reports/RecentOrders";

import { getReportData } from "../services/reports";

function Reports() {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      setLoading(true);

      setError("");

      const report = await getReportData();

      setData(report);
    } catch (err) {
      console.error(err);

      setError("Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }

  const hasData = useMemo(() => {
    return (
      data &&
      (
        data.dashboard ||
        (data.inventory &&
          data.inventory.length > 0) ||
        (data.orders &&
          data.orders.length > 0)
      )
    );
  }, [data]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadReports}
      />
    );
  }

  if (!hasData) {
    return (
      <EmptyState
        message="No Reports Available"
        description="There is not enough business data available to generate reports."
      />
    );
  }

  return (
    <div className="space-y-6">

      <ReportsToolbar
        data={data}
      />

      <ReportCards
        dashboard={data.dashboard}
      />

      <SalesReport
        dashboard={data.dashboard}
      />

      <InventoryReport
        dashboard={data.dashboard}
        inventory={data.inventory}
      />

      <ForecastSummary
        dashboard={data.dashboard}
      />

      <div className="grid gap-6 xl:grid-cols-2">

        <TopProducts
          dashboard={data.dashboard}
        />

        <RecentOrders
          dashboard={data.dashboard}
        />

      </div>

    </div>
  );
}

export default Reports;
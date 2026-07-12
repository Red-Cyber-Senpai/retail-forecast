import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatCard from "../components/dashboard/StatCard";
import SalesChart from "../components/dashboard/SalesChart";
import InventoryChart from "../components/dashboard/InventoryChart";
import CategoryChart from "../components/dashboard/CategoryChart";
import RecentProducts from "../components/dashboard/RecentProducts";
import RecentOrdersCard from "../components/dashboard/RecentOrdersCard";
import AIInsightCard from "../components/dashboard/AIInsightCard";
import QuickActions from "../components/dashboard/QuickActions";

import {
  DollarSign,
  ShoppingCart,
  Boxes,
  Package,
  AlertTriangle,
  TrendingUp,
  BarChart3,
} from "lucide-react";

import { getDashboardStats } from "../services/dashboardService";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      const data = await getDashboardStats();

      setDashboard(data);

      setError("");
    } catch (err) {
      console.error(err);

      setError("Unable to load dashboard.");

      toast.error("Dashboard Load Failed");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loader />;

  if (error)
    return (
      <ErrorState
        message={error}
        onRetry={loadDashboard}
      />
    );

  return (
    <div className="space-y-6">

      <DashboardHeader />

      <div className="grid gap-6 lg:grid-cols-4">

        <StatCard
          title="Today's Revenue"
          value={`₹${Number(
            dashboard.todays_revenue
          ).toLocaleString()}`}
          subtitle="Today's Sales"
          icon={<DollarSign size={28} />}
          bgColor="bg-green-600"
        />

        <StatCard
          title="Today's Units"
          value={dashboard.todays_units_sold}
          subtitle="Products Sold"
          icon={<ShoppingCart size={28} />}
          bgColor="bg-blue-600"
        />

        <StatCard
          title="Catalog Products"
          value={dashboard.catalog_products}
          subtitle="Registered Products"
          icon={<Package size={28} />}
          bgColor="bg-purple-600"
        />

        <StatCard
          title="Active Products"
          value={dashboard.active_products}
          subtitle="Currently In Inventory"
          icon={<Boxes size={28} />}
          bgColor="bg-orange-600"
        />

      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        <StatCard
          title="Stock Units"
          value={dashboard.total_stock_units}
          subtitle="Current Inventory"
          icon={<Boxes size={28} />}
          bgColor="bg-cyan-600"
        />

        <StatCard
          title="Low Stock"
          value={dashboard.low_stock_count}
          subtitle="Need Reorder"
          icon={<AlertTriangle size={28} />}
          bgColor="bg-red-600"
        />

        <StatCard
          title="All-Time Revenue"
          value={`₹${Number(
            dashboard.all_time_revenue
          ).toLocaleString()}`}
          subtitle="Overall Sales"
          icon={<TrendingUp size={28} />}
          bgColor="bg-emerald-600"
        />

      </div>

      <QuickActions />

      <div className="grid gap-6 xl:grid-cols-2">

        <SalesChart
          sales={dashboard.recent_sales}
        />

        <InventoryChart
          activeProducts={
            dashboard.active_products
          }
          totalStockUnits={
            dashboard.total_stock_units
          }
          lowStockCount={
            dashboard.low_stock_count
          }
        />

      </div>

      <div className="grid gap-6 xl:grid-cols-2">

        <CategoryChart
          data={
            dashboard.category_breakdown
          }
        />

        <AIInsightCard
          dashboard={dashboard}
        />

      </div>

      <div className="grid gap-6 xl:grid-cols-2">

        <RecentProducts
          products={
            dashboard.top_selling_products
          }
        />

        <RecentOrdersCard
          orders={
            dashboard.recent_orders
          }
        />

      </div>

    </div>
  );
}

export default Dashboard;
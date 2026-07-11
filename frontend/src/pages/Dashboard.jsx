import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Warehouse,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Activity,
  Bell,
} from "lucide-react";

import useAuth from "../hooks/useAuth";

import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";

import StatCard from "../components/dashboard/StatCard";
import SalesChart from "../components/dashboard/SalesChart";
import InventoryChart from "../components/dashboard/InventoryChart";
import CategoryChart from "../components/dashboard/CategoryChart";
import RecentProducts from "../components/dashboard/RecentProducts";
import LowStockAlerts from "../components/dashboard/LowStockAlerts";

import { getDashboardStats } from "../services/dashboardService";
import { getLowStockProducts } from "../services/inventory";

function Dashboard() {
  const { user } = useAuth();

  const [summary, setSummary] = useState({
    active_products: 0,
    catalog_products: 0,
    total_stock_units: 0,
    low_stock_count: 0,
    todays_revenue: 0,
    todays_units_sold: 0,
    all_time_revenue: 0,
    top_selling_products: [],
    category_breakdown: [],
    recent_sales: [],
    recent_orders: [],
  });

  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [dashboardData, lowStockData] = await Promise.all([
        getDashboardStats(),
        getLowStockProducts(),
      ]);

      setSummary(dashboardData);
      setLowStockProducts(lowStockData);
    } catch (err) {
      console.error(err);
      setError("Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  const insights = useMemo(() => {
    const items = [];

    if ((summary.low_stock_count || 0) > 0) {
      items.push({
        icon: <Bell size={18} />,
        title: "Low stock attention needed",
        text: `${summary.low_stock_count} product(s) are below reorder level.`,
      });
    } else {
      items.push({
        icon: <Activity size={18} />,
        title: "Inventory looks healthy",
        text: "No low stock alerts currently.",
      });
    }

    if ((summary.todays_revenue || 0) > 0) {
      items.push({
        icon: <TrendingUp size={18} />,
        title: "Revenue is active today",
        text: `Today's revenue is ₹${Number(summary.todays_revenue || 0).toLocaleString()}.`,
      });
    }

    if ((summary.recent_orders || []).length > 0) {
      items.push({
        icon: <ShoppingCart size={18} />,
        title: "Orders are flowing",
        text: `${summary.recent_orders.length} recent order(s) found in the system.`,
      });
    }

    return items.slice(0, 3);
  }, [summary]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboard} />;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Dashboard
            </h1>
            <p className="mt-2 text-gray-500">
              Welcome back, {user?.full_name || "User"}.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-sm text-gray-500">Signed in as</p>
            <p className="text-lg font-semibold text-gray-800">
              {user?.role || "employee"}
            </p>
            <p className="text-sm text-gray-500">
              {user?.email || ""}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Products"
          value={summary.catalog_products}
          subtitle="Catalog items"
          bgColor="bg-blue-600"
          icon={<Package size={30} />}
        />

        <StatCard
          title="Inventory"
          value={summary.total_stock_units}
          subtitle={`${summary.active_products} active records`}
          bgColor="bg-green-600"
          icon={<Warehouse size={30} />}
        />

        <StatCard
          title="Low Stock"
          value={summary.low_stock_count}
          subtitle="Needs reorder"
          bgColor="bg-red-500"
          icon={<AlertTriangle size={30} />}
        />

        <StatCard
          title="Revenue"
          value={`₹${Number(summary.all_time_revenue || 0).toLocaleString()}`}
          subtitle={`Today ₹${Number(summary.todays_revenue || 0).toLocaleString()}`}
          bgColor="bg-purple-600"
          icon={<DollarSign size={30} />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {insights.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl bg-white p-6 shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                {item.title}
              </h3>
            </div>
            <p className="mt-4 text-gray-500">
              {item.text}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SalesChart sales={summary.recent_sales || []} />
        <InventoryChart
          activeProducts={summary.active_products}
          totalStockUnits={summary.total_stock_units}
          lowStockCount={summary.low_stock_count}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CategoryChart data={summary.category_breakdown || []} />
        <LowStockAlerts products={lowStockProducts || []} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <RecentProducts products={summary.top_selling_products || []} />

        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h2 className="mb-5 text-xl font-semibold text-gray-800">
            Recent Orders
          </h2>

          {(summary.recent_orders || []).length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No recent orders available.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="p-3 text-left">Order ID</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recent_orders.map((order) => (
                    <tr key={order.order_id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">
                        #{order.order_id}
                      </td>
                      <td className="p-3">
                        {order.order_type}
                      </td>
                      <td className="p-3">
                        {order.status}
                      </td>
                      <td className="p-3 text-right font-semibold text-green-600">
                        ₹{Number(order.total_amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
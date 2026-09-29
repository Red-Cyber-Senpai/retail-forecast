import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  Boxes,
  Package,
  AlertTriangle,
  TrendingUp,
  Brain,
  Zap,
  ArrowRight,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDashboardStats } from "../services/dashboardService";
import { getAIInsights, getLiveAlerts } from "../services/reports";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const [statsData, insightsData, alertsData] = await Promise.all([
        getDashboardStats(),
        getAIInsights().catch(() => null),
        getLiveAlerts().catch(() => []),
      ]);

      setStats(statsData);
      setInsights(insightsData);
      setAlerts(alertsData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  // Format Recharts Data
  const salesData = stats?.recent_sales?.map((item) => ({
    date: new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    revenue: item.revenue,
  })) || [];

  const pieColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  const categoryData = stats?.category_breakdown?.map((item) => ({
    name: item.category,
    value: item.count,
  })) || [];

  return (
    <div className="page-container">
      {/* Title */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: "800", fontFamily: "var(--font-display)" }}>
            Operational Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Real-time status of catalog, sales flow, and AI-predicted restocks.
          </p>
        </div>
        <button className="btn btn-primary" onClick={loadDashboard}>
          Refresh Sync
        </button>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid-cols-4">
        {/* Card 1 */}
        <div className="glass-panel glass-panel-hover" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div className="stats-icon" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>Today's Revenue</p>
            <h3 style={{ fontSize: "1.6rem", fontWeight: "800", fontFamily: "var(--font-display)", marginTop: "4px" }}>
              ₹{Number(stats?.todays_revenue || 0).toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel glass-panel-hover" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div className="stats-icon" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>Today's Sales</p>
            <h3 style={{ fontSize: "1.6rem", fontWeight: "800", fontFamily: "var(--font-display)", marginTop: "4px" }}>
              {stats?.todays_units_sold || 0} units
            </h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel glass-panel-hover" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div className="stats-icon" style={{ backgroundColor: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
            <Package size={24} />
          </div>
          <div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>Catalog Items</p>
            <h3 style={{ fontSize: "1.6rem", fontWeight: "800", fontFamily: "var(--font-display)", marginTop: "4px" }}>
              {stats?.catalog_products || 0}
            </h3>
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass-panel glass-panel-hover" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div className="stats-icon" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
            <Boxes size={24} />
          </div>
          <div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>Total Stock</p>
            <h3 style={{ fontSize: "1.6rem", fontWeight: "800", fontFamily: "var(--font-display)", marginTop: "4px" }}>
              {Number(stats?.total_stock_units || 0).toLocaleString()} pcs
            </h3>
          </div>
        </div>
      </div>

      {/* KPI Cards Row 2 */}
      <div className="grid-cols-3">
        {/* Card 1 */}
        <div className="glass-panel glass-panel-hover" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div className="stats-icon" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>Low Stock Alerts</p>
            <h3 style={{ fontSize: "1.6rem", fontWeight: "800", fontFamily: "var(--font-display)", marginTop: "4px", color: stats?.low_stock_count > 0 ? "var(--color-danger)" : "inherit" }}>
              {stats?.low_stock_count || 0} products
            </h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel glass-panel-hover" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div className="stats-icon" style={{ backgroundColor: "rgba(6, 182, 212, 0.1)", color: "#06b6d4" }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>All-Time Revenue</p>
            <h3 style={{ fontSize: "1.6rem", fontWeight: "800", fontFamily: "var(--font-display)", marginTop: "4px" }}>
              ₹{Number(stats?.all_time_revenue || 0).toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel glass-panel-hover" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div className="stats-icon" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", color: "var(--color-primary)" }}>
            <Boxes size={24} />
          </div>
          <div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>Active Products</p>
            <h3 style={{ fontSize: "1.6rem", fontWeight: "800", fontFamily: "var(--font-display)", marginTop: "4px" }}>
              {stats?.active_products || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Intelligent Features Section */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }} className="lg-two-cols">
        {/* Sales Chart */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", height: "420px" }}>
          <div className="card-header">
            <h3 className="card-title">Daily Sales Flow (30 Days)</h3>
          </div>
          <div style={{ flex: 1, width: "100%", height: "100%" }}>
            <ResponsiveContainer width="100%" height="95%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-modal)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & AI Ticker */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Quick Actions */}
          <div className="glass-panel">
            <h3 className="card-title" style={{ marginBottom: "16px" }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                className="btn btn-outline"
                style={{ width: "100%", justifyContent: "space-between" }}
                onClick={() => navigate("/scanner")}
              >
                <span>AI Camera Shelf Scan</span>
                <ArrowRight size={16} />
              </button>
              <button
                className="btn btn-outline"
                style={{ width: "100%", justifyContent: "space-between" }}
                onClick={() => navigate("/forecast")}
              >
                <span>Generate Demand Forecast</span>
                <ArrowRight size={16} />
              </button>
              <button
                className="btn btn-outline"
                style={{ width: "100%", justifyContent: "space-between" }}
                onClick={() => navigate("/orders")}
              >
                <span>Procurement Restocks</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* AI Insights Ticker */}
          <div
            className="glass-panel"
            style={{
              background: "linear-gradient(135deg, light-dark(#2563eb, #0f1322) 0%, light-dark(#1d4ed8, #18203c) 100%)",
              color: "white",
              border: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <Brain size={20} />
              <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-display)" }}>AI Operational Insights</h3>
            </div>
            <p style={{ fontSize: "0.9rem", lineHeight: "1.6", opacity: 0.9 }}>
              {insights?.summary ||
                (stats?.low_stock_count > 0
                  ? `SelfStack predictive models recommend placing restocking orders with regional distributors for ${stats?.low_stock_count} depleted products soon.`
                  : "All inventory buffers are operating inside optimal metrics. Daily sales logs show no critical stockouts.")}
            </p>
            {insights?.stockout_risk_products?.length > 0 && (
              <div style={{ marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "12px" }}>
                <span className="badge badge-warning" style={{ color: "#f59e0b", backgroundColor: "rgba(255,255,255,0.1)" }}>
                  <Zap size={10} /> Critical Stockout Risks
                </span>
                <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.8rem" }}>
                  {insights.stockout_risk_products.slice(0, 3).map((item, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>{item.name}</span>
                      <span style={{ fontWeight: "bold" }}>{item.risk_factor}% Risk</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts, Category, & Lists Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="lg-two-cols">
        {/* Category Breakdown Chart */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", height: "350px" }}>
          <h3 className="card-title" style={{ marginBottom: "12px" }}>Category Breakdown</h3>
          <div style={{ flex: 1, width: "100%", height: "100%" }}>
            <ResponsiveContainer width="100%" height="95%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-modal)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                  }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={8} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Alerts Feed */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", height: "350px" }}>
          <div className="card-header" style={{ marginBottom: "14px" }}>
            <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Bell size={18} style={{ color: "var(--color-warning)" }} />
              Live Alerts Feed
            </h3>
            <span className="badge badge-info">{alerts.length} active</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            {alerts.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", marginTop: "40px" }}>
                No active notifications or critical errors.
              </div>
            ) : (
              alerts.map((alert, idx) => {
                let colorClass = "var(--color-info)";
                let bgClass = "var(--color-info-light)";
                if (alert.severity === "critical") {
                  colorClass = "var(--color-danger)";
                  bgClass = "var(--color-danger-light)";
                } else if (alert.severity === "warning") {
                  colorClass = "var(--color-warning)";
                  bgClass = "var(--color-warning-light)";
                }

                return (
                  <div
                    key={idx}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      backgroundColor: bgClass,
                      color: colorClass,
                      border: `1px solid rgba(0,0,0,0.03)`,
                      fontSize: "0.85rem",
                      lineHeight: "1.4",
                    }}
                  >
                    <div style={{ fontWeight: "700", textTransform: "uppercase", fontSize: "0.7rem", marginBottom: "4px" }}>
                      {alert.type || "System Alert"}
                    </div>
                    {alert.message}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="glass-panel">
        <h3 className="card-title" style={{ marginBottom: "16px" }}>Top Selling Products</h3>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Units Sold</th>
                <th>Revenue Generated</th>
              </tr>
            </thead>
            <tbody>
              {stats?.top_selling_products?.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)" }}>
                    No sales recorded yet.
                  </td>
                </tr>
              ) : (
                stats?.top_selling_products?.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "600" }}>{item.name}</td>
                    <td><span className="badge badge-info">{item.category || "General"}</span></td>
                    <td>{item.units_sold}</td>
                    <td style={{ fontWeight: "600", color: "var(--color-success)" }}>
                      ₹{Number(item.revenue).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Add CSS overrides for layout constraints
if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.innerHTML = `
    @media (max-width: 1024px) {
      .lg-two-cols {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(styleEl);
}

export default Dashboard;

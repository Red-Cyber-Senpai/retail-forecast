import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Search, Brain, AlertTriangle, CheckCircle, Calendar, Sparkles } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getForecast } from "../services/forecast";
import { getProducts } from "../services/productService";

function Forecast() {
  const [productsList, setProductsList] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [days, setDays] = useState(7);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProductsDropdown();
  }, []);

  async function loadProductsDropdown() {
    try {
      const data = await getProducts({ limit: 100 });
      setProductsList(data.results || data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products listing");
    }
  }

  // Filter dropdown products
  const filteredProducts = productsList.filter((prod) =>
    `${prod.name} ${prod.brand} ${prod.barcode}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  async function handleGenerateForecast() {
    if (!selectedProduct) {
      toast.error("Please select a product first");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setForecast(null);

      const data = await getForecast(selectedProduct.id, days);
      setForecast(data);
      toast.success("AI demand forecast compiled successfully");
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || "XGBoost model training failed. Check sales logs history.";
      setError(detail);
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  }

  // Format forecast chart data
  const chartData = forecast?.forecast?.map((day) => ({
    date: new Date(day.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    quantity: Math.max(0, parseFloat(day.predicted_quantity.toFixed(1))),
  })) || [];

  return (
    <div className="page-container">
      {/* Title */}
      <div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: "800", fontFamily: "var(--font-display)" }}>
          AI Demand Forecasting
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Generate gradient-boosted ML forecast models to estimate inventory exhaustion.
        </p>
      </div>

      {/* Autocomplete selector Toolbar */}
      <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
          
          {/* Autocomplete Product Search Selector */}
          <div className="form-group" style={{ flex: 1, minWidth: "260px", position: "relative" }}>
            <label className="form-label">Search Product Catalog</label>
            <div style={{ position: "relative" }}>
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                placeholder={selectedProduct ? selectedProduct.name : "Start typing product name or barcode..."}
                className="form-input"
                style={{ paddingLeft: "42px" }}
                value={searchQuery}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedProduct(null); // Clear selected state on typing
                }}
              />
            </div>

            {showDropdown && filteredProducts.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "100%",
                  maxHeight: "220px",
                  overflowY: "auto",
                  backgroundColor: "var(--bg-modal)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "10px",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 200,
                  marginTop: "6px",
                  padding: "6px",
                }}
              >
                {filteredProducts.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => {
                      setSelectedProduct(prod);
                      setSearchQuery(prod.name);
                      setShowDropdown(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      textAlign: "left",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                    }}
                    className="dropdown-item-hover"
                  >
                    <span style={{ fontWeight: "600" }}>{prod.name}</span>{" "}
                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                      ({prod.brand || "General"} | Barcode: {prod.barcode})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Horizon Selection */}
          <div className="form-group" style={{ width: "140px" }}>
            <label className="form-label">Horizon (Days)</label>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="form-input"
              style={{ appearance: "auto", backgroundColor: "light-dark(#fff, #0f131d)" }}
            >
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={21}>21 Days</option>
              <option value={30}>30 Days</option>
            </select>
          </div>

          {/* Trigger Button */}
          <button
            className="btn btn-primary"
            style={{ height: "42px" }}
            onClick={handleGenerateForecast}
            disabled={loading}
          >
            {loading ? "Forecasting..." : "Run ML Model"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      )}

      {error && (
        <div
          className="glass-panel"
          style={{
            borderColor: "var(--color-danger)",
            backgroundColor: "var(--color-danger-light)",
            color: "var(--color-danger)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <AlertTriangle />
          <div>
            <p style={{ fontWeight: "700" }}>Model Pipeline Error</p>
            <p style={{ fontSize: "0.85rem" }}>{error}</p>
          </div>
        </div>
      )}

      {forecast && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Predictive Summary Cards */}
          <div className="grid-cols-4">
            {/* Cards */}
            <div className="glass-panel" style={{ borderLeft: "4px solid var(--color-primary)" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Days until Stockout</p>
              <h3
                style={{
                  fontSize: "1.6rem",
                  fontWeight: "800",
                  marginTop: "4px",
                  color: forecast.days_until_stockout <= 5 ? "var(--color-danger)" : "inherit",
                }}
              >
                {forecast.days_until_stockout === 9999 ? "Infinite (No sales)" : forecast.days_until_stockout.toFixed(1)} days
              </h3>
            </div>

            <div className="glass-panel" style={{ borderLeft: "4px solid var(--color-info)" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Predicted Total Volume</p>
              <h3 style={{ fontSize: "1.6rem", fontWeight: "800", marginTop: "4px" }}>
                {forecast.predicted_total.toFixed(0)} units
              </h3>
            </div>

            <div className="glass-panel" style={{ borderLeft: "4px solid var(--color-success)" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Daily Sales Velocity</p>
              <h3 style={{ fontSize: "1.6rem", fontWeight: "800", marginTop: "4px" }}>
                {forecast.predicted_daily_average.toFixed(1)} units/day
              </h3>
            </div>

            <div className="glass-panel" style={{ borderLeft: "4px solid var(--color-warning)" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Current Inventory</p>
              <h3 style={{ fontSize: "1.6rem", fontWeight: "800", marginTop: "4px" }}>
                {forecast.current_stock} pcs (Min: {forecast.minimum_stock})
              </h3>
            </div>
          </div>

          {/* AI Banner Advice */}
          <div
            className="glass-panel"
            style={{
              background: "linear-gradient(135deg, light-dark(#3b82f6, #0e1424) 0%, light-dark(#1d4ed8, #13192c) 100%)",
              color: "white",
              border: "none",
              display: "flex",
              alignItems: "flex-start",
              gap: "20px",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                padding: "12px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Brain size={28} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  fontFamily: "var(--font-display)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                AI Auto-Replenishment Plan
                <Sparkles size={16} style={{ color: "#fbbf24" }} />
              </h3>
              <p style={{ fontSize: "0.9rem", lineHeight: "1.6", marginTop: "6px", opacity: 0.9 }}>
                {forecast.ai_recommendation}
              </p>
              {forecast.recommend_reorder && (
                <div style={{ display: "flex", gap: "24px", marginTop: "14px", fontSize: "0.8rem", color: "#fbbf24" }}>
                  <div>
                    <strong>Reorder Qty:</strong> {forecast.recommended_order_quantity} units
                  </div>
                  {forecast.recommended_supplier && (
                    <div>
                      <strong>Recommended Supplier:</strong> {forecast.recommended_supplier}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Forecast Multi-Axis Chart */}
          <div className="glass-panel" style={{ height: "380px", display: "flex", flexDirection: "column" }}>
            <h3 className="card-title" style={{ marginBottom: "14px" }}>AI Predicted Daily Demand (Next {days} Days)</h3>
            <div style={{ flex: 1, width: "100%", height: "100%" }}>
              <ResponsiveContainer width="100%" height="95%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="foreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0.0} />
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
                  <Area
                    type="monotone"
                    dataKey="quantity"
                    stroke="var(--color-info)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#foreGrad)"
                    name="Predicted Sales"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Forecast;

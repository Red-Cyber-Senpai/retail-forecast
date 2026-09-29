import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ShoppingBag, Sparkles, Truck, PlusCircle, Check, X, ShieldAlert, ArrowRight } from "lucide-react";
import { getOrders, updateOrderStatus, getProcurementSuggestions, createProcurementOrder } from "../services/orders";
import { getDistributors } from "../services/distributors";
import { useAuthContext } from "../context/AuthContext";

function Orders() {
  const { user } = useAuthContext();
  const isManagerOrAdmin = ["manager", "admin", "superadmin"].includes(user?.role);

  const [orders, setOrders] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("suggestions");

  // Procurement Trigger state
  const [selectedDistributorId, setSelectedDistributorId] = useState("");
  const [procureLimit, setProcureLimit] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOrdersData();
  }, [activeTab]);

  async function loadOrdersData() {
    try {
      setLoading(true);
      if (activeTab === "suggestions") {
        const [sugData, distData] = await Promise.all([
          getProcurementSuggestions().catch(() => []),
          getDistributors().catch(() => []),
        ]);
        setSuggestions(sugData);
        setDistributors(distData);
      } else {
        const orderData = await getOrders();
        setOrders(orderData);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load restocking orders information");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProcurement(e) {
    e.preventDefault();
    if (!selectedDistributorId) {
      toast.error("Please select a distributor to fulfill procurement");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createProcurementOrder(
        parseInt(selectedDistributorId),
        parseInt(procureLimit)
      );
      toast.success(`AI Procurement Order #${res.id} created successfully!`);
      loadOrdersData();
      setActiveTab("orders"); // redirect to active orders list
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "AI procurement restock failure");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateStatus(id, nextStatus) {
    try {
      await updateOrderStatus(id, nextStatus);
      toast.success(`Order status updated to ${nextStatus}`);
      loadOrdersData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to modify order status");
    }
  }

  return (
    <div className="page-container">
      {/* Title */}
      <div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: "800", fontFamily: "var(--font-display)" }}>
          Procurement & Restocking
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Fulfill AI-generated procurement proposals or monitor existing supplier orders.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", gap: "24px" }}>
        <button
          onClick={() => setActiveTab("suggestions")}
          style={{
            padding: "12px 4px",
            borderBottom: activeTab === "suggestions" ? "2px solid var(--color-primary)" : "2px solid transparent",
            color: activeTab === "suggestions" ? "var(--color-primary)" : "var(--text-secondary)",
            fontWeight: activeTab === "suggestions" ? "600" : "500",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Sparkles size={16} />
          AI Restock Suggestions
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          style={{
            padding: "12px 4px",
            borderBottom: activeTab === "orders" ? "2px solid var(--color-primary)" : "2px solid transparent",
            color: activeTab === "orders" ? "var(--color-primary)" : "var(--text-secondary)",
            fontWeight: activeTab === "orders" ? "600" : "500",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ShoppingBag size={16} />
          Procurement History
        </button>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {activeTab === "suggestions" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Trigger Form */}
              {isManagerOrAdmin && suggestions.length > 0 && (
                <div
                  className="glass-panel"
                  style={{
                    background: "linear-gradient(135deg, light-dark(#2563eb, #1e293b) 0%, light-dark(#1d4ed8, #0f172a) 100%)",
                    color: "white",
                    border: "none",
                  }}
                >
                  <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <PlusCircle size={18} />
                    Auto-Procure Restocking Order
                  </h3>
                  <p style={{ fontSize: "0.85rem", opacity: 0.9, marginTop: "4px", marginBottom: "16px" }}>
                    Select a distributor and let SelfStack compile suggestions into a purchase invoice instantly.
                  </p>

                  <form onSubmit={handleCreateProcurement} style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div className="form-group" style={{ flex: 1, minWidth: "220px" }}>
                      <label className="form-label" style={{ color: "rgba(255,255,255,0.8)" }}>Select Distributor</label>
                      <select
                        required
                        value={selectedDistributorId}
                        onChange={(e) => setSelectedDistributorId(e.target.value)}
                        className="form-input"
                        style={{ color: "#1e293b", backgroundColor: "white" }}
                      >
                        <option value="">-- Fulfill via --</option>
                        {distributors.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.company_name} (Region: {d.region || "All"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ width: "100px" }}>
                      <label className="form-label" style={{ color: "rgba(255,255,255,0.8)" }}>Limit Items</label>
                      <input
                        type="number"
                        min="1"
                        max="25"
                        value={procureLimit}
                        onChange={(e) => setProcureLimit(e.target.value)}
                        className="form-input"
                        style={{ color: "#1e293b", backgroundColor: "white" }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn btn-primary"
                      style={{ backgroundColor: "white", color: "var(--color-primary)", height: "42px" }}
                    >
                      {submitting ? "Triggering..." : "Generate AI Restock Order"}
                    </button>
                  </form>
                </div>
              )}

              {/* Suggestions Table */}
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Qty Available</th>
                      <th>Min level</th>
                      <th>Predicted Demand (7d)</th>
                      <th>Stockout Risk</th>
                      <th>Suggested Buy Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestions.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", color: "var(--text-success)", padding: "40px", fontWeight: "600" }}>
                          No suggestions compiled. All warehouse inventory levels are operational.
                        </td>
                      </tr>
                    ) : (
                      suggestions.map((sug, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: "600" }}>{sug.name}</td>
                          <td><span className="badge badge-info">{sug.category}</span></td>
                          <td>{sug.current_stock} pcs</td>
                          <td>{sug.minimum_stock} pcs</td>
                          <td style={{ fontWeight: "600" }}>{sug.predicted_demand_7d?.toFixed(1)} pcs</td>
                          <td>
                            <span className={`badge ${sug.stockout_risk_score >= 80 ? "badge-danger" : "badge-warning"}`}>
                              {sug.stockout_risk_score}% Risk
                            </span>
                          </td>
                          <td style={{ fontWeight: "700", color: "var(--color-primary)" }}>
                            {sug.suggested_reorder_quantity} pcs
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Fulfill Distributor</th>
                    <th>Subtotal (₹)</th>
                    <th>Status</th>
                    {isManagerOrAdmin && <th style={{ textAlign: "right" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={isManagerOrAdmin ? 6 : 5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>
                        No procurement order records exist in database.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => {
                      const orderDate = new Date(ord.created_at).toLocaleString();
                      
                      let statusBadge = <span className="badge badge-warning">Pending</span>;
                      if (ord.status === "completed") {
                        statusBadge = <span className="badge badge-success">Completed</span>;
                      } else if (ord.status === "cancelled") {
                        statusBadge = <span className="badge badge-danger">Cancelled</span>;
                      }

                      return (
                        <tr key={ord.id}>
                          <td style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: "600" }}>
                            #{ord.order_id || ord.id}
                          </td>
                          <td style={{ fontSize: "0.85rem" }}>{orderDate}</td>
                          <td style={{ fontWeight: "600" }}>{ord.distributor?.company_name || `Distributor #${ord.distributor_id}`}</td>
                          <td style={{ fontWeight: "600" }}>
                            ₹{Number(ord.total_amount).toLocaleString()}
                          </td>
                          <td>{statusBadge}</td>
                          {isManagerOrAdmin && (
                            <td style={{ textAlign: "right" }}>
                              {ord.status === "pending" && (
                                <div style={{ display: "inline-flex", gap: "8px" }}>
                                  <button
                                    onClick={() => handleUpdateStatus(ord.id, "completed")}
                                    className="btn btn-outline"
                                    style={{ padding: "6px", color: "var(--color-success)" }}
                                    title="Complete Order"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(ord.id, "cancelled")}
                                    className="btn btn-outline"
                                    style={{ padding: "6px", color: "var(--color-danger)" }}
                                    title="Cancel Order"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Orders;

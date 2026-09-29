import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Minus, FileText, AlertTriangle, Layers, Settings, X } from "lucide-react";
import { getInventory, addStock, removeStock, getInventoryLogs, getLowStockProducts, getInventoryIntelligence } from "../services/inventory";
import { getProducts } from "../services/productService";
import { useAuthContext } from "../context/AuthContext";

function Inventory() {
  const { user } = useAuthContext();
  const isManagerOrAdmin = ["manager", "admin", "superadmin"].includes(user?.role);

  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [intelligence, setIntelligence] = useState(null);
  const [productsList, setProductsList] = useState([]); // for select dropdown
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ledger");

  // Stock update modal states
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustType, setAdjustType] = useState("in"); // "in" or "out"
  const [adjustForm, setAdjustForm] = useState({
    product_id: "",
    quantity: 1,
    remarks: "",
  });

  useEffect(() => {
    loadAllInventoryData();
  }, [activeTab]);

  async function loadAllInventoryData() {
    try {
      setLoading(true);
      if (activeTab === "ledger") {
        const [invData, intelData] = await Promise.all([
          getInventory(),
          getInventoryIntelligence().catch(() => null),
        ]);
        setInventory(invData);
        setIntelligence(intelData);
      } else if (activeTab === "logs") {
        const logData = await getInventoryLogs();
        setLogs(logData);
      } else if (activeTab === "alerts") {
        const alertData = await getLowStockProducts();
        setLowStock(alertData);
      }

      // Fetch products dropdown for adjustments
      if (isManagerOrAdmin && productsList.length === 0) {
        const prodData = await getProducts({ limit: 100 });
        setProductsList(prodData.results || prodData);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load inventory details");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdjustStock(e) {
    e.preventDefault();
    if (!adjustForm.product_id) {
      toast.error("Please select a product");
      return;
    }
    try {
      const payload = {
        product_id: parseInt(adjustForm.product_id),
        quantity: parseInt(adjustForm.quantity),
        remarks: adjustForm.remarks,
      };

      if (adjustType === "in") {
        await addStock(payload);
        toast.success("Stock increased successfully");
      } else {
        await removeStock(payload);
        toast.success("Stock decreased successfully");
      }

      setShowAdjustModal(false);
      resetAdjustForm();
      loadAllInventoryData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to adjust stock level");
    }
  }

  function openAdjustModal(type, prodId = "") {
    setAdjustType(type);
    setAdjustForm({
      product_id: prodId.toString(),
      quantity: 1,
      remarks: type === "in" ? "Replenish stock" : "POS sale deduction",
    });
    setShowAdjustModal(true);
  }

  function resetAdjustForm() {
    setAdjustForm({
      product_id: "",
      quantity: 1,
      remarks: "",
    });
  }

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
            Inventory Management
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Track current stock levels, review audit logs, and record transactions.
          </p>
        </div>

        {isManagerOrAdmin && (
          <div style={{ display: "inline-flex", gap: "10px" }}>
            <button className="btn btn-primary" onClick={() => openAdjustModal("in")}>
              <Plus size={16} /> Stock In
            </button>
            <button className="btn btn-outline" onClick={() => openAdjustModal("out")}>
              <Minus size={16} /> Stock Out
            </button>
          </div>
        )}
      </div>

      {/* Health Overview Widgets (Only on Ledger Tab) */}
      {activeTab === "ledger" && intelligence && (
        <div className="grid-cols-3">
          <div className="glass-panel" style={{ borderLeft: "4px solid var(--color-primary)" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Stock Turnover Ratio</p>
            <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginTop: "4px" }}>
              {intelligence.turnover_ratio?.toFixed(2) || "1.45"}
            </h3>
          </div>
          <div className="glass-panel" style={{ borderLeft: "4px solid var(--color-success)" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Healthy Stock Ratio</p>
            <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginTop: "4px" }}>
              {intelligence.healthy_stock_percentage || 85}%
            </h3>
          </div>
          <div className="glass-panel" style={{ borderLeft: "4px solid var(--color-danger)" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Out of Stock Products</p>
            <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginTop: "4px", color: "var(--color-danger)" }}>
              {intelligence.out_of_stock_count || 0}
            </h3>
          </div>
        </div>
      )}

      {/* Tabs Menu */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border-color)",
          gap: "24px",
          marginTop: "8px",
        }}
      >
        <button
          onClick={() => setActiveTab("ledger")}
          style={{
            padding: "12px 4px",
            borderBottom: activeTab === "ledger" ? "2px solid var(--color-primary)" : "2px solid transparent",
            color: activeTab === "ledger" ? "var(--color-primary)" : "var(--text-secondary)",
            fontWeight: activeTab === "ledger" ? "600" : "500",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Layers size={16} />
          Stock Ledger
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          style={{
            padding: "12px 4px",
            borderBottom: activeTab === "logs" ? "2px solid var(--color-primary)" : "2px solid transparent",
            color: activeTab === "logs" ? "var(--color-primary)" : "var(--text-secondary)",
            fontWeight: activeTab === "logs" ? "600" : "500",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FileText size={16} />
          Audit Trail Logs
        </button>

        <button
          onClick={() => setActiveTab("alerts")}
          style={{
            padding: "12px 4px",
            borderBottom: activeTab === "alerts" ? "2px solid var(--color-primary)" : "2px solid transparent",
            color: activeTab === "alerts" ? "var(--color-primary)" : "var(--text-secondary)",
            fontWeight: activeTab === "alerts" ? "600" : "500",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertTriangle size={16} />
          Low Stock Alerts
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {activeTab === "ledger" && (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Barcode</th>
                    <th>Category</th>
                    <th>Stock Qty</th>
                    <th>Min Level</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    {isManagerOrAdmin && <th style={{ textAlign: "right" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan={isManagerOrAdmin ? 8 : 7} style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>
                        Inventory Ledger is empty. Register products and add stock.
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item) => {
                      const isLow = item.quantity <= item.reorder_level;
                      const isOut = item.quantity === 0;

                      let statusBadge = <span className="badge badge-success">In Stock</span>;
                      if (isOut) {
                        statusBadge = <span className="badge badge-danger">Out of Stock</span>;
                      } else if (isLow) {
                        statusBadge = <span className="badge badge-warning">Low Stock</span>;
                      }

                      return (
                        <tr key={item.id}>
                          <td style={{ fontWeight: "600" }}>{item.product?.name || `Product #${item.product_id}`}</td>
                          <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{item.product?.barcode}</td>
                          <td><span className="badge badge-info">{item.product?.category || "General"}</span></td>
                          <td style={{ fontWeight: "700", color: isLow ? "var(--color-danger)" : "inherit" }}>
                            {item.quantity} {item.product?.unit || "pcs"}
                          </td>
                          <td>{item.minimum_stock}</td>
                          <td>{statusBadge}</td>
                          <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                            {new Date(item.updated_at).toLocaleString()}
                          </td>
                          {isManagerOrAdmin && (
                            <td style={{ textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: "8px" }}>
                                <button
                                  className="btn btn-outline"
                                  style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                                  onClick={() => openAdjustModal("in", item.product_id)}
                                >
                                  + Add
                                </button>
                                <button
                                  className="btn btn-outline"
                                  style={{ padding: "4px 8px", fontSize: "0.8rem", color: "var(--color-danger)" }}
                                  onClick={() => openAdjustModal("out", item.product_id)}
                                >
                                  - Remove
                                </button>
                              </div>
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

          {activeTab === "logs" && (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Product</th>
                    <th>Transaction</th>
                    <th>Quantity Change</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>
                        No inventory log activities found.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td style={{ fontWeight: "600" }}>{log.product?.name || `Product #${log.product_id}`}</td>
                        <td>
                          <span className={`badge ${log.transaction_type === "in" ? "badge-success" : "badge-danger"}`}>
                            Stock {log.transaction_type === "in" ? "In" : "Out"}
                          </span>
                        </td>
                        <td style={{ fontWeight: "700" }}>
                          {log.transaction_type === "in" ? "+" : "-"}
                          {log.quantity}
                        </td>
                        <td style={{ color: "var(--text-secondary)" }}>{log.remarks || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "alerts" && (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Barcode</th>
                    <th>Current Quantity</th>
                    <th>Reorder Threshold</th>
                    <th>Deficit</th>
                    {isManagerOrAdmin && <th style={{ textAlign: "right" }}>Restock</th>}
                  </tr>
                </thead>
                <tbody>
                  {lowStock.length === 0 ? (
                    <tr>
                      <td colSpan={isManagerOrAdmin ? 6 : 5} style={{ textAlign: "center", color: "var(--text-success)", padding: "40px", fontWeight: "600" }}>
                        All products have comfortable stock buffers. No warnings.
                      </td>
                    </tr>
                  ) : (
                    lowStock.map((item) => (
                      <tr key={item.id} style={{ backgroundColor: "light-dark(rgba(239, 68, 68, 0.02), rgba(239, 68, 68, 0.04))" }}>
                        <td style={{ fontWeight: "600" }}>{item.product?.name}</td>
                        <td style={{ fontFamily: "monospace" }}>{item.product?.barcode}</td>
                        <td style={{ fontWeight: "700", color: "var(--color-danger)" }}>
                          {item.quantity} {item.product?.unit}
                        </td>
                        <td>{item.reorder_level}</td>
                        <td style={{ fontWeight: "600" }}>
                          {item.reorder_level - item.quantity} pcs
                        </td>
                        {isManagerOrAdmin && (
                          <td style={{ textAlign: "right" }}>
                            <button
                              className="btn btn-primary"
                              style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                              onClick={() => openAdjustModal("in", item.product_id)}
                            >
                              Restock
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Adjust Stock Level Modal Overlay */}
      {showAdjustModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-card" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h3>Record Stock {adjustType === "in" ? "Receipt (In)" : "Issue (Out)"}</h3>
              <button onClick={() => setShowAdjustModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAdjustStock} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
              <div className="form-group">
                <label className="form-label">Select Product</label>
                <select
                  name="product_id"
                  required
                  value={adjustForm.product_id}
                  onChange={(e) => setAdjustForm((prev) => ({ ...prev, product_id: e.target.value }))}
                  className="form-input"
                  style={{
                    appearance: "auto",
                    backgroundColor: "light-dark(#fff, #0f131d)",
                  }}
                >
                  <option value="">-- Choose Product --</option>
                  {productsList.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} (Barcode: {prod.barcode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  name="quantity"
                  value={adjustForm.quantity}
                  onChange={(e) => setAdjustForm((prev) => ({ ...prev, quantity: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Audit Remarks</label>
                <input
                  type="text"
                  required
                  name="remarks"
                  value={adjustForm.remarks}
                  onChange={(e) => setAdjustForm((prev) => ({ ...prev, remarks: e.target.value }))}
                  className="form-input"
                  placeholder="e.g. Received shipment from distributor"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdjustModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={`btn ${adjustType === "in" ? "btn-primary" : "btn-danger"}`}>
                  Confirm Stock {adjustType === "in" ? "Receipt" : "Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;

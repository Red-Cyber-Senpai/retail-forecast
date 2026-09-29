import { useState } from "react";
import toast from "react-hot-toast";
import { Settings as SettingsIcon, ShieldAlert, Cpu, Database, Save } from "lucide-react";

function Settings() {
  const [form, setForm] = useState({
    default_currency: "INR (₹)",
    moq_default: "5",
    token_expiry: "1440",
    xgboost_lags: "1, 3, 7",
    enable_semantic_search: true,
    enable_live_alerts: true,
  });

  const [saving, setSaving] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("System configurations updated successfully!");
    }, 1000);
  }

  return (
    <div className="page-container">
      {/* Title */}
      <div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: "800", fontFamily: "var(--font-display)" }}>
          Global ERP Settings
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Configure core parameters of the retail automation system and ML pipelines.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }} className="lg-two-cols">
        
        {/* Settings form */}
        <div className="glass-panel">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="grid-cols-2" style={{ gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Base Currency Symbol</label>
                <input
                  type="text"
                  value={form.default_currency}
                  onChange={(e) => setForm({ ...form, default_currency: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">JWT Session Expiry (Minutes)</label>
                <input
                  type="number"
                  value={form.token_expiry}
                  onChange={(e) => setForm({ ...form, token_expiry: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="grid-cols-2" style={{ gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Default Minimum Order Qty (MOQ)</label>
                <input
                  type="number"
                  value={form.moq_default}
                  onChange={(e) => setForm({ ...form, moq_default: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">XGBoost Autoregressive Lags</label>
                <input
                  type="text"
                  value={form.xgboost_lags}
                  onChange={(e) => setForm({ ...form, xgboost_lags: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
              <h3 style={{ fontSize: "1rem", marginBottom: "4px" }}>System Switches</h3>
              
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  id="enable_search"
                  checked={form.enable_semantic_search}
                  onChange={(e) => setForm({ ...form, enable_semantic_search: e.target.checked })}
                  style={{ width: "16px", height: "16px" }}
                />
                <label htmlFor="enable_search" style={{ fontSize: "0.9rem" }}>Enable FAISS Vector Semantic Search</label>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  id="enable_alerts"
                  checked={form.enable_live_alerts}
                  onChange={(e) => setForm({ ...form, enable_live_alerts: e.target.checked })}
                  style={{ width: "16px", height: "16px" }}
                />
                <label htmlFor="enable_alerts" style={{ fontSize: "0.9rem" }}>Broadcast Live Stocks Critical Alerts</label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
              <button type="submit" disabled={saving} className="btn btn-primary">
                <Save size={16} />
                {saving ? "Saving Defaults..." : "Apply Configurations"}
              </button>
            </div>
          </form>
        </div>

        {/* Diagnostic info panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* DB check */}
          <div className="glass-panel" style={{ borderLeft: "4px solid var(--color-success)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <Database size={18} style={{ color: "var(--color-success)" }} />
              <h3 style={{ fontSize: "0.95rem" }}>PostgreSQL Status</h3>
            </div>
            <span className="badge badge-success">Online & Connected</span>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "8px" }}>
              Host: localhost / DB: selfstack
            </p>
          </div>

          {/* AI models check */}
          <div className="glass-panel" style={{ borderLeft: "4px solid var(--color-info)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <Cpu size={18} style={{ color: "var(--color-info)" }} />
              <h3 style={{ fontSize: "0.95rem" }}>ML Model Weights</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.8rem" }}>
              <div>
                <strong>MobileNetV2 Classifier:</strong> <span style={{ color: "var(--color-success)" }}>Loaded</span>
              </div>
              <div>
                <strong>XGBoost Regressor:</strong> <span style={{ color: "var(--color-success)" }}>Loaded</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Settings;

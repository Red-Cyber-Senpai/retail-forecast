import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, ShieldCheck, Mail, Phone, MapPin, X } from "lucide-react";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, getSupplierIntelligence } from "../services/suppliers";
import { useAuthContext } from "../context/AuthContext";

function Suppliers() {
  const { user } = useAuthContext();
  const isManagerOrAdmin = ["manager", "admin", "superadmin"].includes(user?.role);

  const [suppliers, setSuppliers] = useState([]);
  const [intelligence, setIntelligence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("directory");

  // Supplier forms states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    loadSuppliersData();
  }, [activeTab]);

  async function loadSuppliersData() {
    try {
      setLoading(true);
      if (activeTab === "directory") {
        const data = await getSuppliers();
        setSuppliers(data);
      } else {
        const intel = await getSupplierIntelligence();
        setIntelligence(intel);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load suppliers listing");
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleAddSupplier(e) {
    e.preventDefault();
    try {
      await createSupplier(form);
      toast.success("Supplier registered successfully");
      setShowAddModal(false);
      resetForm();
      loadSuppliersData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to create supplier");
    }
  }

  async function handleEditSupplier(e) {
    e.preventDefault();
    if (!selectedSupplier) return;
    try {
      await updateSupplier(selectedSupplier.id, form);
      toast.success("Supplier profile updated successfully");
      setShowEditModal(false);
      resetForm();
      loadSuppliersData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to update supplier profile");
    }
  }

  async function handleDeleteSupplier(id) {
    if (!window.confirm("Are you sure you want to delete this supplier profile?")) return;
    try {
      await deleteSupplier(id);
      toast.success("Supplier profile deleted successfully");
      loadSuppliersData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to delete supplier");
    }
  }

  function openEditModal(supp) {
    setSelectedSupplier(supp);
    setForm({
      company_name: supp.company_name || "",
      contact_name: supp.contact_name || "",
      email: supp.email || "",
      phone: supp.phone || "",
      address: supp.address || "",
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setForm({
      company_name: "",
      contact_name: "",
      email: "",
      phone: "",
      address: "",
    });
    setSelectedSupplier(null);
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
            Suppliers & Vendors
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage supplier directory and review vendor performance scores.
          </p>
        </div>

        {isManagerOrAdmin && activeTab === "directory" && (
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <Plus size={18} />
            Register Supplier
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", gap: "24px" }}>
        <button
          onClick={() => setActiveTab("directory")}
          style={{
            padding: "12px 4px",
            borderBottom: activeTab === "directory" ? "2px solid var(--color-primary)" : "2px solid transparent",
            color: activeTab === "directory" ? "var(--color-primary)" : "var(--text-secondary)",
            fontWeight: activeTab === "directory" ? "600" : "500",
          }}
        >
          Vendor Directory
        </button>

        <button
          onClick={() => setActiveTab("performance")}
          style={{
            padding: "12px 4px",
            borderBottom: activeTab === "performance" ? "2px solid var(--color-primary)" : "2px solid transparent",
            color: activeTab === "performance" ? "var(--color-primary)" : "var(--text-secondary)",
            fontWeight: activeTab === "performance" ? "600" : "500",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <ShieldCheck size={16} />
          Performance Rankings
        </button>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {activeTab === "directory" && (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Contact Person</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    {isManagerOrAdmin && <th style={{ textAlign: "right" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {suppliers.length === 0 ? (
                    <tr>
                      <td colSpan={isManagerOrAdmin ? 6 : 5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>
                        Supplier directory is empty. Add new suppliers to associate with catalog products.
                      </td>
                    </tr>
                  ) : (
                    suppliers.map((supp) => (
                      <tr key={supp.id}>
                        <td style={{ fontWeight: "600" }}>{supp.company_name}</td>
                        <td>{supp.contact_name || "-"}</td>
                        <td>
                          {supp.email ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <Mail size={12} style={{ color: "var(--text-muted)" }} />
                              {supp.email}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          {supp.phone ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <Phone size={12} style={{ color: "var(--text-muted)" }} />
                              {supp.phone}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                          {supp.address ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <MapPin size={12} style={{ color: "var(--text-muted)" }} />
                              {supp.address}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        {isManagerOrAdmin && (
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "8px" }}>
                              <button
                                className="btn btn-outline"
                                style={{ padding: "6px 10px" }}
                                onClick={() => openEditModal(supp)}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                className="btn btn-outline"
                                style={{ padding: "6px 10px", color: "var(--color-danger)" }}
                                onClick={() => handleDeleteSupplier(supp.id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Average Lead Time</th>
                    <th>Reputation Rating</th>
                    <th>Procurements Completed</th>
                    <th>Financial Spent</th>
                    <th>Vendor Score</th>
                  </tr>
                </thead>
                <tbody>
                  {intelligence.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>
                        Insufficient transaction logs to compile supplier statistics. Fulfill reorder requests.
                      </td>
                    </tr>
                  ) : (
                    intelligence.map((intel, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: "600" }}>{intel.company_name}</td>
                        <td>{intel.lead_time_days?.toFixed(1) || "3.5"} days</td>
                        <td style={{ fontWeight: "700", color: "#f59e0b" }}>
                          {"★".repeat(Math.round(intel.rating || 5)) + "☆".repeat(5 - Math.round(intel.rating || 5))}
                          <span style={{ marginLeft: "4px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            ({intel.rating?.toFixed(1) || "5.0"})
                          </span>
                        </td>
                        <td>{intel.orders_delivered || 0} invoices</td>
                        <td style={{ fontWeight: "600" }}>₹{Number(intel.total_spend || 0).toLocaleString()}</td>
                        <td>
                          <span
                            className={`badge ${
                              (intel.performance_score || 100) >= 90
                                ? "badge-success"
                                : (intel.performance_score || 100) >= 70
                                ? "badge-warning"
                                : "badge-danger"
                            }`}
                            style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                          >
                            {(intel.performance_score || 100).toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-card" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h3>Register Supplier</h3>
              <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSupplier} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  required
                  value={form.company_name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Company Name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Person</label>
                <input
                  type="text"
                  name="contact_name"
                  value={form.contact_name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="supplier@company.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Phone"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Corporate Address</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Address"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSupplier && (
        <div className="modal-overlay">
          <div className="glass-panel modal-card" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h3>Edit Supplier: {selectedSupplier.company_name}</h3>
              <button onClick={() => setShowEditModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSupplier} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  required
                  value={form.company_name}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Person</label>
                <input
                  type="text"
                  name="contact_name"
                  value={form.contact_name}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Corporate Address</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Suppliers;

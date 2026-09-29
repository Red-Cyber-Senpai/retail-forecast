import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, Mail, Phone, MapPin, Globe, X } from "lucide-react";
import { getDistributors, createDistributor, updateDistributor, deleteDistributor } from "../services/distributors";
import { useAuthContext } from "../context/AuthContext";

function Distributors() {
  const { user } = useAuthContext();
  const isManagerOrAdmin = ["manager", "admin", "superadmin"].includes(user?.role);

  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState(null);

  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
    region: "North",
  });

  useEffect(() => {
    loadDistributors();
  }, []);

  async function loadDistributors() {
    try {
      setLoading(true);
      const data = await getDistributors();
      setDistributors(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load distributors list");
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

  async function handleAddDistributor(e) {
    e.preventDefault();
    try {
      await createDistributor(form);
      toast.success("Distributor registered successfully");
      setShowAddModal(false);
      resetForm();
      loadDistributors();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to register distributor");
    }
  }

  async function handleEditDistributor(e) {
    e.preventDefault();
    if (!selectedDistributor) return;
    try {
      await updateDistributor(selectedDistributor.id, form);
      toast.success("Distributor profile updated successfully");
      setShowEditModal(false);
      resetForm();
      loadDistributors();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to update distributor details");
    }
  }

  async function handleDeleteDistributor(id) {
    if (!window.confirm("Are you sure you want to delete this distributor registration?")) return;
    try {
      await deleteDistributor(id);
      toast.success("Distributor removed successfully");
      loadDistributors();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to delete distributor");
    }
  }

  function openEditModal(dist) {
    setSelectedDistributor(dist);
    setForm({
      company_name: dist.company_name || "",
      contact_name: dist.contact_name || "",
      email: dist.email || "",
      phone: dist.phone || "",
      address: dist.address || "",
      region: dist.region || "North",
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
      region: "North",
    });
    setSelectedDistributor(null);
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
            Regional Distributors
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage regional partners who deliver stock and handle logistics operations.
          </p>
        </div>

        {isManagerOrAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <Plus size={18} />
            Register Partner
          </button>
        )}
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Contact Name</th>
                <th>Region</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                {isManagerOrAdmin && <th style={{ textAlign: "right" }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {distributors.length === 0 ? (
                <tr>
                  <td colSpan={isManagerOrAdmin ? 7 : 6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>
                    No regional distributors registered yet.
                  </td>
                </tr>
              ) : (
                distributors.map((dist) => (
                  <tr key={dist.id}>
                    <td style={{ fontWeight: "600" }}>{dist.company_name}</td>
                    <td>{dist.contact_name || "-"}</td>
                    <td>
                      <span className="badge badge-info" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Globe size={10} />
                        {dist.region || "All Regions"}
                      </span>
                    </td>
                    <td>
                      {dist.email ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <Mail size={12} style={{ color: "var(--text-muted)" }} />
                          {dist.email}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {dist.phone ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <Phone size={12} style={{ color: "var(--text-muted)" }} />
                          {dist.phone}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      {dist.address ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <MapPin size={12} style={{ color: "var(--text-muted)" }} />
                          {dist.address}
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
                            onClick={() => openEditModal(dist)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-outline"
                            style={{ padding: "6px 10px", color: "var(--color-danger)" }}
                            onClick={() => handleDeleteDistributor(dist.id)}
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-card" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h3>Register Distributor</h3>
              <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddDistributor} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
              <div className="form-group">
                <label className="form-label">Distributor Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  required
                  value={form.company_name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g. Blue Dart Logistics"
                />
              </div>

              <div className="grid-cols-2" style={{ gap: "12px" }}>
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
                  <label className="form-label">Operational Region</label>
                  <select
                    name="region"
                    value={form.region}
                    onChange={handleInputChange}
                    className="form-input"
                    style={{ appearance: "auto", backgroundColor: "light-dark(#fff, #0f131d)" }}
                  >
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="National">National</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="distributor@delivery.com"
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
                <label className="form-label">Office Address</label>
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
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedDistributor && (
        <div className="modal-overlay">
          <div className="glass-panel modal-card" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h3>Edit Distributor: {selectedDistributor.company_name}</h3>
              <button onClick={() => setShowEditModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleEditDistributor} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
              <div className="form-group">
                <label className="form-label">Distributor Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  required
                  value={form.company_name}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="grid-cols-2" style={{ gap: "12px" }}>
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
                  <label className="form-label">Region</label>
                  <select
                    name="region"
                    value={form.region}
                    onChange={handleInputChange}
                    className="form-input"
                    style={{ appearance: "auto", backgroundColor: "light-dark(#fff, #0f131d)" }}
                  >
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="National">National</option>
                  </select>
                </div>
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
                <label className="form-label">Office Address</label>
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

export default Distributors;

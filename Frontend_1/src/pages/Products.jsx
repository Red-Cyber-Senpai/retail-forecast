import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";
import { getProducts, addProduct, updateProduct, deleteProduct } from "../services/productService";
import { useAuthContext } from "../context/AuthContext";

function Products() {
  const { user } = useAuthContext();
  const isManagerOrAdmin = ["manager", "admin", "superadmin"].includes(user?.role);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit] = useState(15);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Modal forms states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [form, setForm] = useState({
    barcode: "",
    name: "",
    brand: "",
    category: "",
    description: "",
    unit: "pcs",
    cost_price: 0,
    selling_price: 0,
  });

  useEffect(() => {
    loadProducts();
  }, [page, searchQuery]);

  async function loadProducts() {
    try {
      setLoading(true);
      const skip = (page - 1) * limit;
      const data = await getProducts({
        q: searchQuery || undefined,
        limit,
        skip,
      });

      setProducts(data);
      // If we got fewer products than the limit, there are no more pages
      setHasMore(data.length === limit);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load catalog products");
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name.endsWith("_price") ? parseFloat(value) || 0 : value,
    }));
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    try {
      await addProduct(form);
      toast.success("Product added to catalog successfully");
      setShowAddModal(false);
      resetForm();
      loadProducts();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to add product");
    }
  }

  async function handleEditProduct(e) {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await updateProduct(selectedProduct.id, form);
      toast.success("Product updated successfully");
      setShowEditModal(false);
      resetForm();
      loadProducts();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to update product");
    }
  }

  async function handleDeleteProduct(id) {
    if (!window.confirm("Are you sure you want to delete this product from the catalog?")) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully");
      loadProducts();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to delete product");
    }
  }

  function openEditModal(prod) {
    setSelectedProduct(prod);
    setForm({
      barcode: prod.barcode || "",
      name: prod.name || "",
      brand: prod.brand || "",
      category: prod.category || "",
      description: prod.description || "",
      unit: prod.unit || "pcs",
      cost_price: prod.cost_price || 0,
      selling_price: prod.selling_price || 0,
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setForm({
      barcode: "",
      name: "",
      brand: "",
      category: "",
      description: "",
      unit: "pcs",
      cost_price: 0,
      selling_price: 0,
    });
    setSelectedProduct(null);
  }

  return (
    <div className="page-container">
      {/* Title / Toolbar */}
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
            Product Catalog
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Search, list, and register products in the global database.
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
            Add Product
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="glass-panel" style={{ padding: "16px" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: "480px" }}>
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
            placeholder="Search by name, brand, barcode, category..."
            className="form-input"
            style={{ paddingLeft: "42px" }}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Catalog Table */}
      <div className="table-container">
        {loading && products.length === 0 ? (
          <div className="loader-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                {isManagerOrAdmin && <th style={{ textAlign: "right" }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={isManagerOrAdmin ? 8 : 7} style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>
                    No products found matching the query.
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id}>
                    <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{prod.barcode}</td>
                    <td style={{ fontWeight: "600" }}>{prod.name}</td>
                    <td>{prod.brand || "-"}</td>
                    <td><span className="badge badge-info">{prod.category || "General"}</span></td>
                    <td>{prod.unit}</td>
                    <td>₹{Number(prod.cost_price).toFixed(2)}</td>
                    <td style={{ fontWeight: "600", color: "var(--color-primary)" }}>
                      ₹{Number(prod.selling_price).toFixed(2)}
                    </td>
                    {isManagerOrAdmin && (
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            className="btn btn-outline"
                            style={{ padding: "6px 10px" }}
                            onClick={() => openEditModal(prod)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-outline"
                            style={{ padding: "6px 10px", color: "var(--color-danger)" }}
                            onClick={() => handleDeleteProduct(prod.id)}
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
        )}
      </div>

      {/* Pagination Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
        <button
          className="btn btn-secondary"
          disabled={page === 1 || loading}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </button>
        <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Page {page}
        </span>
        <button
          className="btn btn-secondary"
          disabled={!hasMore || loading}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>

      {/* Add Product Modal Overlay */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-card">
            <div className="modal-header">
              <h3>Register Product</h3>
              <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddProduct} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "12px" }}>
              <div className="grid-cols-2" style={{ gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Barcode (Unique)</label>
                  <input
                    type="text"
                    name="barcode"
                    required
                    value={form.barcode}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g. 89010307"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Product Name"
                  />
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={form.brand}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Brand"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g. Snacks"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Details..."
                  rows={2}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="grid-cols-3" style={{ gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <input
                    type="text"
                    name="unit"
                    value={form.unit}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cost_price"
                    value={form.cost_price}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="selling_price"
                    value={form.selling_price}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal Overlay */}
      {showEditModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="glass-panel modal-card">
            <div className="modal-header">
              <h3>Edit Product: {selectedProduct.name}</h3>
              <button onClick={() => setShowEditModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleEditProduct} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "12px" }}>
              <div className="grid-cols-2" style={{ gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Barcode</label>
                  <input
                    type="text"
                    name="barcode"
                    required
                    value={form.barcode}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={form.brand}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  className="form-input"
                  rows={2}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="grid-cols-3" style={{ gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <input
                    type="text"
                    name="unit"
                    value={form.unit}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cost_price"
                    value={form.cost_price}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="selling_price"
                    value={form.selling_price}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
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

// Add CSS overlay rule dynamically
if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.innerHTML = `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-card {
      width: 90%;
      max-width: 600px;
      animation: zoomIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 12px;
    }
    .modal-header h3 {
      font-size: 1.25rem;
      font-family: var(--font-display);
    }
    .modal-header button {
      color: var(--text-secondary);
    }
    .modal-header button:hover {
      color: var(--text-primary);
    }
    @keyframes zoomIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(styleEl);
}

export default Products;

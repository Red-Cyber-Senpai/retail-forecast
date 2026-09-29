import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { UploadCloud, Image as ImageIcon, Scan, CheckCircle, AlertCircle, FileSpreadsheet, Plus, X } from "lucide-react";
import { scanImage, scanBarcode, confirmProduct } from "../services/scanner";
import { getSuppliers } from "../services/suppliers";
import { useAuthContext } from "../context/AuthContext";

function Scanner() {
  const { user } = useAuthContext();
  const isManagerOrAdmin = ["manager", "admin", "superadmin"].includes(user?.role);

  const [activeTab, setActiveTab] = useState("vision"); // "vision" or "barcode"
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Results states
  const [visionResult, setVisionResult] = useState(null);
  const [barcodeResult, setBarcodeResult] = useState(null);

  // New product registration drawer
  const [showRegForm, setShowRegForm] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [regForm, setRegForm] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    unit: "pcs",
    cost_price: 0,
    selling_price: 0,
    supplier_id: "",
    purchase_price: 0,
    minimum_order_quantity: 1,
  });

  const fileInputRef = useRef(null);

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Reset past results
      setVisionResult(null);
      setBarcodeResult(null);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setVisionResult(null);
      setBarcodeResult(null);
    }
  }

  function triggerFileSelect() {
    fileInputRef.current?.click();
  }

  async function handleScan() {
    if (!selectedFile) {
      toast.error("Please select or drop an image first");
      return;
    }

    try {
      setLoading(true);
      if (activeTab === "vision") {
        const data = await scanImage(selectedFile);
        setVisionResult(data);
        toast.success(`Shelf scanned: Category "${data.predicted_category}" detected`);
      } else {
        const data = await scanBarcode(selectedFile);
        setBarcodeResult(data);
        toast.success(`Barcode decoded: Found ${data.decoded_barcodes?.length || 0} code(s)`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "AI recognition scan failed");
    } finally {
      setLoading(false);
    }
  }

  async function openRegistration(category) {
    try {
      setRegForm({
        name: "",
        category: category,
        brand: "",
        description: `Classified as ${category} via AI Vision`,
        unit: "pcs",
        cost_price: 0,
        selling_price: 0,
        supplier_id: "",
        purchase_price: 0,
        minimum_order_quantity: 1,
      });

      if (suppliers.length === 0) {
        const suppData = await getSuppliers();
        setSuppliers(suppData);
      }
      setShowRegForm(true);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load suppliers list");
    }
  }

  async function handleRegisterProduct(e) {
    e.preventDefault();
    try {
      const payload = {
        ...regForm,
        supplier_id: regForm.supplier_id ? parseInt(regForm.supplier_id) : null,
        cost_price: parseFloat(regForm.cost_price),
        selling_price: parseFloat(regForm.selling_price),
        purchase_price: parseFloat(regForm.purchase_price),
        minimum_order_quantity: parseInt(regForm.minimum_order_quantity),
      };

      await confirmProduct(payload);
      toast.success("New product confirmed and logged in database");
      setShowRegForm(false);
      // reload vision results to show the newly added matching product
      if (selectedFile) {
        handleScan();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to confirm product");
    }
  }

  function handleReset() {
    setSelectedFile(null);
    setPreviewUrl(null);
    setVisionResult(null);
    setBarcodeResult(null);
    setShowRegForm(false);
  }

  return (
    <div className="page-container">
      {/* Title */}
      <div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: "800", fontFamily: "var(--font-display)" }}>
          AI Intelligent Scanner
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Point camera snapshot of shelves to classify items or decode retail barcodes.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", gap: "24px" }}>
        <button
          onClick={() => {
            setActiveTab("vision");
            handleReset();
          }}
          style={{
            padding: "12px 4px",
            borderBottom: activeTab === "vision" ? "2px solid var(--color-primary)" : "2px solid transparent",
            color: activeTab === "vision" ? "var(--color-primary)" : "var(--text-secondary)",
            fontWeight: activeTab === "vision" ? "600" : "500",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ImageIcon size={16} />
          AI Category Classifier
        </button>

        <button
          onClick={() => {
            setActiveTab("barcode");
            handleReset();
          }}
          style={{
            padding: "12px 4px",
            borderBottom: activeTab === "barcode" ? "2px solid var(--color-primary)" : "2px solid transparent",
            color: activeTab === "barcode" ? "var(--color-primary)" : "var(--text-secondary)",
            fontWeight: activeTab === "barcode" ? "600" : "500",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Scan size={16} />
          Barcode Image Scan
        </button>
      </div>

      {/* File Uploader Grid */}
      <div style={{ display: "grid", gridTemplateColumns: previewUrl ? "1fr 1fr" : "1fr", gap: "24px" }} className="lg-two-cols">
        {/* Upload Box */}
        <div
          className="glass-panel"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "280px",
            border: "2px dashed var(--border-color)",
            cursor: "pointer",
            borderRadius: "16px",
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: "none" }}
            accept="image/*"
          />
          <UploadCloud size={48} style={{ color: "var(--color-primary)", marginBottom: "16px" }} />
          <h3 style={{ fontSize: "1.1rem", marginBottom: "6px" }}>Drag & Drop Image</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Supports JPG, JPEG, PNG formats (Max 5MB)
          </p>
        </div>

        {/* Preview Box */}
        {previewUrl && (
          <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
            <button
              onClick={handleReset}
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                backgroundColor: "var(--bg-app)",
                border: "1px solid var(--border-color)",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={14} />
            </button>
            <h3 style={{ fontSize: "1rem" }}>Snapshot Preview</h3>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: "12px", maxHeight: "250px", backgroundColor: "light-dark(#f1f5f9,#080c14)" }}>
              <img src={previewUrl} alt="Upload preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
              onClick={handleScan}
            >
              {loading ? "Analyzing Snapshot..." : `Start AI ${activeTab === "vision" ? "Classification" : "Barcode Decode"}`}
            </button>
          </div>
        )}
      </div>

      {/* Results View */}
      {visionResult && activeTab === "vision" && (
        <div className="glass-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Classification Report</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Detected Shelf Category</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ textAlign: "right" }}>
                <span className="badge badge-success" style={{ fontSize: "0.85rem", padding: "6px 12px" }}>
                  {visionResult.predicted_category}
                </span>
              </div>
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Confidence Score</p>
                <p style={{ fontWeight: "700", color: "var(--color-primary)" }}>
                  {(visionResult.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: "1rem", marginBottom: "12px" }}>Matching Products in Catalog</h3>
          {visionResult.matched_products?.length === 0 ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                backgroundColor: "var(--color-warning-light)",
                color: "var(--color-warning)",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <AlertCircle size={24} />
              <div>
                <p style={{ fontWeight: "600" }}>No matching catalog products found under "{visionResult.predicted_category}"</p>
                <p style={{ fontSize: "0.85rem", marginTop: "2px" }}>Would you like to register a new product under this category?</p>
              </div>
              {isManagerOrAdmin && (
                <button className="btn btn-primary" onClick={() => openRegistration(visionResult.predicted_category)}>
                  <Plus size={16} /> Register New Product
                </button>
              )}
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Barcode</th>
                    <th>Name</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {visionResult.matched_products.map((prod) => (
                    <tr key={prod.id}>
                      <td style={{ fontFamily: "monospace" }}>{prod.barcode}</td>
                      <td style={{ fontWeight: "600" }}>{prod.name}</td>
                      <td>{prod.brand || "-"}</td>
                      <td><span className="badge badge-info">{prod.category}</span></td>
                      <td style={{ fontWeight: "600", color: "var(--color-success)" }}>
                        ₹{Number(prod.selling_price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {barcodeResult && activeTab === "barcode" && (
        <div className="glass-panel">
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Barcode Extraction</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Found {barcodeResult.decoded_barcodes?.length || 0} unique barcode(s) in image.
            </p>
          </div>

          {barcodeResult.decoded_barcodes?.length === 0 ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                backgroundColor: "light-dark(#f8fafc, #131824)",
                color: "var(--text-secondary)",
                borderRadius: "12px",
              }}
            >
              No barcodes could be read from this image. Ensure the barcode label is centered and clear.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {barcodeResult.decoded_barcodes.map((code, idx) => (
                  <span key={idx} className="badge badge-info" style={{ fontFamily: "monospace", padding: "6px 12px" }}>
                    Code: {code}
                  </span>
                ))}
              </div>

              <h3 style={{ fontSize: "1rem", marginTop: "10px" }}>Database Matches</h3>
              {barcodeResult.matches?.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  None of the decoded barcodes exist in the product catalog yet.
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Barcode</th>
                        <th>Product</th>
                        <th>Brand</th>
                        <th>Stock Qty</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {barcodeResult.matches.map((match, idx) => (
                        <tr key={idx}>
                          <td style={{ fontFamily: "monospace" }}>{match.barcode}</td>
                          <td style={{ fontWeight: "600" }}>{match.product?.name || "Unknown"}</td>
                          <td>{match.product?.brand || "-"}</td>
                          <td style={{ fontWeight: "700" }}>{match.inventory?.quantity || 0} pcs</td>
                          <td style={{ fontWeight: "600", color: "var(--color-primary)" }}>
                            ₹{Number(match.product?.selling_price || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Registration Modal Overlay */}
      {showRegForm && (
        <div className="modal-overlay">
          <div className="glass-panel modal-card" style={{ maxWidth: "550px" }}>
            <div className="modal-header">
              <h3>Confirm Category: Register New Product</h3>
              <button onClick={() => setShowRegForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleRegisterProduct} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "12px" }}>
              <div className="grid-cols-2" style={{ gap: "10px" }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input type="text" name="category" disabled value={regForm.category} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    required
                    value={regForm.name}
                    onChange={(e) => setRegForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="form-input"
                    placeholder="Name"
                  />
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: "10px" }}>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    type="text"
                    value={regForm.brand}
                    onChange={(e) => setRegForm((prev) => ({ ...prev, brand: e.target.value }))}
                    className="form-input"
                    placeholder="Brand"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    value={regForm.description}
                    onChange={(e) => setRegForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-cols-3" style={{ gap: "10px" }}>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <input
                    type="text"
                    value={regForm.unit}
                    onChange={(e) => setRegForm((prev) => ({ ...prev, unit: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={regForm.cost_price}
                    onChange={(e) => setRegForm((prev) => ({ ...prev, cost_price: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Selling Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={regForm.selling_price}
                    onChange={(e) => setRegForm((prev) => ({ ...prev, selling_price: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-cols-3" style={{ gap: "10px" }}>
                <div className="form-group">
                  <label className="form-label">Select Supplier</label>
                  <select
                    value={regForm.supplier_id}
                    onChange={(e) => setRegForm((prev) => ({ ...prev, supplier_id: e.target.value }))}
                    className="form-input"
                    style={{ appearance: "auto" }}
                  >
                    <option value="">-- None --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.company_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Purchase Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={regForm.purchase_price}
                    onChange={(e) => setRegForm((prev) => ({ ...prev, purchase_price: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Order Qty</label>
                  <input
                    type="number"
                    value={regForm.minimum_order_quantity}
                    onChange={(e) => setRegForm((prev) => ({ ...prev, minimum_order_quantity: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRegForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Scanner;

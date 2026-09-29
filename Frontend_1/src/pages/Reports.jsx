import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Download, FileText, FileSpreadsheet, Printer } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getReportData, getAnalyticsSummary } from "../services/reports";

function Reports() {
  const [report, setReport] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportsData();
  }, []);

  async function loadReportsData() {
    try {
      setLoading(true);
      const [rData, aData] = await Promise.all([
        getReportData(),
        getAnalyticsSummary().catch(() => null),
      ]);
      setReport(rData);
      setAnalytics(aData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to compile reports data");
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleExportCSV() {
    if (!report?.orders) {
      toast.error("No orders data to export");
      return;
    }

    const rows = [["Order ID", "Distributor", "Status", "Total Amount (INR)", "Date"]];
    report.orders.forEach((ord) => {
      rows.push([
        ord.order_id || ord.id,
        ord.distributor?.company_name || `Distributor #${ord.distributor_id}`,
        ord.status,
        ord.total_amount,
        new Date(ord.created_at).toLocaleString(),
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SelfStack_Executive_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report exported successfully");
  }

  function handleExportPDF() {
    if (!report) {
      toast.error("No report data compiled yet");
      return;
    }

    const doc = new jsPDF();
    const dashboard = report.dashboard || {};
    const orders = report.orders || [];
    const products = dashboard.top_selling_products || [];

    // Header Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("SelfStack Executive Business Report", 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Report Compiled On: ${new Date().toLocaleString()}`, 14, 26);

    // Executive Summary Table
    doc.setFontSize(16);
    doc.text("Executive Financial Summary", 14, 38);

    autoTable(doc, {
      startY: 44,
      theme: "grid",
      head: [["Performance Metric", "Metric Value"]],
      body: [
        ["Total Revenue", `₹${Number(dashboard.all_time_revenue || 0).toLocaleString()}`],
        ["Today's Revenue", `₹${Number(dashboard.todays_revenue || 0).toLocaleString()}`],
        ["Today's Products Sold", `${dashboard.todays_units_sold || 0} units`],
        ["Catalog Registered Products", `${dashboard.catalog_products || 0}`],
        ["Active Inventory Products", `${dashboard.active_products || 0}`],
        ["Total Stock Units", `${Number(dashboard.total_stock_units || 0).toLocaleString()} pcs`],
        ["Low Stock Critical Warning Items", `${dashboard.low_stock_count || 0}`],
        ["Warehouse Inventory Valuation Cost", `₹${Number(analytics?.total_inventory_cost_value || 0).toLocaleString()}`],
      ],
      headStyles: { fillColor: [59, 130, 246] },
    });

    // Top Selling Products
    let y = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(16);
    doc.text("Top Selling Catalog Products", 14, y);

    autoTable(doc, {
      startY: y + 5,
      theme: "striped",
      head: [["Product Name", "Category", "Units Sold", "Revenue (INR)"]],
      body: products.map((p) => [p.name, p.category || "-", p.units_sold, `₹${Number(p.revenue).toLocaleString()}`]),
      headStyles: { fillColor: [16, 185, 129] },
    });

    // Recent Restock Orders
    y = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(16);
    doc.text("Recent Procurement Deliveries", 14, y);

    autoTable(doc, {
      startY: y + 5,
      theme: "striped",
      head: [["Order ID", "Distributor", "Status", "Amount", "Timestamp"]],
      body: orders.slice(0, 10).map((o) => [
        `#${o.order_id || o.id}`,
        o.distributor?.company_name || `Distributor #${o.distributor_id}`,
        o.status.toUpperCase(),
        `₹${Number(o.total_amount).toLocaleString()}`,
        new Date(o.created_at).toLocaleDateString(),
      ]),
      headStyles: { fillColor: [139, 92, 246] },
    });

    doc.save(`SelfStack_Executive_Report_${Date.now()}.pdf`);
    toast.success("PDF report generated successfully");
  }

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const dashboard = report?.dashboard || {};

  return (
    <div className="page-container">
      {/* Header */}
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
            Business Intelligence Reports
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Compile transactional data and export high-level executive summaries.
          </p>
        </div>

        <div style={{ display: "inline-flex", gap: "10px" }}>
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={16} /> Print View
          </button>
          <button className="btn btn-outline" onClick={handleExportCSV}>
            <FileSpreadsheet size={16} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={handleExportPDF}>
            <Download size={16} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* Reports Summary Table */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }} className="lg-two-cols">
        
        {/* Core KPI metrics Table */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 className="card-title">Executive Summary Indices</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Performance Metric</th>
                  <th style={{ textAlign: "right" }}>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>All-Time Accumulated Revenue</td>
                  <td style={{ fontWeight: "700", textAlign: "right", color: "var(--color-success)" }}>
                    ₹{Number(dashboard.all_time_revenue || 0).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td>Today's Operational Revenue</td>
                  <td style={{ fontWeight: "700", textAlign: "right" }}>
                    ₹{Number(dashboard.todays_revenue || 0).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td>Today's Sales Volume</td>
                  <td style={{ textAlign: "right" }}>{dashboard.todays_units_sold || 0} items</td>
                </tr>
                <tr>
                  <td>Total Catalog SKU Items</td>
                  <td style={{ textAlign: "right" }}>{dashboard.catalog_products || 0} SKUs</td>
                </tr>
                <tr>
                  <td>Active Stock Items</td>
                  <td style={{ textAlign: "right" }}>{dashboard.active_products || 0}</td>
                </tr>
                <tr>
                  <td>Total Inventory Quantity</td>
                  <td style={{ textAlign: "right" }}>{Number(dashboard.total_stock_units || 0).toLocaleString()} pcs</td>
                </tr>
                <tr>
                  <td>Low Stock Warnings</td>
                  <td style={{ textAlign: "right", color: "var(--color-danger)", fontWeight: "600" }}>
                    {dashboard.low_stock_count || 0} SKU items
                  </td>
                </tr>
                <tr>
                  <td>Warehouse Valuation Cost</td>
                  <td style={{ fontWeight: "700", textAlign: "right", color: "var(--color-primary)" }}>
                    ₹{Number(analytics?.total_inventory_cost_value || 0).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "16px", background: "light-dark(rgba(59, 130, 246, 0.02), rgba(59, 130, 246, 0.05))" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FileText size={20} style={{ color: "var(--color-primary)" }} />
            <h3 style={{ fontSize: "1.1rem" }}>Reporting Information</h3>
          </div>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            Executive reports combine statistics across sales receipts, purchase logs, and catalog pricing.
          </p>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            SelfStack integrates forecasting regressor estimates into calculations to propose procurement balances that align with seasonal surges.
          </p>
          <div
            style={{
              marginTop: "auto",
              padding: "16px",
              borderRadius: "10px",
              backgroundColor: "light-dark(#fff, #0f131d)",
              border: "1px solid var(--border-color)",
              fontSize: "0.8rem",
            }}
          >
            <strong>Tip:</strong> Deliveries that are finalized under the "Orders" page automatically update the ledger quantities and log timestamps.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;

import {
  Download,
  Printer,
  FileText,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function ExportButton({ data }) {
  function exportCSV() {
    const rows = [];

    rows.push([
      "Order ID",
      "Status",
      "Amount",
      "Date",
    ]);

    (data?.orders || []).forEach((order) => {
      rows.push([
        order.order_id,
        order.status,
        order.total_amount,
        new Date(
          order.created_at
        ).toLocaleString(),
      ]);
    });

    const csv = rows
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "SelfStack_Report.csv";

    link.click();

    URL.revokeObjectURL(url);
  }

  function printReport() {
    window.print();
  }

  function exportPDF() {
  const doc = new jsPDF();

  const dashboard = data?.dashboard || {};
  const orders = data?.orders || [];
  const products = dashboard.top_selling_products || [];

  // ---------------- Title ----------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("SelfStack Business Report", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Generated: ${new Date().toLocaleString()}`,
    14,
    26
  );

  // ---------------- KPI Summary ----------------
  doc.setFontSize(16);
  doc.text("Executive Summary", 14, 38);

  autoTable(doc, {
    startY: 44,
    theme: "grid",
    head: [["Metric", "Value"]],
    body: [
      [
        "Total Revenue",
        `₹${Number(
          dashboard.all_time_revenue || 0
        ).toLocaleString()}`,
      ],
      [
        "Today's Revenue",
        `₹${Number(
          dashboard.todays_revenue || 0
        ).toLocaleString()}`,
      ],
      [
        "Today's Units Sold",
        dashboard.todays_units_sold || 0,
      ],
      [
        "Catalog Products",
        dashboard.catalog_products || 0,
      ],
      [
        "Active Products",
        dashboard.active_products || 0,
      ],
      [
        "Inventory Units",
        dashboard.total_stock_units || 0,
      ],
      [
        "Low Stock Products",
        dashboard.low_stock_count || 0,
      ],
    ],
  });

  // ---------------- Top Products ----------------
  let y = doc.lastAutoTable.finalY + 12;

  doc.setFontSize(16);
  doc.text("Top Selling Products", 14, y);

  autoTable(doc, {
    startY: y + 5,
    theme: "striped",
    head: [
      [
        "Product",
        "Category",
        "Units Sold",
        "Revenue",
      ],
    ],
    body: products.map((product) => [
      product.name,
      product.category || "-",
      product.units_sold,
      `₹${Number(
        product.revenue
      ).toLocaleString()}`,
    ]),
  });

  // ---------------- Recent Orders ----------------
  y = doc.lastAutoTable.finalY + 12;

  doc.setFontSize(16);
  doc.text("Recent Orders", 14, y);

  autoTable(doc, {
    startY: y + 5,
    theme: "striped",
    head: [
      [
        "Order ID",
        "Status",
        "Amount",
        "Date",
      ],
    ],
    body: orders.map((order) => [
      order.order_id ?? order.id,
      order.status,
      `₹${Number(
        order.total_amount
      ).toLocaleString()}`,
      new Date(
        order.created_at
      ).toLocaleDateString(),
    ]),
  });

  // ---------------- Footer ----------------
  doc.setFontSize(10);
  doc.text(
    "Generated automatically by SelfStack AI Retail Supply Chain",
    14,
    doc.internal.pageSize.height - 10
  );

  doc.save("SelfStack_Business_Report.pdf");
}

  return (
    <div className="flex gap-3">
      <button
        onClick={exportCSV}
        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        <Download size={18} />
        CSV
      </button>

      <button
        onClick={printReport}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        <Printer size={18} />
        Print
      </button>

      <button
        onClick={exportPDF}
        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        <FileText size={18} />
        PDF
      </button>
    </div>
  );
}

export default ExportButton;
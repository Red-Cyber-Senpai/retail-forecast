import {
  Download,
  Printer,
  FileText,
} from "lucide-react";

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
        order.id,
        order.status,
        order.total_amount,
        order.created_at,
      ]);
    });

    const csv = rows
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = "SelfStack_Report.csv";

    link.click();

    window.URL.revokeObjectURL(url);
  }

  function printReport() {
    window.print();
  }

  function exportPDF() {
    window.print();
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
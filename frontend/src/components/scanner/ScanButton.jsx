import { ScanSearch } from "lucide-react";

function ScanButton({
  onClick,
  loading,
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:bg-gray-400"
    >
      <ScanSearch size={20} />

      {loading ? "Scanning..." : "Scan Shelf"}
    </button>
  );
}

export default ScanButton;
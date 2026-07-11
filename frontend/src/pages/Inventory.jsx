import { useEffect, useState } from "react";

import InventoryToolbar from "../components/inventory/InventoryToolbar";
import InventoryTable from "../components/inventory/InventoryTable";
import StockModal from "../components/inventory/StockModal";

import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import toast from "react-hot-toast";

import {
  getInventory,
  addStock,
  removeStock,
} from "../services/inventory";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    try {
      setLoading(true);

      const data = await getInventory();

      setInventory(data);

      setError("");
    } catch (err) {
      console.error(err);

      setError("Unable to load inventory.");
    } finally {
      setLoading(false);
    }
  }

  function handleUpdateStock() {
    setSelectedItem(null);
    setModalMode("add");
    setShowModal(true);
  }

  function handleViewLogs() {
    toast("Inventory Logs feature coming soon.");
  }

  function handleAddStock(item) {
    setSelectedItem(item);
    setModalMode("add");
    setShowModal(true);
  }

  function handleRemoveStock(item) {
    setSelectedItem(item);
    setModalMode("remove");
    setShowModal(true);
  }

  async function handleSaveStock(form) {
    try {
      if (modalMode === "add") {
        await addStock(form);
      } else {
        await removeStock(form);
      }

      await loadInventory();

      setShowModal(false);
      setSelectedItem(null);

      toast.success("Stock Updated Successfully");
    } catch (err) {
      console.error(err);

      toast.error("Failed to update stock.");
    }
  }

  const filteredInventory = inventory.filter((item) => {
    const query = search.toLowerCase();

    return (
      item.id.toString().includes(query) ||
      item.product_id.toString().includes(query)
    );
  });

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">

      <InventoryToolbar
        search={search}
        setSearch={setSearch}
        onUpdateStock={handleUpdateStock}
        onViewLogs={handleViewLogs}
      />

      <StockModal
        isOpen={showModal}
        mode={modalMode}
        initialProductId={selectedItem?.product_id || ""}
        onClose={() => {
          setShowModal(false);
          setSelectedItem(null);
        }}
        onSave={handleSaveStock}
      />

      {filteredInventory.length === 0 ? (
        <EmptyState message="No Inventory Found" />
      ) : (
        <InventoryTable
          inventory={filteredInventory}
          onAddStock={handleAddStock}
          onRemoveStock={handleRemoveStock}
        />
      )}

    </div>
  );
}

export default Inventory;
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";

import SupplierStats from "../components/suppliers/SupplierStats";
import SupplierToolbar from "../components/suppliers/SupplierToolbar";
import SupplierTable from "../components/suppliers/SupplierTable";
import SupplierModal from "../components/suppliers/SupplierModal";
import SupplierProfileDrawer from "../components/suppliers/SupplierProfileDrawer";
import SupplierAnalytics from "../components/suppliers/SupplierAnalytics";
import SupplierPerformanceCard from "../components/suppliers/SupplierPerformanceCard";

import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../services/suppliers";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [showProfile, setShowProfile] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    try {
      setLoading(true);

      const data = await getSuppliers();

      setSuppliers(data);

      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load suppliers.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(data) {
    try {
      if (editingSupplier) {
        await updateSupplier(
          editingSupplier.id,
          data
        );

        toast.success(
          "Supplier Updated Successfully"
        );
      } else {
        await createSupplier(data);

        toast.success(
          "Supplier Added Successfully"
        );
      }

      await loadSuppliers();

      setShowModal(false);
      setEditingSupplier(null);
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.detail ||
          "Unable to save supplier."
      );
    }
  }

  async function handleDelete(supplier) {
    const confirmed = window.confirm(
      `Delete "${supplier.company_name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteSupplier(supplier.id);

      await loadSuppliers();

      toast.success(
        "Supplier Deleted Successfully"
      );
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.detail ||
          "Unable to delete supplier."
      );
    }
  }

  const filteredSuppliers = suppliers.filter(
    (supplier) => {
      const query = search.toLowerCase();

      return (
        supplier.company_name
          ?.toLowerCase()
          .includes(query) ||
        supplier.contact_person
          ?.toLowerCase()
          .includes(query) ||
        supplier.city
          ?.toLowerCase()
          .includes(query) ||
        supplier.email
          ?.toLowerCase()
          .includes(query) ||
        supplier.phone
          ?.toLowerCase()
          .includes(query)
      );
    }
  );

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadSuppliers}
      />
    );
  }

  return (
    <div className="space-y-6">

      {/* Dashboard Cards */}
      <SupplierStats
        suppliers={suppliers}
      />

      {/* Toolbar */}
      <SupplierToolbar
        search={search}
        setSearch={setSearch}
        onAdd={() => {
          setEditingSupplier(null);
          setShowModal(true);
        }}
      />
      <div className="grid gap-6 xl:grid-cols-2">
      <SupplierPerformanceCard
        suppliers={suppliers}/>
      <SupplierAnalytics
        suppliers={suppliers}/>
      </div>

      {/* Add/Edit Modal */}
      <SupplierModal
        open={showModal}
        supplier={editingSupplier}
        onClose={() => {
          setShowModal(false);
          setEditingSupplier(null);
        }}
        onSave={handleSave}
      />

      {/* Profile Drawer */}
      <SupplierProfileDrawer
        open={showProfile}
        supplier={selectedSupplier}
        onClose={() => {
          setShowProfile(false);
          setSelectedSupplier(null);
        }}
      />

      {/* Supplier Table */}
      {filteredSuppliers.length === 0 ? (
        <EmptyState
          message="No Suppliers Found"
          description="Try changing your search or add a new supplier."
        />
      ) : (
        <SupplierTable
          suppliers={filteredSuppliers}
          onView={(supplier) => {
            setSelectedSupplier(supplier);
            setShowProfile(true);
          }}
          onEdit={(supplier) => {
            setEditingSupplier(supplier);
            setShowModal(true);
          }}
          onDelete={handleDelete}
        />
      )}

    </div>
  );
}

export default Suppliers;
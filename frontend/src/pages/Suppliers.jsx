import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";

import SupplierToolbar from "../components/suppliers/SupplierToolbar";
import SupplierTable from "../components/suppliers/SupplierTable";
import SupplierModal from "../components/suppliers/SupplierModal";

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
        await updateSupplier(editingSupplier.id, data);
      } else {
        await createSupplier(data);
      }

      await loadSuppliers();

      setShowModal(false);
      setEditingSupplier(null);

      toast.success(
        editingSupplier
          ? "Supplier Updated Successfully"
          : "Supplier Added Successfully"
      );
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.detail ||
          "Unable to save supplier."
      );
    }
  }

  async function handleDelete(supplier) {
    if (
      !window.confirm(
        `Delete "${supplier.company_name}"?`
      )
    ) {
      return;
    }

    try {
      await deleteSupplier(supplier.id);

      await loadSuppliers();

      toast.success("Supplier Deleted Successfully");
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.detail ||
          "Unable to delete supplier."
      );
    }
  }

  const filteredSuppliers = suppliers.filter((supplier) => {
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
  });

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">

      <SupplierToolbar
        search={search}
        setSearch={setSearch}
        onAdd={() => {
          setEditingSupplier(null);
          setShowModal(true);
        }}
      />

      <SupplierModal
        open={showModal}
        supplier={editingSupplier}
        onClose={() => {
          setShowModal(false);
          setEditingSupplier(null);
        }}
        onSave={handleSave}
      />

      {filteredSuppliers.length === 0 ? (
        <EmptyState message="No Suppliers Found" />
      ) : (
        <SupplierTable
          suppliers={filteredSuppliers}
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
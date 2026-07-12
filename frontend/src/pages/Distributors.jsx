import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";

import DistributorStats from "../components/distributors/DistributorStats";
import DistributorToolbar from "../components/distributors/DistributorToolbar";
import DistributorTable from "../components/distributors/DistributorTable";
import DistributorModal from "../components/distributors/DistributorModal";
import DistributorProfileDrawer from "../components/distributors/DistributorProfileDrawer";

import {
  getDistributors,
  createDistributor,
  updateDistributor,
  deleteDistributor,
} from "../services/distributors";

function Distributors() {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingDistributor, setEditingDistributor] =
    useState(null);

  const [selectedDistributor, setSelectedDistributor] =
    useState(null);

  const [showProfile, setShowProfile] =
    useState(false);

  useEffect(() => {
    loadDistributors();
  }, []);

  async function loadDistributors() {
    try {
      setLoading(true);

      const data =
        await getDistributors();

      setDistributors(data);

      setError("");
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load distributors."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(data) {
    try {
      if (editingDistributor) {
        await updateDistributor(
          editingDistributor.id,
          data
        );

        toast.success(
          "Distributor Updated Successfully"
        );
      } else {
        await createDistributor(data);

        toast.success(
          "Distributor Added Successfully"
        );
      }

      await loadDistributors();

      setShowModal(false);
      setEditingDistributor(null);

    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
        "Unable to save distributor."
      );
    }
  }

  async function handleDelete(distributor) {
    if (
      !window.confirm(
        `Delete "${distributor.company_name}"?`
      )
    ) {
      return;
    }

    try {

      await deleteDistributor(
        distributor.id
      );

      await loadDistributors();

      toast.success(
        "Distributor Deleted Successfully"
      );

    } catch (err) {

      toast.error(
        err.response?.data?.detail ||
        "Unable to delete distributor."
      );

    }
  }

  const filtered =
    distributors.filter((d) => {

      const query =
        search.toLowerCase();

      return (
        d.company_name
          ?.toLowerCase()
          .includes(query) ||
        d.email
          ?.toLowerCase()
          .includes(query) ||
        d.phone
          ?.toLowerCase()
          .includes(query) ||
        d.region
          ?.toLowerCase()
          .includes(query)
      );

    });

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadDistributors}
      />
    );
  }

  return (
    <div className="space-y-6">

      <DistributorStats
        distributors={distributors}
      />

      <DistributorToolbar
        search={search}
        setSearch={setSearch}
        onAdd={() => {
          setEditingDistributor(null);
          setShowModal(true);
        }}
      />

      <DistributorModal
        open={showModal}
        distributor={editingDistributor}
        onClose={() => {
          setShowModal(false);
          setEditingDistributor(null);
        }}
        onSave={handleSave}
      />

      <DistributorProfileDrawer
        open={showProfile}
        distributor={selectedDistributor}
        onClose={() => {
          setShowProfile(false);
          setSelectedDistributor(null);
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          message="No Distributors Found"
          description="Add a distributor to begin."
        />
      ) : (
        <DistributorTable
          distributors={filtered}
          onView={(distributor) => {
            setSelectedDistributor(
              distributor
            );
            setShowProfile(true);
          }}
          onEdit={(distributor) => {
            setEditingDistributor(
              distributor
            );
            setShowModal(true);
          }}
          onDelete={handleDelete}
        />
      )}

    </div>
  );
}

export default Distributors;
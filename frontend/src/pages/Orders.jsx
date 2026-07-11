import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";

import OrderToolbar from "../components/orders/OrderToolbar";
import OrderTable from "../components/orders/OrderTable";
import CreateOrderModal from "../components/orders/CreateOrderModal";

import {
  getOrders,
  createOrder,
  updateOrderStatus,
} from "../services/orders";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);

      const data = await getOrders();
      setOrders(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(order) {
    try {
      await createOrder(order);
      await loadOrders();
      toast.success("Order created successfully.");
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.detail || "Failed to create order.";
      toast.error(message);
      throw err;
    }
  }

  async function handleStatusChange(orderId, status) {
    try {
      await updateOrderStatus(orderId, status);
      await loadOrders();
      toast.success("Order status updated.");
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.detail || "Failed to update status.";
      toast.error(message);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const query = search.toLowerCase();

    return (
      order.id.toString().includes(query) ||
      order.order_type?.toLowerCase().includes(query) ||
      order.status?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadOrders} />;
  }

  return (
    <div className="space-y-6">
      <OrderToolbar
        search={search}
        setSearch={setSearch}
        onCreate={() => setShowModal(true)}
      />

      <CreateOrderModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreate}
      />

      {filteredOrders.length === 0 ? (
        <EmptyState
          message="No Orders Found"
          description="Create your first procurement or supply order."
        />
      ) : (
        <OrderTable
          orders={filteredOrders}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

export default Orders;
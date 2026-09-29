import api from "./api";

// Standard Orders
export async function getOrders() {
  const response = await api.get("/orders/");
  return response.data;
}

export async function getOrder(id) {
  const response = await api.get(`/orders/${id}`);
  return response.data;
}

export async function createOrder(order) {
  const response = await api.post("/orders/", order);
  return response.data;
}

export async function updateOrderStatus(orderId, status) {
  const response = await api.put(`/orders/${orderId}/status`, { status });
  return response.data;
}

// Procurement
export async function getProcurementSuggestions(limit = 10) {
  const response = await api.get("/procurement/suggestions", { params: { limit } });
  return response.data;
}

export async function getProcurementOrders(limit = 20) {
  const response = await api.get("/procurement/orders", { params: { limit } });
  return response.data;
}

export async function createProcurementOrder(distributorId, limit = 10) {
  const response = await api.post("/procurement/create-order", {
    distributor_id: distributorId,
    limit: limit
  });
  return response.data;
}

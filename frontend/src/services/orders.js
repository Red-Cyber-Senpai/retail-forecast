import api from "./api";

/*
    Get all orders
*/
export async function getOrders() {
  const response = await api.get("/orders/");
  return response.data;
}

/*
    Get single order
*/
export async function getOrder(id) {
  const response = await api.get(`/orders/${id}`);
  return response.data;
}

/*
    Create order
*/
export async function createOrder(order) {
  const response = await api.post("/orders/", order);
  return response.data;
}

/*
    Update order status
*/
export async function updateOrderStatus(orderId, status) {
  const response = await api.put(
    `/orders/${orderId}/status`,
    {
      status,
    }
  );

  return response.data;
}
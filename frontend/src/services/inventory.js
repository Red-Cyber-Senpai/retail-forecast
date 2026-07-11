import api from "./api";

export async function getInventory() {
  const response = await api.get("/inventory/");
  return response.data;
}

export async function getLowStockProducts() {
  const response = await api.get("/inventory/low-stock");
  return response.data;
}

export async function addStock(data) {
  const response = await api.post("/inventory/add", data);
  return response.data;
}

export async function removeStock(data) {
  const response = await api.post("/inventory/remove", data);
  return response.data;
}

export async function getInventoryLogs() {
  const response = await api.get("/inventory/logs");
  return response.data;
}
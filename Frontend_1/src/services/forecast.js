import api from "./api";

export async function getForecast(productId, days = 7) {
  const response = await api.get(`/forecast/${productId}?days=${days}`);
  return response.data;
}

export async function getSmartReorder() {
  const response = await api.get("/reorder/");
  return response.data;
}

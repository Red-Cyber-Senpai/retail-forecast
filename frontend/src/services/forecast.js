import api from "./api";

export async function getForecast(productId, days = 7) {
  const response = await api.get(`/forecast/${productId}?days=${days}`);
  return response.data;
}
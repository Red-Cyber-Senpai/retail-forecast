import api from "./api";

export async function getDistributors() {
  const response = await api.get("/distributors/");
  return response.data;
}

export async function getDistributor(id) {
  const response = await api.get(`/distributors/${id}`);
  return response.data;
}

export async function createDistributor(distributor) {
  const response = await api.post("/distributors/", distributor);
  return response.data;
}

export async function updateDistributor(id, distributor) {
  const response = await api.put(`/distributors/${id}`, distributor);
  return response.data;
}

export async function deleteDistributor(id) {
  const response = await api.delete(`/distributors/${id}`);
  return response.data;
}

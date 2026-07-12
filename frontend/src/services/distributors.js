import api from "./api";

/* -----------------------------
   Get All Distributors
------------------------------ */
export async function getDistributors() {
  const response = await api.get("/distributors/");
  return response.data;
}

/* -----------------------------
   Get Distributor By ID
------------------------------ */
export async function getDistributor(id) {
  const response = await api.get(`/distributors/${id}`);
  return response.data;
}

/* -----------------------------
   Create Distributor
------------------------------ */
export async function createDistributor(distributor) {
  const response = await api.post(
    "/distributors/",
    distributor
  );

  return response.data;
}

/* -----------------------------
   Update Distributor
------------------------------ */
export async function updateDistributor(
  id,
  distributor
) {
  const response = await api.put(
    `/distributors/${id}`,
    distributor
  );

  return response.data;
}

/* -----------------------------
   Delete Distributor
------------------------------ */
export async function deleteDistributor(id) {
  const response = await api.delete(
    `/distributors/${id}`
  );

  return response.data;
}
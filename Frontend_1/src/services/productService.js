import api from "./api";

export async function getProducts(params = {}) {
  const response = await api.get("/products/", { params });
  return response.data;
}

export async function getProduct(id) {
  const response = await api.get(`/products/${id}`);
  return response.data;
}

export async function getProductByBarcode(barcode) {
  const response = await api.get(`/products/barcode/${barcode}`);
  return response.data;
}

export async function getProductsBySupplier(supplierId) {
  const response = await api.get(`/products/supplier/${supplierId}`);
  return response.data;
}

export async function addProduct(product) {
  const response = await api.post("/products/", product);
  return response.data;
}

export async function updateProduct(id, product) {
  const response = await api.put(`/products/${id}`, product);
  return response.data;
}

export async function deleteProduct(id) {
  const response = await api.delete(`/products/${id}`);
  return response.data;
}

export async function smartSearch(q, limit = 20) {
  const response = await api.get("/search/", { params: { q, limit } });
  return response.data;
}

import api from "./api";

/* -----------------------------
   Get Products
------------------------------ */
export async function getProducts(params = {}) {
  const response = await api.get("/products/", {
    params,
  });

  return response.data;
}

/* -----------------------------
   Get Product By ID
------------------------------ */
export async function getProduct(id) {
  const response = await api.get(
    `/products/${id}`
  );

  return response.data;
}

/* -----------------------------
   Get Product By Barcode
------------------------------ */
export async function getProductByBarcode(
  barcode
) {
  const response = await api.get(
    `/products/barcode/${barcode}`
  );

  return response.data;
}

/* -----------------------------
   Get Products By Supplier
------------------------------ */
export async function getProductsBySupplier(
  supplierId
) {
  const response = await api.get(
    `/products/supplier/${supplierId}`
  );

  return response.data;
}

/* -----------------------------
   Add Product
------------------------------ */
export async function addProduct(product) {
  const response = await api.post(
    "/products/",
    product
  );

  return response.data;
}

/* -----------------------------
   Update Product
------------------------------ */
export async function updateProduct(
  id,
  product
) {
  const response = await api.put(
    `/products/${id}`,
    product
  );

  return response.data;
}

/* -----------------------------
   Delete Product
------------------------------ */
export async function deleteProduct(id) {
  const response = await api.delete(
    `/products/${id}`
  );

  return response.data;
}
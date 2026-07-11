import api from "./api";

export async function scanImage(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/recognition/scan",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

export async function confirmProduct(data) {
  const response = await api.post(
    "/recognition/confirm",
    data
  );

  return response.data;
}
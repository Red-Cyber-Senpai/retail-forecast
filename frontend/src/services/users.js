import api from "./api";

export async function getUsers() {
  const response = await api.get("/users");
  return response.data;
}

export async function getUser(id) {
  const response = await api.get(`/users/${id}`);
  return response.data;
}

export async function changeRole(id, role) {
  const response = await api.put(
    `/users/${id}/role`,
    {
      role,
    }
  );

  return response.data;
}

export async function activateUser(id) {
  const response = await api.put(
    `/users/${id}/activate`
  );

  return response.data;
}

export async function deactivateUser(id) {
  const response = await api.put(
    `/users/${id}/deactivate`
  );

  return response.data;
}
import api from "./axios"

export const registerApi = async (formData) => {
  const res = await api.post(
    "/users/register",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

export const loginApi = async (formData) => {
  const res = await api.post("/users/login", formData);
  return res.data;
};

export const logoutApi = async () => {
  const res = await api.post("/users/logout");
  return res.data;
};

export const getMeApi = async () => {
  const res = await api.get("/users/me");
  return res.data;
};


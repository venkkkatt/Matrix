import axios from "axios";
import useAuthStore from "../store/authStore";

const api = axios.create({
  baseURL: ["http://localhost:5000/api", import.meta.env.VITE_API_URL],
  withCredentials: true,
});

export default api;
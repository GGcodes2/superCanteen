// src/api/axios.js
import axios from "axios";

const API_BASE =
  import.meta?.env?.VITE_API_URL || "https://supercanteen-backend.onrender.com/api";

const API = axios.create({
  baseURL: API_BASE,
  withCredentials: false, // set to false unless you need cookies; if using Bearer tokens, keep false
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;

// src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://supercanteen-backend.onrender.com", // or your backend URL
});

// Attach token to every request automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;

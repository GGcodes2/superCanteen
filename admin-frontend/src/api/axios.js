import axios from "axios";


API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});


const API = axios.create({
  baseURL: "https://supercanteen-backend.onrender.com/api",
  withCredentials: true,
});

export default API;

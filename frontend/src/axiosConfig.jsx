import axios from "axios";

function readToken() {
  try {
    const raw =
      sessionStorage.getItem("user") || localStorage.getItem("user") || "";
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed?.token) return parsed.token;
  } catch {}
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    ""
  );
}

//  uses relative path; Nginx handles prod, CRA dev proxy handles local
const axiosInstance = axios.create({ baseURL: "/api" });

axiosInstance.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;

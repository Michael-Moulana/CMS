import axios from "axios";

/**
 * Read JWT from where your app stores it.
 * - preferred: JSON string under "user" with a `token` field
 * - fallbacks: "token"/"authToken" keys in localStorage/sessionStorage
 */
function readToken() {
  try {
    const raw =
      sessionStorage.getItem("user") ||
      localStorage.getItem("user") ||
      "";
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed?.token) return parsed.token;
  } catch {
    
  }
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    ""
  );
}

const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api", 
});

axiosInstance.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;

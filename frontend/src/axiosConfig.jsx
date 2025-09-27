import axios from "axios";

// ---- helper to fetch the JWT from where your app actually stores it ----
function readToken() {
  // 1) your app stores a JSON string in sessionStorage under "user"
  const raw =
    sessionStorage.getItem("user") ||
    localStorage.getItem("user") || // in case it ever moves to localStorage
    ""; 

  try {
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed?.token) return parsed.token;
  } catch {
    // ignore JSON parse issues
  }

  // 2) fallback: plain tokens some code might have written earlier
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

// attach Authorization header if we find a token
axiosInstance.interceptors.request.use((config) => {
  const token = readToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosInstance;
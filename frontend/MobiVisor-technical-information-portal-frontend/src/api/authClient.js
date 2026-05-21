import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

let refreshPromise = null;

const clearSession = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("role");
  localStorage.removeItem("roles");
};

const storeAuthTokens = (data) => {
  if (!data?.accessToken) {
    throw new Error("Access token response içinde yok");
  }
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("role", data.role);
};

const refreshTokens = async () => {
  const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {}, { withCredentials: true });
  storeAuthTokens(response.data);
  return response.data.accessToken;
};

axios.defaults.withCredentials = true;

axios.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest = originalRequest?.url?.includes("/api/v1/auth/");

    if (error.response?.status !== 401 || originalRequest?._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ||= refreshTokens().finally(() => {
        refreshPromise = null;
      });
      const accessToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axios(originalRequest);
    } catch (refreshError) {
      clearSession();
      window.location.href = "/";
      return Promise.reject(refreshError);
    }
  }
);

export { clearSession, storeAuthTokens };

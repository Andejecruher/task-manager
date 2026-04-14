import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Importante para enviar cookies
});

const authApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

authApiClient.interceptors.request.use(
  (config) => {
    // También puedes leer cookies específicas
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts?.pop()?.split(";")?.shift();
    };

    const token = getCookie("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

authApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Token inválido o expirado - limpiar sesión
      console.warn("Authentication error: ", error.response.data);
    }
    return Promise.reject(error);
  },
);

export { apiClient, authApiClient };

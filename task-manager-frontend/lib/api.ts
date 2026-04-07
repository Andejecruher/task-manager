import axios from "axios";

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

const authApiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

authApiClient.interceptors.request.use((config => {
    const tokens = JSON.parse(localStorage.getItem("authTokens") || "null");
    if (tokens && tokens.accessToken) {
        config.headers["Authorization"] = `Bearer ${tokens.accessToken}`;
    }
    return config;
}), error => {
    return Promise.reject(error);
});

authApiClient.interceptors.response.use(response => {
    return response;
}, error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem("authTokens");
        window.location.href = "/login";
    }
    return Promise.reject(error);
});

export { apiClient, authApiClient };

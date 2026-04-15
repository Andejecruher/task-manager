import { apiClient } from "@/lib/api";
import { ApiResponse, AuthUser, LoginDTO, RegisterDTO } from "@/types";
import axios from "axios";

// Función para limpiar cookies
function clearAuthCookies() {
  const cookiesToClear = ["access_token", "refresh_token"];
  const path = "/";

  cookiesToClear.forEach((cookieName) => {
    // Limpiar cookie
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${window.location.hostname}`;
  });
}

export async function registerServices(
  data: RegisterDTO,
): Promise<ApiResponse<AuthUser>> {
  return await axios
    .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, data, {
      withCredentials: true,
    })
    .then((response) => response.data)
    .catch((error) => {
      throw error.response?.data;
    });
}

export async function getMeServices(): Promise<ApiResponse<AuthUser>> {
  const token = JSON.parse(localStorage.getItem("authTokens") || "null");
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  return await axios
    .get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token["accessToken"]}`,
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      throw error.response?.data;
    });
}

export async function loginServices(
  data: LoginDTO,
): Promise<ApiResponse<AuthUser>> {
  return await axios
    .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, data, {
      withCredentials: true,
    })
    .then((response) => response.data)
    .catch((error) => {
      throw error.response?.data;
    });
}

export async function validateSlug(slug: string): Promise<boolean> {
  return await axios
    .get(`${process.env.API_URL}/auth/validate-slug/${slug}`)
    .then((response) => response.data.data.exists)
    .catch((error) => false);
}

export async function logoutAllServices(): Promise<
  ApiResponse<{ revokedCount: number }>
> {
  try {
    //si falla, igual limpiamos todo
    await apiClient.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/logout-all`
    );
  } catch (error) {
    console.error("Logout API error:", error);
  } finally {
    // Siempre limpiar cookies y localStorage
    clearAuthCookies();
  }

  return { success: true, data: { revokedCount: 0 } } as any;
}

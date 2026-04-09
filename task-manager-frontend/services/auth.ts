import { ApiResponse, AuthUser, LoginDTO, RegisterDTO } from "@/types";
import axios from "axios";

export async function registerServices(
  data: RegisterDTO,
): Promise<ApiResponse<AuthUser>> {
  return await axios
    .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, data, {
      withCredentials: true,
    })
    .then((response) => {
      return response.data;
    })
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
    .then((response) => {
      return response.data;
    })
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
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error.response?.data;
    });
}


export async function validateSlug(slug: string): Promise<ApiResponse<Boolean>> {
  return await axios
    .get(`${process.env.API_URL}/auth/validate-slug/${slug}`)
    .then((response) => {
      return response.data.data.exists;
    })
    .catch((error) => {
      return false;
    });
}
"use client";

import { getCookie } from "@/lib/cookies";
import {
  getMeServices,
  loginServices,
  logoutAllServices,
  registerServices,
  updateProfileService,
  changePasswordService,
} from "@/services/auth";
import { AuthUser, Company, LoginDTO, RegisterDTO } from "@/types";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

// ── Context type ─────────────────────────────────────────────────────────────

interface AuthContextType {
  user: AuthUser | null;
  company: Company;
  loading: boolean;
  sessionBanner: boolean;
  login: (
    email: string,
    password: string,
    companySlug?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterDTO) => Promise<boolean>;
  updateProfile: (data: {
    fullName?: string;
    avatarUrl?: string;
  }) => Promise<void>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionBanner, setSessionBanner] = useState(false);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string, companySlug?: string) => {
      setLoading(true);
      try {
        const loginData: LoginDTO = {
          email,
          password,
          companySlug: companySlug || "",
        };
        const result = await loginServices(loginData);

        if (result.success) {
          const { user, company, tokens } = result.data;
          setUser({ user, company, tokens });

          setTimeout(() => {
            router.replace(`/${company.slug}/workspaces`);
          }, 1500);
        } else {
          throw new Error(result.error || "Login failed");
        }
      } catch (error: any) {
        const errorMessage =
          error?.message || "Invalid credentials or company slug";
        toast.error("Login failed", {
          description: errorMessage,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await logoutAllServices();
      toast.info("Logged out", {
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout error", {
        description:
          "There was an error, but you have been logged out locally.",
      });
    } finally {
      setUser(null);
      const companySlug =
        user?.company?.slug ||
        window.location.pathname.split("/")[1] ||
        "login";
      router.replace(`/${companySlug}/login`);
    }
  }, [router, user]);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(
    async ({
      fullName,
      email,
      password,
      companyName,
      companySlug,
    }: RegisterDTO) => {
      try {
        const result = await registerServices({
          fullName,
          email,
          password,
          companyName,
          companySlug,
        });

        if (result.success) {
          const { user, company, tokens } = result.data;
          setUser({ user, company, tokens });

          setTimeout(() => {
            router.replace(`/${company.slug}/workspaces`);
          }, 1500);
          return true;
        }
        return false;
      } catch (error) {
        throw error;
      }
    },
    [router],
  );

  // ── Get Me (recuperar sesión al recargar) ────────────────────────────────
  const getMe = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getMeServices();
      if (result.success) {
        const { user, company, tokens } = result.data;
        setUser({ user, company, tokens });
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Update Profile ────────────────────────────────────────────────────────
  const updateProfile = useCallback(
    async (data: { fullName?: string; avatarUrl?: string }) => {
      try {
        await updateProfileService(data);
        // Recargar datos del usuario para actualizar el estado
        await getMe();
        toast.success("Profile updated successfully");
      } catch (error: any) {
        toast.error("Error updating profile", {
          description: error?.message || "An error occurred",
        });
        throw error;
      }
    },
    [getMe],
  );

  // ── Change Password ───────────────────────────────────────────────────────
  const changePassword = useCallback(
    async (data: { currentPassword: string; newPassword: string }) => {
      try {
        await changePasswordService(data);
        toast.success("Password changed successfully");
      } catch (error: any) {
        toast.error("Error changing password", {
          description: error?.message || "An error occurred",
        });
        throw error;
      }
    },
    [],
  );

  // ── Efecto para recuperar sesión al cargar la app ────────────────────────
  useEffect(() => {
    const token = getCookie("access_token");
    if (!user && token) {
      getMe();
    }
  }, [getMe, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        company: {} as Company,
        loading,
        sessionBanner,
        login,
        logout,
        register,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook para usar el contexto ──────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

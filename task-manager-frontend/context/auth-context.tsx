"use client";

import {
  getMeServices,
  loginServices,
  registerServices,
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
  logout: () => void;
  register: (data: RegisterDTO) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionBanner, setSessionBanner] = useState(false);

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
          localStorage.setItem("authTokens", JSON.stringify(tokens));

          toast.success("Login successful", {
            description: `Welcome back, ${user.fullName || user.email}!`,
          });

          setTimeout(() => {
            router.replace(`/${company.slug}/workspaces`);
          }, 1500); // Redirect after 1.5 seconds to show success message

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

  const logout = useCallback(() => {
    localStorage.removeItem("authTokens");
    setUser(null);
    router.replace("/login");
    toast.info("Logged out", {
      description: "You have been successfully logged out.",
    });
  }, [router]);

  const register = useCallback(
    async ({
      fullName,
      email,
      password,
      companyName,
      companySlug,
    }: RegisterDTO) => {
      const newUser: RegisterDTO = {
        fullName,
        email,
        companySlug,
        companyName,
        password: password,
      };

      try {
        const result = await registerServices(newUser);
        if (result.success) {
          const { user, company, tokens } = result.data;
          setUser({ user, company, tokens });
          localStorage.setItem("authTokens", JSON.stringify(tokens));
          setTimeout(() => {
            router.replace(`/${company.slug}/workspaces`);
          }, 1500); // Redirect after 1.5 seconds to show success message
          return true;
        } else {
          // Handle registration error (e.g., show error message)
          return false;
        }
      } catch (error) {
        throw error;
      }
    },
    [router],
  );

  const getMe = useCallback(async () => {
    try {
      const tokens = localStorage.getItem("authTokens");
      if (!tokens) {
        setLoading(false);
        return;
      }

      const result = await getMeServices();
      if (result.success) {
        const { user, company } = result.data;
        setUser({
          user,
          company,
          tokens: JSON.parse(tokens),
        });
      } else {
        console.error("Failed to fetch user profile:", result.error);
        // Token inválido - limpiar sesión
        localStorage.removeItem("authTokens");
        setUser(null);
        if (window.location.pathname !== "/login") {
          router.replace("/login");
        }
      }
    } catch (error: any) {
      // 👇 Este es el cambio importante
      console.error("Error fetching user profile:", error);

      // Limpiar sesión en cualquier error de autenticación
      localStorage.removeItem("authTokens");
      setUser(null);

      // Redirigir a login si no está ya ahí
      if (window.location.pathname !== "/login") {
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const tokens = localStorage.getItem("authTokens");
    if (tokens) {
      getMe();
    } else {
      setLoading(false);
      if (window.location.pathname !== "/login") {
        router.replace("/login");
      }
    }
  }, [getMe]);

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

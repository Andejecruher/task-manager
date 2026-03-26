"use client"

import { getMeServices, registerServices } from "@/services/auth"
import { AuthUser, Company, RegisterDTO } from "@/types"
import { useRouter } from "next/navigation"
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode
} from "react"
// ── Context type ─────────────────────────────────────────────────────────────

interface AuthContextType {
    user: AuthUser | null
    company: Company
    loading: boolean
    sessionBanner: boolean
    login: (email: string, password: string, companySlug?: string) => Promise<void>
    logout: () => void
    register: (data: RegisterDTO) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter()
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(false)
    const [sessionBanner, setSessionBanner] = useState(false)

    // ── Auth ────────────────────────────────────────────────────────────────
    const login = useCallback(
        async (email: string, _password: string, _companySlug?: string) => {
            // Todo: Implement company slug logic
        },
        [router],
    )

    const logout = useCallback(() => {
        // TODO: Implement logout logic (e.g., clear tokens, reset state)
    }, [router])

    const register = useCallback(
        async ({ fullName, email, password, companyName, companySlug }: RegisterDTO) => {

            const newUser: RegisterDTO = {
                fullName,
                email,
                companySlug,
                companyName,
                password: password,
            }

            try {
                const result = await registerServices(newUser)
                if (result.success) {
                    const { user, company, tokens } = result.data
                    setUser({ user, company, tokens })
                    localStorage.setItem("authTokens", JSON.stringify(tokens))
                    setTimeout(() => {
                        router.replace("/workspaces")
                    }, 1500) // Redirect after 1.5 seconds to show success message
                    return true;
                } else {
                    // Handle registration error (e.g., show error message)
                    console.error("Registration failed:", result.error);
                    return false;
                }
            } catch (error) {
                throw error;
            }
        },
        [router],
    )

    const getMe = useCallback(async () => {
        try {
            const result = await getMeServices();
            if (result.success) {
                const { user, company } = result.data
                setUser({ user, company, tokens: JSON.parse(localStorage.getItem("authTokens") || "null") })
            } else {
                console.error("Failed to fetch user profile:", result.error);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }

    }, [user, router])

    useEffect(() => {
        const tokens = localStorage.getItem("authTokens")
        if (tokens) {
            getMe()
        } else {
            setLoading(false)
        }
    }, [])

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
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
    return ctx
}

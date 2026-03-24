"use client"

import type { CompanyContext, Task, Workspace } from "@/lib/types"
import { registerServices } from "@/services/auth/register"
import { AuthUser, RegisterDTO, UserRole } from "@/types"
import { useRouter } from "next/navigation"
import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode
} from "react"
// ── Context type ─────────────────────────────────────────────────────────────

interface AuthContextType {
    user: AuthUser | null
    users: AuthUser[]
    tasks: Task[]
    workspaces: Workspace[]
    company: CompanyContext
    loading: boolean
    sessionBanner: boolean
    login: (email: string, password: string, companySlug?: string) => Promise<void>
    logout: () => void
    register: (data: RegisterDTO) => Promise<boolean>
    updateUser: (updates: Partial<AuthUser>) => void
    // Task operations
    addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
    updateTask: (id: string, updates: Partial<Task>) => void
    deleteTask: (id: string) => void
    // User management
    addUser: (data: { name: string; email: string; role: UserRole; companyId: string }) => void
    updateUserRole: (userId: string, role: UserRole) => void
    deleteUser: (userId: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter()
    const [user, setUser] = useState<AuthUser | null>(null)
    const [users, setUsers] = useState<AuthUser[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [sessionBanner, setSessionBanner] = useState(false)

    // ── Auth ────────────────────────────────────────────────────────────────

    const login = useCallback(
        async (email: string, _password: string, _companySlug?: string) => {
            // Todo: Implement company slug logic
        },
        [users, router],
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

            const result = await registerServices(newUser)

            // TODO: Implement registration logic (e.g., create user, assign to company)
            return result;
        },
        [users, router],
    )

    const updateUser = useCallback(
        (updates: Partial<AuthUser>) => {
            // TODO: Implement user update logic (e.g., update name, email)
        },
        [user?.id],
    )

    // ── Task operations ────────────────────────────────────────────────────

    const addTask = useCallback((data: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
        // TODO: Implement add task logic (e.g., create task with generated ID and timestamps)
    }, [])

    const updateTask = useCallback((id: string, updates: Partial<Task>) => {
        // TODO: Implement update task logic (e.g., find task by ID and apply updates)
    }, [])

    const deleteTask = useCallback((id: string) => {
        // TODO: Implement delete task logic (e.g., remove task by ID)
    }, [])

    // ── User management ────────────────────────────────────────────────────

    const addUser = useCallback(
        (data: { name: string; email: string; role: UserRole; companyId: string }) => {
            // TODO: Implement add user logic (e.g., create user and assign to company)
        },
        [],
    )

    const updateUserRole = useCallback((userId: string, role: UserRole) => {

    }, [])

    const deleteUser = useCallback((userId: string) => {

    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                users,
                tasks,
                workspaces: [],
                company: {} as CompanyContext,
                loading,
                sessionBanner,
                login,
                logout,
                register,
                updateUser,
                addTask,
                updateTask,
                deleteTask,
                addUser,
                updateUserRole,
                deleteUser,
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

"use client"

import type { AuthUser, CompanyContext, Task, UserRole, Workspace } from "@/lib/types"
import { useRouter } from "next/navigation"
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react"

// ── Seed data ────────────────────────────────────────────────────────────────

const SEED_COMPANY: CompanyContext = {
    id: "company-1",
    name: "Acme Corp",
    slug: "acme",
    createdAt: "2024-01-01T00:00:00Z",
}

const SEED_WORKSPACES: Workspace[] = [
    {
        id: "ws-1",
        name: "Product",
        description: "Product design, roadmap, and feature development.",
        companyId: "company-1",
        createdAt: "2024-01-05T00:00:00Z",
        updatedAt: new Date().toISOString(),
        memberCount: 3,
        taskCount: 5,
    },
    {
        id: "ws-2",
        name: "Engineering",
        description: "Backend, frontend, and infrastructure tasks.",
        companyId: "company-1",
        createdAt: "2024-01-10T00:00:00Z",
        updatedAt: new Date().toISOString(),
        memberCount: 2,
        taskCount: 0,
    },
]

const SEED_USERS: AuthUser[] = [
    {
        id: "user-1",
        email: "owner@acme.com",
        name: "Alex Johnson",
        role: "Owner",
        companyId: "company-1",
        companySlug: "acme",
        createdAt: "2024-01-01T00:00:00Z",
    },
    {
        id: "user-2",
        email: "admin@acme.com",
        name: "Sarah Chen",
        role: "Admin",
        companyId: "company-1",
        companySlug: "acme",
        createdAt: "2024-01-15T00:00:00Z",
    },
    {
        id: "user-3",
        email: "dev@acme.com",
        name: "Marcus Lee",
        role: "User",
        companyId: "company-1",
        companySlug: "acme",
        createdAt: "2024-02-01T00:00:00Z",
    },
]

const SEED_TASKS: Task[] = [
    {
        id: "task-1",
        title: "Design new landing page",
        description: "Create wireframes and mockups for the updated landing page.",
        status: "in_progress",
        priority: "high",
        assigneeId: "user-1",
        workspaceId: "ws-1",
        companyId: "company-1",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["design", "frontend"],
        createdBy: "user-1",
        createdAt: "2024-03-01T00:00:00Z",
        updatedAt: new Date().toISOString(),
    },
    {
        id: "task-2",
        title: "Fix authentication bug",
        description: "Users are occasionally logged out unexpectedly. Investigate and fix.",
        status: "todo",
        priority: "urgent",
        assigneeId: "user-1",
        workspaceId: "ws-1",
        companyId: "company-1",
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["bug", "auth"],
        createdBy: "user-2",
        createdAt: "2024-03-05T00:00:00Z",
        updatedAt: new Date().toISOString(),
    },
    {
        id: "task-3",
        title: "Write API documentation",
        description: "Document all public endpoints using OpenAPI spec.",
        status: "done",
        priority: "medium",
        assigneeId: "user-1",
        workspaceId: "ws-1",
        companyId: "company-1",
        tags: ["docs"],
        createdBy: "user-1",
        createdAt: "2024-02-20T00:00:00Z",
        updatedAt: new Date().toISOString(),
    },
    {
        id: "task-4",
        title: "Set up CI/CD pipeline",
        description: "Configure GitHub Actions for automated testing and deployment.",
        status: "in_review",
        priority: "high",
        assigneeId: "user-2",
        workspaceId: "ws-1",
        companyId: "company-1",
        tags: ["devops"],
        createdBy: "user-2",
        createdAt: "2024-03-10T00:00:00Z",
        updatedAt: new Date().toISOString(),
    },
    {
        id: "task-5",
        title: "Onboard new team members",
        description: "Prepare onboarding materials and schedule intro sessions.",
        status: "todo",
        priority: "medium",
        assigneeId: "user-3",
        workspaceId: "ws-1",
        companyId: "company-1",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["hr"],
        createdBy: "user-1",
        createdAt: "2024-03-12T00:00:00Z",
        updatedAt: new Date().toISOString(),
    },
]

const STORAGE_KEY_USER = "tm_current_user"
const STORAGE_KEY_TASKS = "tm_tasks"
const STORAGE_KEY_USERS = "tm_users"

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
    register: (name: string, email: string, password: string, role?: UserRole) => Promise<boolean>
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
    const [users, setUsers] = useState<AuthUser[]>(SEED_USERS)
    const [tasks, setTasks] = useState<Task[]>(SEED_TASKS)
    const [loading, setLoading] = useState(true)
    const [sessionBanner, setSessionBanner] = useState(false)

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem(STORAGE_KEY_USER)
            const storedTasks = localStorage.getItem(STORAGE_KEY_TASKS)
            const storedUsers = localStorage.getItem(STORAGE_KEY_USERS)
            if (storedUser) setUser(JSON.parse(storedUser))
            if (storedTasks) setTasks(JSON.parse(storedTasks))
            if (storedUsers) setUsers(JSON.parse(storedUsers))
        } catch {
            // ignore parse errors
        } finally {
            setLoading(false)
        }
    }, [])

    // Persist tasks & users whenever they change
    useEffect(() => {
        if (!loading) localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks))
    }, [tasks, loading])

    useEffect(() => {
        if (!loading) localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users))
    }, [users, loading])

    // ── Auth ────────────────────────────────────────────────────────────────

    const login = useCallback(
        async (email: string, _password: string, _companySlug?: string) => {
            const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
            if (!found) throw new Error("No account found with that email address.")
            setUser(found)
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(found))
            router.push("/workspaces")
        },
        [users, router],
    )

    const logout = useCallback(() => {
        setUser(null)
        router.replace("/login")
    }, [router])

    const register = useCallback(
        async (name: string, email: string, _password: string, role: UserRole = "User") => {
            const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase())
            if (exists) throw new Error("An account with this email already exists.")
            const newUser: AuthUser = {
                id: `user-${Date.now()}`,
                email,
                name,
                role,
                companyId: "company-1",
                companySlug: "acme",
                createdAt: new Date().toISOString(),
            }
            setUsers((prev) => [...prev, newUser])
            setUser(newUser)
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser))
            router.push("/workspaces")
            return true
        },
        [users, router],
    )

    const updateUser = useCallback(
        (updates: Partial<AuthUser>) => {
            setUser((prev: any) => {
                if (!prev) return null
                const updated = { ...prev, ...updates }
                localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated))
                return updated
            })
            setUsers((prev) => prev.map((u) => (u.id === user?.id ? { ...u, ...updates } : u)))
        },
        [user?.id],
    )

    // ── Task operations ────────────────────────────────────────────────────

    const addTask = useCallback((data: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
        const now = new Date().toISOString()
        const task: Task = {
            ...data,
            id: `task-${Date.now()}`,
            createdAt: now,
            updatedAt: now,
        }
        setTasks((prev) => [task, ...prev])
    }, [])

    const updateTask = useCallback((id: string, updates: Partial<Task>) => {
        setTasks((prev) =>
            prev.map((t) =>
                t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t,
            ),
        )
    }, [])

    const deleteTask = useCallback((id: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== id))
    }, [])

    // ── User management ────────────────────────────────────────────────────

    const addUser = useCallback(
        (data: { name: string; email: string; role: UserRole; companyId: string }) => {
            const newUser: AuthUser = {
                id: `user-${Date.now()}`,
                email: data.email,
                name: data.name,
                role: data.role,
                companyId: data.companyId,
                companySlug: "acme",
                createdAt: new Date().toISOString(),
            }
            setUsers((prev) => [...prev, newUser])
        },
        [],
    )

    const updateUserRole = useCallback((userId: string, role: UserRole) => {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)))
    }, [])

    const deleteUser = useCallback((userId: string) => {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                users,
                tasks,
                workspaces: SEED_WORKSPACES,
                company: SEED_COMPANY,
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

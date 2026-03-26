"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { loginSchema, type LoginInput } from "@/lib/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, CheckSquare } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

export default function LoginPage() {
    const { login, user, loading } = useAuth()
    const { toast } = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()
    const expired = searchParams.get("expired") === "1"

    // Redirect already-authenticated users
    useEffect(() => {
        if (!loading && user) router.replace("/workspaces")
    }, [loading, user, router])

    // Show session-expired toast once
    useEffect(() => {
        if (expired) {
            toast({ title: "Session expired", description: "Please sign in again.", variant: "destructive" })
        }
    }, [expired])

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    })

    const onSubmit = async (values: LoginInput) => {
        try {
            await login(values.email, values.password, values.companySlug)
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                "Invalid credentials or company slug"
            setError("root", { message })
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Spinner className="h-8 w-8 text-blue-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-background to-slate-50 dark:from-blue-950/20 dark:via-background dark:to-slate-950/20 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-3 pb-6">
                    <div className="flex justify-center">
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg">
                            <CheckSquare className="h-6 w-6 text-white" />
                            <span className="font-bold text-xl text-white">TaskFlow</span>
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Welcome back</CardTitle>
                    <CardDescription>Sign in to your workspace</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@company.com"
                                autoComplete="email"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-xs text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Root / server error */}
                        {errors.root && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.root.message}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Spinner className="h-4 w-4" />
                                    Signing in…
                                </span>
                            ) : (
                                "Sign in"
                            )}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Contact your workspace administrator to get access.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

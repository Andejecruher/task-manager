"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { CheckSquare } from "lucide-react"
import Link from "next/link"
import type React from "react"
import { useState } from "react"

export default function RegisterPage() {
    const { register } = useAuth()
    const [company, setCompany] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }
        console.log("Registering user:", { company, name, email, password })

        setLoading(true)
        try {
            await register(name, email, password)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-background to-blue-50 dark:from-blue-950/20 dark:via-background dark:to-blue-950/20 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-3">
                    <div className="flex justify-center">
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg">
                            <CheckSquare className="h-7 w-7 text-white" />
                            <span className="font-bold text-xl text-white">TaskFlow</span>
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Create your account</CardTitle>
                    <CardDescription>Get started with your workspace</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="company">Full company</Label>
                            <Input
                                id="company"
                                type="text"
                                placeholder="Acme Corp"
                                value={company}
                                onChange={(e: { target: { value: React.SetStateAction<string> } }) => setCompany(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Full name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e: { target: { value: React.SetStateAction<string> } }) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e: { target: { value: React.SetStateAction<string> } }) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Minimum 6 characters"
                                value={password}
                                onChange={(e: { target: { value: React.SetStateAction<string> } }) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                                {error}
                            </div>
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating account..." : "Create account"}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-600 hover:underline font-medium">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

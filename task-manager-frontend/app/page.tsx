"use client"

import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RootPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/workspaces" : "/login")
    }
  }, [loading, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Spinner className="h-8 w-8 text-blue-600" />
    </div>
  )
}

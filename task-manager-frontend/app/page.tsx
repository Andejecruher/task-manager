"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/context/auth-context"
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckSquare,
  Kanban,
  Layers,
  ShieldCheck,
  Users,
} from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Kanban,
    title: "Kanban Boards",
    description:
      "Visualize your workflow with drag-and-drop boards. Move tasks across columns and keep everyone in sync.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Invite teammates, assign roles, and delegate tasks. Everyone knows what to work on next.",
  },
  {
    icon: BarChart3,
    title: "Progress Dashboard",
    description:
      "Track completion rates, overdue tasks, and team velocity at a glance with real-time metrics.",
  },
  {
    icon: Layers,
    title: "Multiple Workspaces",
    description:
      "Organize work by team or project. Keep Engineering, Design, and Product separate and focused.",
  },
  {
    icon: Bell,
    title: "Priority & Due Dates",
    description:
      "Flag urgent tasks, set deadlines, and surface what needs attention before it becomes a problem.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description:
      "Owner, Admin, and Member roles ensure the right people have the right level of control.",
  },
]

const stats = [
  { value: "3x", label: "faster task resolution" },
  { value: "98%", label: "team adoption rate" },
  { value: "50+", label: "tasks per workspace" },
  { value: "0", label: "missed deadlines" },
]

export default function RootPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <CheckSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">TaskFlow</span>
          </div>
          <nav className="flex items-center gap-3">
            {user ? (
              <Button size="sm" asChild>
                <Link href="/workspaces">Go to Workspaces</Link>
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link href="/register">Get started free</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32 text-center">
          <Badge variant="secondary" className="mb-6 text-xs font-medium px-3 py-1">
            Task management for modern teams
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance leading-tight">
            Your team&apos;s work,
            <br />
            organized and on track.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed text-pretty">
            TaskFlow brings your tasks, projects, and team together in one clear workspace. No
            complexity — just focus, clarity, and momentum.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/register">
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            No credit card required. Free to use.
          </p>
        </section>

        {/* ── Stats strip ───────────────────────────────────────────── */}
        <section className="border-y border-border bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-3xl font-bold text-primary">{s.value}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Features grid ─────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
              Everything your team needs
            </h2>
            <p className="mt-4 text-muted-foreground text-lg text-pretty max-w-xl mx-auto leading-relaxed">
              Purpose-built features that keep work moving without getting in the way.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA banner ────────────────────────────────────────────── */}
        <section className="border-t border-border bg-primary">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground text-balance">
              Ready to get organized?
            </h2>
            <p className="mt-4 text-primary-foreground/80 text-lg leading-relaxed max-w-xl mx-auto">
              Create your free account and invite your team in minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 px-8 text-base"
                asChild
              >
                <Link href="/register">
                  Create free account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <CheckSquare className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">TaskFlow</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link href="/register" className="hover:text-foreground transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

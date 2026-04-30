"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import {
  CheckSquare,
  Layers,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  //función para manejar el cierre de sesión con estado de carga
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  const navigation = [
    { name: "Dashboard", href: `/${user?.company?.slug}/dashboard`, icon: LayoutDashboard },
    { name: "Workspaces", href: `/${user?.company?.slug}/workspaces`, icon: Layers },
    { name: "Team", href: `/${user?.company?.slug}/team`, icon: Users },
    { name: "Profile", href: `/${user?.company?.slug}/profile`, icon: User },
    { name: "Settings", href: `/${user?.company?.slug}/settings`, icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === `/${user?.company?.slug}/workspaces`)
      return pathname.startsWith(`/${user?.company?.slug}/workspaces`);
    return pathname === href;
  };

  return (
    <aside className="flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0 shrink-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 rounded-lg w-fit">
          <CheckSquare className="h-5 w-5 text-white" />
          <span className="font-bold text-base text-white">TaskFlow</span>
        </div>
        {user?.company?.slug && (
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            {user.company.slug}
          </p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <Link key={item.name} href={item.href}>
            <Button
              variant={isActive(item.href) ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          {theme === "light" ? "Dark mode" : "Light mode"}
        </Button>

        {user && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-blue-600 text-white text-sm">
                {user.user.fullName?.charAt(0).toUpperCase() ||
                  user.user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.user.fullName || user.user.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.user.role}
              </p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="h-5 w-5" />
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    </aside>
  );
}

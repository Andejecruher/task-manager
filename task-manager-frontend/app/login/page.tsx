"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/auth-context";
import { loginSchema, type LoginInput } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckSquare, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Redirect already-authenticated users
  useEffect(() => {
    if (!authLoading && user) {
      window.location.href = `/${user.company.slug}/workspaces`;
    }
  }, [authLoading, user]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const watchedPassword = watch("password");

  const passwordRequirements = {
    length: (watchedPassword?.length || 0) >= 8,
    upper: /[A-Z]/.test(watchedPassword || ""),
    lower: /[a-z]/.test(watchedPassword || ""),
    number: /\d/.test(watchedPassword || ""),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(watchedPassword || ""),
  };

  const isPasswordValid = watchedPassword
    ? Object.values(passwordRequirements).every(Boolean)
    : true;

  const onSubmit = async (values: LoginInput) => {
    try {
      await login(values.email, values.password, values.companySlug);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError("root", {
        message: error.message || "Invalid credentials or company slug",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-background to-slate-50 dark:from-blue-950/20 dark:via-background dark:to-slate-950/20 p-4">
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
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
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
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Company Slug */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Company Slug</Label>
              <div className="relative">
                <Input
                  id="companySlug"
                  type={"text"}
                  autoComplete="current-password"
                  {...register("companySlug")}
                  className="pr-10"
                />
              </div>
              {errors.companySlug && (
                <p className="text-xs text-destructive">
                  {errors.companySlug.message}
                </p>
              )}
            </div>

            {/* Root error */}
            {errors.root && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.root.message}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                isSubmitting || (watchedPassword ? !isPasswordValid : false)
              }
            >
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
  );
}

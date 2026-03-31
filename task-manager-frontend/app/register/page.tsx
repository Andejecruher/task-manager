"use client";

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
import { useAuth } from "@/context/auth-context";
import { RegisterSchema } from "@/lib/schemas";
import { ApiErrorResponse } from "@/types";
import { CheckSquare } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<Record<string, string[] | undefined>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({}); // Clear previous errors

    const { success, data, error } = RegisterSchema.safeParse({
      fullName,
      email,
      password,
      companyName,
      companySlug: companyName,
    });

    if (!success) {
      const { fieldErrors } = error.flatten();
      setError(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await register(data);
      if (result) {
        toast.success("Account created successfully! Please log in.");
        // TODO: Redirect to login or dashboard after successful registration
      }
    } catch (err: ApiErrorResponse | any) {
      if (err.error) {
        toast.error(err?.message || err.error);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                minLength={5}
                required
              />
              {"fullName" in error && error.fullName && (
                <p className="text-red-500 text-sm">
                  {error.fullName?.join(", ")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="string"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {"email" in error && error.email && (
                <p className="text-red-500 text-sm">
                  {error.email?.join(", ")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              {"password" in error && error.password && (
                <p className="text-red-500 text-sm">
                  {error.password?.join(", ")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Enter your company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                minLength={1}
                required
              />
              {"companyName" in error && error.companyName && (
                <p className="text-red-500 text-sm">
                  {error.companyName?.join(", ")}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

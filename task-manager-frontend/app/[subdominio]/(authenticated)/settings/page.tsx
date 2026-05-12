// app/[subdominio]/(authenticated)/settings/page.tsx
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useSettings } from "@/hooks/use-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  User,
  Mail,
  Shield,
  Calendar,
  Save,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

export default function SettingsPage() {
  const params = useParams();
  const subdominio = params.subdominio as string;

  const {
    user,
    workspace,
    stats,
    loading,
    saving,
    saved,
    name,
    email,
    setName,
    setEmail,
    loadData,
    updateProfile,
  } = useSettings();

  useEffect(() => {
    loadData(subdominio);
  }, [subdominio, loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    await updateProfile();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <div>
          <main className="flex-1 p-8">
            <div className="text-center text-muted-foreground">Cargando...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account and workspace preferences
            </p>
          </div>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-blue-600 text-white text-2xl">
                      {user?.fullName?.charAt(0).toUpperCase() ||
                        user?.name?.charAt(0).toUpperCase() ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {user?.fullName || user?.fullName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      <Shield className="h-3 w-3 mr-1" />
                      {user?.role || "User"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {saved && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-4 py-3 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    Profile updated successfully
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Workspace Information */}
          <Card>
            <CardHeader>
              <CardTitle>Workspace Information</CardTitle>
              <CardDescription>
                Details about your workspace and team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center h-12 w-12 rounded-lg"
                  style={{ backgroundColor: workspace?.color || "#3b82f6" }}
                >
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {workspace?.name || "Mi Workspace"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {workspace?.slug && `https://${workspace.slug}.tuapp.com`}
                  </p>
                  {workspace?.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {workspace.description}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{stats.totalTasks}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedTasks}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Your Tasks</p>
                  <p className="text-2xl font-bold">{stats.myTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Information about your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Account Type</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.role || "User"} account
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email Address</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Member Since</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.createdAt
                          ? format(new Date(user.createdAt), "MMMM d, yyyy")
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                  onClick={() => alert("This feature is not implemented")}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

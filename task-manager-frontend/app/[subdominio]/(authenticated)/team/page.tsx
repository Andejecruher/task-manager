"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { useTask } from "@/hooks/use-task";
import { useTeam } from "@/hooks/use-team";
import type { UserRole } from "@/lib/types";
import { format } from "date-fns";
import {
  Calendar,
  Crown,
  Mail,
  MoreVertical,
  Shield,
  Trash2,
  UserIcon,
  UserPlus,
} from "lucide-react";
import { useState } from "react";

// Función para normalizar el rol
const normalizeRole = (role: string | undefined): string => {
  if (!role) return "";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

export default function TeamPage() {
  //Solo auth para el usuario actual
  const { user: currentUser } = useAuth();

  //Hook de equipo (toda la lógica CRUD)
  const companyId = currentUser?.company?.id;
  const { users, loading, addUser, updateUserRole, deleteUser } =
    useTeam(companyId);

  // Hook de tareas para estadísticas
  const { tasks } = useTask();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("User");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUserRole = currentUser?.user?.role;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !newUserEmail.trim() || !newUserName.trim()) return;

    if (
      !currentUserRole ||
      (currentUserRole !== "owner" && currentUserRole !== "admin")
    ) {
      alert("You don't have permission to add users");
      return;
    }

    setIsSubmitting(true);
    try {
      await addUser({
        email: newUserEmail.trim(),
        name: newUserName.trim(),
        role: newUserRole,
      });
      setNewUserEmail("");
      setNewUserName("");
      setNewUserRole("User");
      setDialogOpen(false);
    } catch (error) {
      console.error("Error adding user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (
      !currentUserRole ||
      (currentUserRole !== "owner" && currentUserRole !== "admin")
    ) {
      alert("You don't have permission to change roles");
      return;
    }
    if (userId === currentUser?.user?.id) {
      alert("You cannot change your own role");
      return;
    }

    try {
      await updateUserRole(userId, newRole);
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !currentUserRole ||
      (currentUserRole !== "owner" && currentUserRole !== "admin")
    ) {
      alert("You don't have permission to delete users");
      return;
    }

    if (userId === currentUser?.user?.id) {
      alert("You cannot delete your own account");
      return;
    }

    if (confirm("Are you sure you want to remove this user from the team?")) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const getUserTaskStats = (userId: string) => {
    const userTasks = (tasks ?? []).filter((t) => t.assignee_id === userId);
    const completed = userTasks.filter((t) => t.status === "done").length;
    return { total: userTasks.length, completed };
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "Owner":
        return <Crown className="h-4 w-4" />;
      case "Admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "Owner":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900";
      case "Admin":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-900";
    }
  };

  const canManageUsers =
    currentUserRole === "owner" || currentUserRole === "admin";

  if (!companyId) {
    return (
      <section className="flex min-h-screen bg-background">
        <div className="flex-1 p-8">
          <div className="text-center text-muted-foreground">
            Loading company information...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-screen bg-background">
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Team Members</h1>
              <p className="text-muted-foreground mt-1">
                Manage your team and their roles
              </p>
            </div>
            {canManageUsers && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add team member</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={newUserRole}
                        onValueChange={(value) =>
                          setNewUserRole(value as UserRole)
                        }
                      >
                        <SelectTrigger id="role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="User">User</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                          {currentUserRole === "owner" && (
                            <SelectItem value="owner">Owner</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add member"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Lista de miembros */}
          {loading && users.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  Loading team members...
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Active Members ({users.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((member) => {
                    const stats = getUserTaskStats(member.id);
                    const isCurrentUser = member.id === currentUser?.user?.id;
                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-600 text-white text-lg">
                            {member.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">
                              {member.name}
                              {isCurrentUser && (
                                <span className="text-muted-foreground text-sm ml-2">
                                  (You)
                                </span>
                              )}
                            </h3>
                            <Badge
                              variant="outline"
                              className={getRoleBadgeColor(member.role)}
                            >
                              <span className="flex items-center gap-1">
                                {getRoleIcon(member.role)}
                                {member.role}
                              </span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Joined{" "}
                              {format(
                                new Date(member.createdAt),
                                "MMM d, yyyy",
                              )}
                            </div>
                          </div>
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">
                              Tasks:{" "}
                            </span>
                            <span className="font-medium">
                              {stats.completed}/{stats.total} completed
                            </span>
                          </div>
                        </div>

                        {canManageUsers && !isCurrentUser && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRoleChange(member.id, "User")
                                }
                              >
                                Change to User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRoleChange(member.id, "Admin")
                                }
                              >
                                Change to Admin
                              </DropdownMenuItem>
                              {currentUserRole === "owner" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleRoleChange(member.id, "Owner")
                                  }
                                >
                                  Change to Owner
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteUser(member.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Permisos */}
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Owner</h4>
                    <p className="text-sm text-muted-foreground">
                      Full access to all features, can manage all users and
                      settings
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Admin</h4>
                    <p className="text-sm text-muted-foreground">
                      Can manage users, tasks, and team settings but cannot
                      change owners
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">User</h4>
                    <p className="text-sm text-muted-foreground">
                      Can view and manage their own tasks, collaborate with team
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

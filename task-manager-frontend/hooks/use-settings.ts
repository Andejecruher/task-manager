// hooks/use-settings.ts - Versión demo
"use client";

import { useState, useCallback } from "react";

export function useSettings() {
  const [workspace] = useState({
    id: "1",
    name: "Mi Workspace Demo",
    slug: "mi-demo",
    description: "Workspace de demostración",
    color: "#3b82f6",
  });

  const [user] = useState({
    id: "1",
    fullName: "Usuario Demo",
    name: "Usuario Demo",
    email: "demo@example.com",
    role: "Admin",
    createdAt: new Date().toISOString(),
  });

  const [stats] = useState({
    totalUsers: 5,
    totalTasks: 12,
    completedTasks: 7,
    myTasks: 3,
  });

  const [loading] = useState(false);
  const [saving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const loadData = useCallback(async (slug: string) => {
    console.log("Cargando datos para:", slug);
  }, []);

  const updateProfile = useCallback(async () => {
    console.log("Actualizar:", { name, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    return true;
  }, [name, email]);

  return {
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
    resetSaved: () => setSaved(false),
  };
}

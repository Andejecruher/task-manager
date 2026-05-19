// hooks/use-settings.ts
"use client";

import { useAuth } from "@/context/auth-context";
import { useWorkspace } from "@/hooks/use-workspace";
import { useTask } from "@/hooks/use-task";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export function useSettings() {
  //  OBTENER DATOS DE LOS CONTEXTOS
  // useAuth información del usuario logueado
  // useWorkspace  información del workspace actual y sus miembros
  // useTask  lista de tareas del workspace
  const { user, updateProfile } = useAuth();
  const { workspace, users } = useWorkspace();
  const { tasks } = useTask();

  // 2. ESTADO LOCAL DEL FORMULARIO
  const [name, setName] = useState(""); // Nombre del usuario
  const [email, setEmail] = useState(""); // Email (si quieres editarlo)
  const [saving, setSaving] = useState(false); // Guardando...
  const [saved, setSaved] = useState(false); // Guardado exitoso
  const [loading, setLoading] = useState(true); // Cargando datos iniciales

  //  ESTADÍSTICAS DEL WORKSPACE
  const stats = {
    totalUsers: users?.length || 0, // Total miembros
    totalTasks: tasks?.length || 0, // Total tareas
    completedTasks: tasks?.filter((t) => t.status === "done").length || 0, // Completadas
    myTasks: tasks?.filter((t) => t.assignee_id === user?.user?.id).length || 0, // Mis tareas
  };

  //  CARGAR DATOS INICIALES (cuando el usuario esté disponible)
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Rellenar el formulario con los datos actuales del usuario
      setName(user?.user?.fullName || "");
      setEmail(user?.user?.email || "");
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Error loading profile data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  //  FUNCIÓN PARA ACTUALIZAR EL PERFIL
  const updateProfileHandler = async () => {
    // Validar que el nombre no esté vacío
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    setSaved(false);

    try {
      // Llamar al servicio que actualiza el perfil en el backend
      await updateProfile({
        fullName: name.trim(),
        // avatarUrl: avatar, // Si quisieras actualizar avatar
      });

      // Mostrar mensaje de éxito
      setSaved(true);
      toast.success("Profile updated successfully");

      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      // Mostrar mensaje de error
      toast.error(error?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // RETORNAR TODO LO QUE EL COMPONENTE NECESITA
  return {
    user: user?.user,
    workspace,
    stats,
    loading,
    saving,
    saved,
    name,
    email,
    setName,
    setEmail,
    updateProfile: updateProfileHandler,
  };
}

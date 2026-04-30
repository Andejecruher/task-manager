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
import { Spinner } from "@/components/ui/spinner";
import { verifyEmailService } from "@/services/auth";
import {
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  Mail,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [slug, setSlug] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(token ? "idle" : "error");
  const [errorMsg, setErrorMsg] = useState<string>(
    token ? "" : "No se encontró el token de verificación. El enlace puede ser inválido o haber expirado.",
  );

  const handleVerify = async () => {
    if (!token) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const result = await verifyEmailService(token);
      if (result.success) {
        setStatus("success");
        setSlug(result.data.slug);
      } else {
        setStatus("error");
        setErrorMsg((result as { error?: string }).error || "Error al verificar el email.");
      }
    } catch (err: unknown) {
      setStatus("error");
      const message = (err as { message?: string })?.message;
      setErrorMsg(message || "El token es inválido o ha expirado. Solicitá un nuevo enlace de verificación.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-background to-slate-50 dark:from-blue-950/20 dark:via-background dark:to-slate-950/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg">
              <CheckSquare className="h-6 w-6 text-white" />
              <span className="font-bold text-xl text-white">TaskFlow</span>
            </div>
          </div>

          {status === "loading" && (
            <>
              <div className="flex justify-center pt-2">
                <div className="relative flex items-center justify-center w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
                  <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-2xl">Verificando tu email</CardTitle>
              <CardDescription>
                Estamos procesando tu verificación, por favor esperá...
              </CardDescription>
            </>
          )}

          {status === "idle" && (
            <>
              <div className="flex justify-center pt-2">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20">
                  <Mail className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-2xl">Verificá tu email</CardTitle>
              <CardDescription>
                Hacé clic en el botón para confirmar tu dirección de correo electrónico.
              </CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center pt-2">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-50 dark:bg-green-900/20">
                  <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl">¡Email verificado!</CardTitle>
              <CardDescription>
                Tu dirección de correo fue verificada correctamente. Ya podés iniciar sesión.
              </CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center pt-2">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20">
                  <XCircle className="h-10 w-10 text-red-500 dark:text-red-400" />
                </div>
              </div>
              <CardTitle className="text-2xl">Error de verificación</CardTitle>
              <CardDescription>No pudimos verificar tu email.</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-3 pt-4">
          {status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {status === "idle" && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleVerify}
            >
              <Mail className="h-4 w-4 mr-2" />
              Verificar mi email
            </Button>
          )}

          {status === "loading" && (
            <Button className="w-full bg-blue-600" disabled>
              <Spinner className="h-4 w-4 mr-2 text-white" />
              Verificando...
            </Button>
          )}

          {status === "success" && (
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href={`/${slug ? slug : ""}/login`}>Ir al inicio de sesión</Link>
            </Button>
          )}

          {status === "error" && token && (
            <Button variant="outline" className="w-full" onClick={handleVerify}>
              Intentar nuevamente
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

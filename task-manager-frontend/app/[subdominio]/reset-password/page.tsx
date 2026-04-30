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
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/schemas";
import { resetPasswordService } from "@/services/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckSquare, Eye, EyeOff, KeyRound, XCircle } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

function PasswordRequirement({
    met,
    label,
}: {
    met: boolean;
    label: string;
}) {
    return (
        <li className={`flex items-center gap-1.5 text-xs ${met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
            {met ? (
                <span className="h-3.5 w-3.5 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400">✓</span>
            ) : (
                <XCircle className="h-3.5 w-3.5" />
            )}
            {label}
        </li>
    );
}

export default function ResetPasswordPage() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const domain = pathname.split("/")[1] || "";
    const token = searchParams.get("token") ?? "";
    const emailFromQuery = searchParams.get("email") ?? "";

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { newPassword: "", confirmPassword: "" },
    });

    const watchedPassword = watch("newPassword");

    const requirements = {
        length: (watchedPassword?.length || 0) >= 8,
        upper: /[A-Z]/.test(watchedPassword || ""),
        lower: /[a-z]/.test(watchedPassword || ""),
        number: /\d/.test(watchedPassword || ""),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(watchedPassword || ""),
    };

    const onSubmit = async (values: ResetPasswordInput) => {
        if (!token) {
            setError("root", {
                message: "El token de recuperación es inválido o ha expirado. Solicitá un nuevo enlace.",
            });
            return;
        }

        try {
            await resetPasswordService(token, values.newPassword);

            if (emailFromQuery) {
                await login(emailFromQuery, values.newPassword, domain);
            } else {
                // Sin email en la URL, redirigir al login con mensaje
                window.location.replace(`/${domain}/login`);
            }
        } catch (err: unknown) {
            const error = err as { message?: string };
            setError("root", {
                message:
                    error.message ||
                    "El token es inválido o ha expirado. Solicitá un nuevo enlace de recuperación.",
            });
        }
    };

    if (!token) {
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
                        <div className="flex justify-center pt-2">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30">
                                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">Enlace inválido</CardTitle>
                        <CardDescription>
                            El enlace de recuperación es inválido o ha expirado. Solicitá uno nuevo desde la página de login.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <Link
                            href={`/${domain}/forgot-password`}
                            className="flex justify-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                            Solicitar nuevo enlace
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                    <div className="flex justify-center pt-2">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <KeyRound className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
                    <CardDescription>
                        Elegí una contraseña segura para tu cuenta.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                        noValidate
                    >
                        {/* Nueva contraseña */}
                        <div className="space-y-1.5">
                            <Label htmlFor="newPassword">Nueva contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    autoFocus
                                    {...register("newPassword")}
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
                            {watchedPassword && (
                                <ul className="mt-2 space-y-1 pl-1">
                                    <PasswordRequirement met={requirements.length} label="Mínimo 8 caracteres" />
                                    <PasswordRequirement met={requirements.upper} label="Al menos una mayúscula" />
                                    <PasswordRequirement met={requirements.lower} label="Al menos una minúscula" />
                                    <PasswordRequirement met={requirements.number} label="Al menos un número" />
                                    <PasswordRequirement met={requirements.special} label='Al menos un carácter especial (!@#$%...)' />
                                </ul>
                            )}
                            {errors.newPassword && (
                                <p className="text-xs text-destructive">
                                    {errors.newPassword.message}
                                </p>
                            )}
                        </div>

                        {/* Confirmar contraseña */}
                        <div className="space-y-1.5">
                            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    autoComplete="new-password"
                                    {...register("confirmPassword")}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showConfirm ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-xs text-destructive">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        {errors.root && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.root.message}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Spinner className="h-4 w-4" />
                                    Guardando…
                                </span>
                            ) : (
                                "Cambiar contraseña"
                            )}
                        </Button>
                    </form>

                    <Link
                        href={`/${domain}/login`}
                        className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Volver al inicio de sesión
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}

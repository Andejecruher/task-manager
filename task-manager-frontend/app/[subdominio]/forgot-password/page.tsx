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
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/schemas";
import { requestPasswordResetService } from "@/services/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, CheckCircle2, CheckSquare, Mail } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

export default function ForgotPasswordPage() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const domain = pathname.split("/")[1] || "";
    const emailFromQuery = searchParams.get("email") ?? "";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isSubmitSuccessful },
        setError,
    } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: emailFromQuery },
    });

    const onSubmit = async (values: ForgotPasswordInput) => {
        try {
            await requestPasswordResetService(values.email, domain);
        } catch (err: unknown) {
            const error = err as { message?: string };
            setError("root", {
                message:
                    error.message ||
                    "Ocurrió un error al procesar la solicitud. Intentá de nuevo.",
            });
        }
    };

    if (isSubmitSuccessful) {
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
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
                                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">Revisá tu correo</CardTitle>
                        <CardDescription>
                            Si el email está registrado en tu empresa, recibirás un enlace
                            para restablecer tu contraseña en los próximos minutos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-4 text-sm text-blue-700 dark:text-blue-300">
                            <Mail className="h-4 w-4 shrink-0" />
                            <p>
                                No olvides revisar la carpeta de spam si no lo encontrás en la
                                bandeja de entrada.
                            </p>
                        </div>
                        <Link
                            href={`/${domain}/login`}
                            className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver al inicio de sesión
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
                            <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">¿Olvidaste tu contraseña?</CardTitle>
                    <CardDescription>
                        Ingresá tu email y te enviaremos un enlace para restablecer tu
                        contraseña.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                        noValidate
                    >
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="vos@empresa.com"
                                autoComplete="email"
                                autoFocus
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {errors.root && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.root.message}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Spinner className="h-4 w-4" />
                                    Enviando…
                                </span>
                            ) : (
                                "Enviar enlace de recuperación"
                            )}
                        </Button>
                    </form>

                    <Link
                        href={`/${domain}/login`}
                        className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver al inicio de sesión
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}

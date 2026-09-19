"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth/auth-client";
import { signInSchema, SignInFormData } from "@/lib/validations/auth";
import { useRecaptcha, RecaptchaNotice } from "@/components/auth/recaptcha";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignIn() {
    const [serverError, setServerError] = useState("");
    const router = useRouter();
    const { executeRecaptcha } = useRecaptcha();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(data: SignInFormData) {
        setServerError("");

        const captchaToken = await executeRecaptcha("signin");

        try {
            const result = await signIn.email({
                email: data.email,
                password: data.password,
                fetchOptions: {
                    headers: {
                        ...(captchaToken ? { "x-captcha-response": captchaToken } : {}),
                    },
                },
            });

            if (result.error) {
                setServerError(result.error.message ?? "Failed to sign in");
            } else {
                router.push("/dashboard");
            }
        } catch {
            setServerError("An unexpected error occurred. Please try again.");
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white p-4">
            <Card className="w-full max-w-md border-gray-200 shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-black">
                        Sign In
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <CardContent className="space-y-4">
                        {serverError && (
                            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                                {serverError}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="signin-email" className="text-gray-700">
                                Email
                            </Label>
                            <Input
                                id="signin-email"
                                type="email"
                                placeholder="you@example.com"
                                {...register("email")}
                                className="border-gray-300 focus:border-primary focus:ring-primary"
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="signin-password" className="text-gray-700">
                                Password
                            </Label>
                            <Input
                                id="signin-password"
                                type="password"
                                placeholder="••••••••"
                                {...register("password")}
                                className="border-gray-300 focus:border-primary focus:ring-primary"
                            />
                            {errors.password && (
                                <p className="text-xs text-destructive">{errors.password.message}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Signing in..." : "Sign In"}
                        </Button>
                        <p className="text-center text-sm text-gray-600">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/sign-up"
                                className="font-medium text-primary hover:underline"
                            >
                                Sign up
                            </Link>
                        </p>
                        <RecaptchaNotice className="pt-2" />
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

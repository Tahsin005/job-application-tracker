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
import { signUp } from "@/lib/auth/auth-client";
import { signUpSchema, SignUpFormData } from "@/lib/validations/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUp() {
    const [serverError, setServerError] = useState("");
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    async function onSubmit(data: SignUpFormData) {
        setServerError("");

        try {
            const result = await signUp.email({
                name: data.name,
                email: data.email,
                password: data.password,
            });

            if (result.error) {
                setServerError(result.error.message ?? "Failed to sign up");
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
                        Sign Up
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Create an account to start tracking your job applications
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
                            <Label htmlFor="signup-name" className="text-gray-700">
                                Name
                            </Label>
                            <Input
                                id="signup-name"
                                type="text"
                                placeholder="John Doe"
                                {...register("name")}
                                className="border-gray-300 focus:border-primary focus:ring-primary"
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive">{errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="signup-email" className="text-gray-700">
                                Email
                            </Label>
                            <Input
                                id="signup-email"
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
                            <Label htmlFor="signup-password" className="text-gray-700">
                                Password
                            </Label>
                            <Input
                                id="signup-password"
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
                            {isSubmitting ? "Creating account..." : "Sign Up"}
                        </Button>
                        <p className="text-center text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link
                                href="/sign-in"
                                className="font-medium text-primary hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>            
        </div>
    );
}
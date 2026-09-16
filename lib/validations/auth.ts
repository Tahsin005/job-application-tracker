import { z } from "zod";

export const signInSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long"),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters long"),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long"),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

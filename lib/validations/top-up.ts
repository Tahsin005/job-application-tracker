import { z } from "zod";

export const createTopUpRequestSchema = z.object({
    packageId: z.string().trim().min(1, "Please select a top-up package"),
    paymentMethod: z.string().trim().min(1, "Please select a payment method"),
    senderNumber: z
        .string()
        .trim()
        .min(11, "Mobile number must be at least 11 digits")
        .max(16, "Mobile number is too long"),
    transactionId: z
        .string()
        .trim()
        .min(4, "Transaction ID (TrxID) is required")
        .max(50, "Transaction ID is too long"),
    userNote: z.string().trim().optional().default(""),
});

export type CreateTopUpRequestInput = z.infer<typeof createTopUpRequestSchema>;

export const upsertMfsProviderSchema = z.object({
    id: z.string().optional(),
    name: z.string().trim().min(1, "Provider name is required (e.g. bKash, Nagad, Cellfin)"),
    slug: z.string().trim().min(1, "Identifier slug is required (e.g. bkash, cellfin)"),
    accountType: z.string().trim().min(1, "Account type is required").default("Personal"),
    accountNumber: z.string().trim().min(4, "Account number is required"),
    instructions: z.string().trim().optional().default(""),
    order: z.coerce.number().int().min(0, "Order must be a positive integer").default(1),
    color: z.string().trim().optional().default(""),
    isActive: z.boolean().default(true),
});

export type UpsertMfsProviderInput = z.infer<typeof upsertMfsProviderSchema>;

export const reviewTopUpRequestSchema = z.object({
    requestId: z.string().trim().min(1, "Request ID is required"),
    action: z.enum(["approve", "reject"]),
    rejectionReason: z.string().trim().optional(),
});

export type ReviewTopUpRequestInput = z.infer<typeof reviewTopUpRequestSchema>;

export const packageCreditsSchema = z.object({
    atsScan: z.coerce.number().int().min(0, "Credits cannot be negative").default(0),
    coverLetter: z.coerce.number().int().min(0, "Credits cannot be negative").default(0),
    outreach: z.coerce.number().int().min(0, "Credits cannot be negative").default(0),
    applicationEmail: z.coerce.number().int().min(0, "Credits cannot be negative").default(0),
});

export const upsertTopUpPackageSchema = z.object({
    id: z.string().optional(),
    name: z.string().trim().min(1, "Package name is required"),
    tierKey: z.string().trim().min(1, "Tier key is required"),
    order: z.coerce.number().int().min(0, "Order must be a positive integer").default(1),
    price: z.coerce.number().min(0, "Price cannot be negative"),
    currency: z.string().trim().min(1).default("BDT"),
    description: z.string().trim().optional().default(""),
    badgeText: z.string().trim().optional().default(""),
    credits: packageCreditsSchema,
    isActive: z.boolean().default(true),
});

export type UpsertTopUpPackageInput = z.infer<typeof upsertTopUpPackageSchema>;

export const updateAdminMfsSettingsSchema = z.object({
    bkashNumber: z.string().trim().min(1, "bKash number is required"),
    nagadNumber: z.string().trim().min(1, "Nagad number is required"),
    rocketNumber: z.string().trim().min(1, "Rocket number is required"),
    upayNumber: z.string().trim().optional().default(""),
    instructions: z.string().trim().min(1, "Instructions are required"),
});

export type UpdateAdminMfsSettingsInput = z.infer<typeof updateAdminMfsSettingsSchema>;

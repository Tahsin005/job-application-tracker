"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { AiPrompt as AiPromptModel } from "../models";
import {
    DEFAULT_AI_PROMPTS,
    AiActionType,
} from "../ai/prompts/default-prompts";
import {
    saveAdminPromptSchema,
    resetAdminPromptSchema,
    SaveAdminPromptInput,
    ResetAdminPromptInput,
} from "../validations/admin-prompts";
import { AiPromptItem } from "../models/models.types";

interface AdminAuthResult {
    authorized: boolean;
    error: string | null;
}

async function verifyAdmin(): Promise<AdminAuthResult> {
    const session = await getSession();

    if (!session?.user) {
        return { authorized: false, error: "Unauthorized: Please sign in." };
    }

    if (!session.user.isAdmin && session.user.role !== "admin") {
        return { authorized: false, error: "Forbidden: Admin privileges required." };
    }

    return { authorized: true, error: null };
}

/**
 * Retrieves all 3 AI prompt configurations (ATS Scan, Cover Letter, Outreach).
 * Merges any MongoDB customizations over codebase sane defaults.
 */
export async function getAdminPromptsAction(): Promise<{
    error: string | null;
    data: AiPromptItem[] | null;
}> {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
        return { error: auth.error, data: null };
    }

    try {
        await connectDB();

        const dbPrompts = await AiPromptModel.find().lean();
        const dbMap = new Map<string, Record<string, unknown>>();
        for (const p of dbPrompts) {
            dbMap.set(String(p.action), p as Record<string, unknown>);
        }

        const actions: AiActionType[] = ["atsScan", "coverLetter", "outreach"];

        const result: AiPromptItem[] = actions.map((action) => {
            const defaultDef = DEFAULT_AI_PROMPTS[action];
            const customDoc = dbMap.get(action);

            const isCustomized = Boolean(
                customDoc &&
                typeof customDoc.systemPrompt === "string" &&
                customDoc.systemPrompt.trim() &&
                typeof customDoc.userPromptTemplate === "string" &&
                customDoc.userPromptTemplate.trim()
            );

            const docRest = customDoc ? { ...customDoc } : {};
            delete docRest._id;
            delete docRest.__v;

            return {
                ...docRest,
                action,
                name: (customDoc?.name as string) || defaultDef.name,
                description: (customDoc?.description as string) || defaultDef.description,
                systemPrompt: (customDoc?.systemPrompt as string) || defaultDef.systemPrompt,
                userPromptTemplate:
                    (customDoc?.userPromptTemplate as string) || defaultDef.userPromptTemplate,
                isCustomized,
                supportedVariables: defaultDef.supportedVariables,
                updatedAt: customDoc?.updatedAt
                    ? new Date(customDoc.updatedAt as string).toISOString()
                    : undefined,
            };
        });

        return { error: null, data: result };
    } catch (err: unknown) {
        console.error("Failed to fetch AI prompts:", err);
        return { error: "Failed to retrieve AI prompts.", data: null };
    }
}

/**
 * Saves a customized prompt configuration to MongoDB.
 */
export async function saveAdminPromptAction(
    input: SaveAdminPromptInput
): Promise<{ error: string | null; data: { success: boolean } | null }> {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
        return { error: auth.error, data: null };
    }

    const parsed = saveAdminPromptSchema.safeParse(input);
    if (!parsed.success) {
        const errorMsg = parsed.error.issues[0]?.message || "Validation failed.";
        return { error: errorMsg, data: null };
    }

    try {
        await connectDB();
        const { action, name, systemPrompt, userPromptTemplate, description, ...rest } =
            parsed.data;

        await AiPromptModel.findOneAndUpdate(
            { action },
            {
                $set: {
                    action,
                    name,
                    systemPrompt,
                    userPromptTemplate,
                    description: description || "",
                    ...rest,
                },
            },
            { upsert: true, new: true }
        );

        revalidatePath("/admin/ai");
        return { error: null, data: { success: true } };
    } catch (err: unknown) {
        console.error("Failed to save AI prompt:", err);
        return { error: "Failed to save AI prompt configuration.", data: null };
    }
}

/**
 * Resets an AI prompt back to the codebase sane default by removing the MongoDB override.
 */
export async function resetAdminPromptAction(
    input: ResetAdminPromptInput
): Promise<{ error: string | null; data: { success: boolean } | null }> {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
        return { error: auth.error, data: null };
    }

    const parsed = resetAdminPromptSchema.safeParse(input);
    if (!parsed.success) {
        const errorMsg = parsed.error.issues[0]?.message || "Invalid action specified.";
        return { error: errorMsg, data: null };
    }

    try {
        await connectDB();
        await AiPromptModel.deleteOne({ action: parsed.data.action });

        revalidatePath("/admin/ai");
        return { error: null, data: { success: true } };
    } catch (err: unknown) {
        console.error("Failed to reset AI prompt:", err);
        return { error: "Failed to reset AI prompt.", data: null };
    }
}

"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { AiConfig as AiConfigModel } from "../models";
import { AiProviderFactory } from "../ai/factory/ai-provider-factory";
import {
    testAiPlaygroundSchema,
    saveAiConfigSchema,
    TestAiPlaygroundInput,
    SaveAiConfigInput,
} from "../validations/admin-ai";
import { AiTestResult } from "../ai/factory/types";

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
 * Ephemeral live test for playground inputs without persisting to DB.
 */
export async function testAiPlaygroundAction(
    input: TestAiPlaygroundInput
): Promise<{ error: string | null; data: AiTestResult | null }> {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
        return { error: auth.error, data: null };
    }

    const parsed = testAiPlaygroundSchema.safeParse(input);
    if (!parsed.success) {
        const errorMsg = parsed.error.issues[0]?.message || "Invalid configuration parameters.";
        return { error: errorMsg, data: null };
    }

    try {
        const provider = AiProviderFactory.createProvider(parsed.data);
        const result = await provider.testConnection();
        return { error: null, data: result };
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
            error: null,
            data: {
                success: false,
                latencyMs: 0,
                message: msg,
            },
        };
    }
}

/**
 * Retrieve all configured AI providers with masked API keys.
 */
export async function getAdminAiConfigsAction(): Promise<{
    error: string | null;
    data: {
        configs: Array<{
            id: string;
            name: string;
            provider: string;
            baseUrl: string;
            apiKey: string;
            maskedApiKey: string;
            model: string;
            isDefault: boolean;
            isActive: boolean;
            customHeaders?: Record<string, string>;
            description?: string;
            lastTestedAt?: string | null;
            lastLatencyMs?: number | null;
            createdAt: string;
        }>;
        activeConfig: {
            name: string;
            provider: string;
            baseUrl: string;
            model: string;
            isEnvFallback: boolean;
            configId?: string;
        };
    } | null;
}> {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
        return { error: auth.error, data: null };
    }

    try {
        await connectDB();

        const configs = await AiConfigModel.find()
            .sort({ isDefault: -1, createdAt: -1 })
            .lean();

        const activeInfo = await AiProviderFactory.getActiveConfig();

        const formattedConfigs = configs.map((c) => {
            const doc = c as Record<string, unknown>;
            const docRest = { ...doc };
            const id = String(docRest._id);
            delete docRest._id;
            delete docRest.__v;
            delete docRest.apiKey;

            return {
                ...docRest,
                id,
                name: String(doc.name || ""),
                provider: String(doc.provider || ""),
                baseUrl: String(doc.baseUrl || ""),
                apiKey: String(doc.apiKey || ""),
                maskedApiKey: String(doc.apiKey || ""),
                model: String(doc.model || ""),
                isDefault: Boolean(doc.isDefault),
                isActive: Boolean(doc.isActive),
                customHeaders: (doc.customHeaders as Record<string, string>) || {},
                description: String(doc.description || ""),
                options: (doc.options as Record<string, unknown>) || {},
                metadata: (doc.metadata as Record<string, unknown>) || {},
                lastTestedAt: doc.lastTestedAt ? new Date(doc.lastTestedAt as string).toISOString() : null,
                lastLatencyMs: (doc.lastLatencyMs as number) ?? null,
                createdAt: doc.createdAt ? new Date(doc.createdAt as string).toISOString() : new Date().toISOString(),
            };
        });

        return {
            error: null,
            data: {
                configs: formattedConfigs,
                activeConfig: {
                    name: activeInfo.config.name || "Default Provider",
                    provider: activeInfo.config.provider,
                    baseUrl: activeInfo.config.baseUrl || "",
                    model: activeInfo.config.model,
                    isEnvFallback: activeInfo.isEnvFallback,
                    configId: activeInfo.configId,
                },
            },
        };
    } catch (err: unknown) {
        console.error("Failed to load AI configs:", err);
        return { error: "Failed to retrieve AI provider configurations.", data: null };
    }
}

/**
 * Save (create or update) an AI configuration.
 */
export async function saveAdminAiConfigAction(
    input: SaveAiConfigInput
): Promise<{ error: string | null; data: { id: string } | null }> {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
        return { error: auth.error, data: null };
    }

    const parsed = saveAiConfigSchema.safeParse(input);
    if (!parsed.success) {
        const errorMsg = parsed.error.issues[0]?.message || "Validation failed.";
        return { error: errorMsg, data: null };
    }

    try {
        await connectDB();
        const { id, ...configData } = parsed.data;

        // If setting this one as default, clear default from any other existing configs
        if (configData.isDefault) {
            await AiConfigModel.updateMany({}, { $set: { isDefault: false } });
        }

        // Check if there are existing configs; if 0 existing, force this one as default
        const existingCount = await AiConfigModel.countDocuments();
        const shouldBeDefault = configData.isDefault || existingCount === 0;

        let targetId: string;

        if (id && mongoose.Types.ObjectId.isValid(id)) {
            // Update existing
            const existing = await AiConfigModel.findById(id);
            if (!existing) {
                return { error: "Configuration not found.", data: null };
            }

            const updatePayload: Record<string, unknown> = {
                ...configData,
                isDefault: shouldBeDefault,
            };

            // Only overwrite apiKey if a non-empty, non-masked key is passed
            if (!configData.apiKey || configData.apiKey.includes("••••")) {
                delete updatePayload.apiKey;
            }

            Object.assign(existing, updatePayload);
            await existing.save();
            targetId = String(existing._id);
        } else {
            // Create new - passes all flexible fields through to MongoDB
            const newConfig = await AiConfigModel.create({
                ...configData,
                isDefault: shouldBeDefault,
            });
            targetId = String(newConfig._id);
        }

        revalidatePath("/admin/ai");
        revalidatePath("/admin");

        return { error: null, data: { id: targetId } };
    } catch (err: unknown) {
        console.error("Failed to save AI config:", err);
        return { error: "Failed to persist AI configuration.", data: null };
    }
}

/**
 * Designate a specific configuration as the active default provider.
 */
export async function setDefaultAdminAiConfigAction(
    id: string
): Promise<{ error: string | null; data: { success: boolean } | null }> {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
        return { error: auth.error, data: null };
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return { error: "Invalid configuration ID.", data: null };
    }

    try {
        await connectDB();

        // Atomically unset all, then set the chosen one
        await AiConfigModel.updateMany({}, { $set: { isDefault: false } });
        const updated = await AiConfigModel.findByIdAndUpdate(
            id,
            { $set: { isDefault: true, isActive: true } },
            { new: true }
        );

        if (!updated) {
            return { error: "Target configuration not found.", data: null };
        }

        revalidatePath("/admin/ai");
        revalidatePath("/admin");

        return { error: null, data: { success: true } };
    } catch (err: unknown) {
        console.error("Failed to set default AI config:", err);
        return { error: "Could not set default configuration.", data: null };
    }
}

/**
 * Delete a configuration. If the deleted one was default,
 * automatically promotes the next available config to default.
 */
export async function deleteAdminAiConfigAction(
    id: string
): Promise<{ error: string | null; data: { success: boolean } | null }> {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
        return { error: auth.error, data: null };
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return { error: "Invalid configuration ID.", data: null };
    }

    try {
        await connectDB();

        const config = await AiConfigModel.findById(id);
        if (!config) {
            return { error: "Configuration not found.", data: null };
        }

        const wasDefault = config.isDefault;
        await AiConfigModel.findByIdAndDelete(id);

        if (wasDefault) {
            const nextConfig = await AiConfigModel.findOne({ isActive: true }).sort({
                createdAt: -1,
            });
            if (nextConfig) {
                nextConfig.isDefault = true;
                await nextConfig.save();
            }
        }

        revalidatePath("/admin/ai");
        revalidatePath("/admin");

        return { error: null, data: { success: true } };
    } catch (err: unknown) {
        console.error("Failed to delete AI config:", err);
        return { error: "Could not delete configuration.", data: null };
    }
}

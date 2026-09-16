"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    testAiPlaygroundAction,
    saveAdminAiConfigAction,
    setDefaultAdminAiConfigAction,
    deleteAdminAiConfigAction,
} from "@/lib/actions/admin-ai";
import {
    TestAiPlaygroundInput,
    SaveAiConfigInput,
} from "@/lib/validations/admin-ai";
import { AiTestResult } from "@/lib/ai/factory/types";

export function useAdminAiFacade() {
    const router = useRouter();

    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<AiTestResult | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const testConnection = async (input: TestAiPlaygroundInput): Promise<AiTestResult | null> => {
        setIsTesting(true);
        setTestResult(null);

        try {
            const res = await testAiPlaygroundAction(input);
            if (res.error) {
                toast.error(res.error);
                const failedResult: AiTestResult = {
                    success: false,
                    latencyMs: 0,
                    message: res.error,
                };
                setTestResult(failedResult);
                return failedResult;
            }

            if (res.data) {
                setTestResult(res.data);
                if (res.data.success) {
                    toast.success(
                        `AI probe successful (${res.data.latencyMs}ms latency)!`
                    );
                } else {
                    toast.error(`Probe failed: ${res.data.message}`);
                }
                return res.data;
            }
            return null;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Network error executing AI test probe.";
            toast.error(msg);
            const failedResult: AiTestResult = {
                success: false,
                latencyMs: 0,
                message: msg,
            };
            setTestResult(failedResult);
            return failedResult;
        } finally {
            setIsTesting(false);
        }
    };

    const saveConfig = async (input: SaveAiConfigInput): Promise<boolean> => {
        setIsSaving(true);
        try {
            const res = await saveAdminAiConfigAction(input);
            if (res.error) {
                toast.error(res.error);
                return false;
            }
            toast.success(
                `Configuration "${input.name}" saved successfully${
                    input.isDefault ? " and set as default active provider" : ""
                }!`
            );
            router.refresh();
            return true;
        } catch {
            toast.error("Failed to save AI configuration.");
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const setDefaultConfig = async (id: string, name: string): Promise<boolean> => {
        setActionLoadingId(id);
        try {
            const res = await setDefaultAdminAiConfigAction(id);
            if (res.error) {
                toast.error(res.error);
                return false;
            }
            toast.success(`"${name}" is now the active default AI provider!`);
            router.refresh();
            return true;
        } catch {
            toast.error("Failed to update default AI provider.");
            return false;
        } finally {
            setActionLoadingId(null);
        }
    };

    const deleteConfig = async (id: string, name: string): Promise<boolean> => {
        setActionLoadingId(id);
        try {
            const res = await deleteAdminAiConfigAction(id);
            if (res.error) {
                toast.error(res.error);
                return false;
            }
            toast.success(`Deleted configuration "${name}".`);
            router.refresh();
            return true;
        } catch {
            toast.error("Failed to delete configuration.");
            return false;
        } finally {
            setActionLoadingId(null);
        }
    };

    const clearTestResult = () => {
        setTestResult(null);
    };

    return {
        isTesting,
        testResult,
        isSaving,
        actionLoadingId,
        testConnection,
        saveConfig,
        setDefaultConfig,
        deleteConfig,
        clearTestResult,
    };
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    saveAdminPromptAction,
    resetAdminPromptAction,
} from "@/lib/actions/admin-prompts";
import { SaveAdminPromptInput } from "@/lib/validations/admin-prompts";

export function useAdminPromptsFacade() {
    const router = useRouter();

    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [activeActionId, setActiveActionId] = useState<string | null>(null);

    const savePrompt = async (input: SaveAdminPromptInput): Promise<boolean> => {
        setIsSaving(true);
        setActiveActionId(input.action);

        try {
            const res = await saveAdminPromptAction(input);
            if (res.error) {
                toast.error(res.error);
                return false;
            }

            toast.success(`Prompt for "${input.name || input.action}" saved to MongoDB!`);
            router.refresh();
            return true;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to save prompt configuration.";
            toast.error(msg);
            return false;
        } finally {
            setIsSaving(false);
            setActiveActionId(null);
        }
    };

    const resetPrompt = async (action: string, name: string): Promise<boolean> => {
        setIsResetting(true);
        setActiveActionId(action);

        try {
            const res = await resetAdminPromptAction({ action });
            if (res.error) {
                toast.error(res.error);
                return false;
            }

            toast.success(`Reset "${name}" prompt to codebase default!`);
            router.refresh();
            return true;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to reset prompt.";
            toast.error(msg);
            return false;
        } finally {
            setIsResetting(false);
            setActiveActionId(null);
        }
    };

    return {
        isSaving,
        isResetting,
        activeActionId,
        savePrompt,
        resetPrompt,
    };
}

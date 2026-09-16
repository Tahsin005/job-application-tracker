"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateAdminUserUsageAction } from "@/lib/actions/admin";
import { UpdateUserUsageInput } from "@/lib/validations/admin";

export function useAdminFacade() {
    const router = useRouter();
    const [isUpdatingUsage, setIsUpdatingUsage] = useState(false);

    const updateUserUsage = async (input: UpdateUserUsageInput) => {
        setIsUpdatingUsage(true);
        try {
            const res = await updateAdminUserUsageAction(input);
            if (res.error) {
                toast.error(res.error);
                return { success: false, error: res.error };
            }
            toast.success("User AI quotas successfully updated!");
            router.refresh();
            return { success: true, data: res.data };
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to update quota";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setIsUpdatingUsage(false);
        }
    };

    return {
        isUpdatingUsage,
        updateUserUsage,
    };
}

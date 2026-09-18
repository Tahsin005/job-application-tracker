"use client";

import { toast } from "sonner";
import {
    useActivePackagesQuery,
    useUserTopUpHistoryQuery,
    useSubmitTopUpMutation,
    useAdminTopUpRequestsQuery,
    useAdminTopUpAnalyticsQuery,
    useAdminReviewTopUpMutation,
    useAdminPackagesQuery,
    useAdminUpsertPackageMutation,
    useAdminTogglePackageStatusMutation,
    useAdminMfsSettingsQuery,
    useAdminUpdateMfsSettingsMutation,
    useUserAdminTopUpHistoryQuery,
    useAdminMfsProvidersQuery,
    useAdminUpsertMfsProviderMutation,
    useAdminToggleMfsProviderMutation,
    useAdminDeleteMfsProviderMutation,
} from "../queries/top-up-queries";
import {
    CreateTopUpRequestInput,
    ReviewTopUpRequestInput,
    UpsertTopUpPackageInput,
    UpdateAdminMfsSettingsInput,
    UpsertMfsProviderInput,
} from "../validations/top-up";

export function useTopUpFacade() {
    // 1. User queries & mutations
    const { data: activeData, isLoading: isLoadingPackages } = useActivePackagesQuery();
    const { data: rawUserHistory, isLoading: isLoadingHistory } = useUserTopUpHistoryQuery();
    const submitTopUpMutation = useSubmitTopUpMutation();

    const packages = activeData?.packages || [];
    const mfsProviders = activeData?.mfsProviders || [];
    const mfsSettings = activeData?.mfsSettings || null;
    const userHistory = rawUserHistory || [];

    async function submitTopUp(input: CreateTopUpRequestInput) {
        const toastId = toast.loading("Submitting payment verification...");
        try {
            const result = await submitTopUpMutation.mutateAsync(input);
            toast.success(
                `Payment submitted for ${result?.packageName}! Your credits will be added as soon as the admin verifies your transaction.`,
                { id: toastId, duration: 6000 }
            );
            return result;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to submit payment verification.";
            toast.error(msg, { id: toastId });
            throw err;
        }
    }

    return {
        // User state & actions
        packages,
        mfsProviders,
        mfsSettings,
        isLoadingPackages,
        userHistory,
        isLoadingHistory,
        isSubmittingTopUp: submitTopUpMutation.isPending,
        submitTopUp,
    };
}

export function useAdminTopUpFacade({
    status,
    search,
    page,
    limit,
    selectedUserId,
}: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    selectedUserId?: string;
} = {}) {
    // Admin queries & mutations
    const {
        data: requestsData,
        isLoading: isLoadingRequests,
        refetch: refetchRequests,
    } = useAdminTopUpRequestsQuery({ status, search, page, limit });

    const {
        data: analytics,
        isLoading: isLoadingAnalytics,
        refetch: refetchAnalytics,
    } = useAdminTopUpAnalyticsQuery();

    const {
        data: rawAllPackages,
        isLoading: isLoadingAllPackages,
        refetch: refetchAllPackages,
    } = useAdminPackagesQuery();

    const allPackages = rawAllPackages || [];

    const { data: mfsSettings, isLoading: isLoadingMfsSettings } = useAdminMfsSettingsQuery();

    const {
        data: rawAllProviders,
        isLoading: isLoadingAllMfsProviders,
        refetch: refetchAllMfsProviders,
    } = useAdminMfsProvidersQuery();

    const allMfsProviders = rawAllProviders || [];

    const { data: userAdminHistory, isLoading: isLoadingUserAdminHistory } =
        useUserAdminTopUpHistoryQuery(selectedUserId || "");

    const reviewMutation = useAdminReviewTopUpMutation();
    const upsertPackageMutation = useAdminUpsertPackageMutation();
    const togglePackageMutation = useAdminTogglePackageStatusMutation();
    const updateMfsMutation = useAdminUpdateMfsSettingsMutation();
    const upsertMfsProviderMutation = useAdminUpsertMfsProviderMutation();
    const toggleMfsProviderMutation = useAdminToggleMfsProviderMutation();
    const deleteMfsProviderMutation = useAdminDeleteMfsProviderMutation();

    async function reviewRequest(input: ReviewTopUpRequestInput) {
        const toastId = toast.loading(
            input.action === "approve" ? "Approving payment & crediting account..." : "Rejecting request..."
        );
        try {
            const result = await reviewMutation.mutateAsync(input);
            if (input.action === "approve") {
                toast.success(
                    `Approved! Credits for ${result?.packageName} have been added to the user's account.`,
                    { id: toastId }
                );
            } else {
                toast.info("Request marked as rejected.", { id: toastId });
            }
            return result;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to update request.";
            toast.error(msg, { id: toastId });
            throw err;
        }
    }

    async function savePackage(input: UpsertTopUpPackageInput) {
        const toastId = toast.loading("Saving package...");
        try {
            const result = await upsertPackageMutation.mutateAsync(input);
            toast.success(`Package "${result?.name}" saved successfully!`, { id: toastId });
            return result;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to save package.";
            toast.error(msg, { id: toastId });
            throw err;
        }
    }

    async function togglePackage(packageId: string) {
        const toastId = toast.loading("Updating package status...");
        try {
            const result = await togglePackageMutation.mutateAsync(packageId);
            toast.success(
                `Package is now ${result?.isActive ? "active" : "deactivated"}.`,
                { id: toastId }
            );
            return result;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to update package.";
            toast.error(msg, { id: toastId });
            throw err;
        }
    }

    async function saveMfsSettings(input: UpdateAdminMfsSettingsInput) {
        const toastId = toast.loading("Updating MFS payment settings...");
        try {
            const result = await updateMfsMutation.mutateAsync(input);
            toast.success("MFS recipient numbers and instructions updated!", { id: toastId });
            return result;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to update MFS settings.";
            toast.error(msg, { id: toastId });
            throw err;
        }
    }

    async function saveMfsProvider(input: UpsertMfsProviderInput) {
        const toastId = toast.loading("Saving MFS provider...");
        try {
            const result = await upsertMfsProviderMutation.mutateAsync(input);
            toast.success(`MFS Provider "${result?.name}" saved successfully!`, { id: toastId });
            return result;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to save MFS provider.";
            toast.error(msg, { id: toastId });
            throw err;
        }
    }

    async function toggleMfsProvider(providerId: string) {
        const toastId = toast.loading("Updating provider status...");
        try {
            const result = await toggleMfsProviderMutation.mutateAsync(providerId);
            toast.success(
                `Provider is now ${result?.isActive ? "active" : "deactivated"}.`,
                { id: toastId }
            );
            return result;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to update provider status.";
            toast.error(msg, { id: toastId });
            throw err;
        }
    }

    async function deleteMfsProvider(providerId: string) {
        const toastId = toast.loading("Deleting MFS provider...");
        try {
            const result = await deleteMfsProviderMutation.mutateAsync(providerId);
            toast.success("MFS provider deleted.", { id: toastId });
            return result;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to delete MFS provider.";
            toast.error(msg, { id: toastId });
            throw err;
        }
    }

    return {
        requests: requestsData?.requests || [],
        pagination: requestsData?.pagination,
        isLoadingRequests,
        refetchRequests,

        analytics,
        isLoadingAnalytics,
        refetchAnalytics,

        allPackages,
        isLoadingAllPackages,
        refetchAllPackages,

        mfsSettings,
        isLoadingMfsSettings,

        allMfsProviders,
        isLoadingAllMfsProviders,
        refetchAllMfsProviders,

        userAdminHistory: userAdminHistory?.requests || [],
        userTotalSpend: userAdminHistory?.totalSpend || 0,
        isLoadingUserAdminHistory,

        isReviewing: reviewMutation.isPending,
        reviewRequest,

        isSavingPackage: upsertPackageMutation.isPending,
        savePackage,

        isTogglingPackage: togglePackageMutation.isPending,
        togglePackage,

        isSavingMfs: updateMfsMutation.isPending,
        saveMfsSettings,

        isSavingMfsProvider: upsertMfsProviderMutation.isPending,
        saveMfsProvider,

        isTogglingMfsProvider: toggleMfsProviderMutation.isPending,
        toggleMfsProvider,

        isDeletingMfsProvider: deleteMfsProviderMutation.isPending,
        deleteMfsProvider,
    };
}

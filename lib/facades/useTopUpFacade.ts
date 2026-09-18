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

export interface UseAdminTopUpFacadeOptions {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    selectedUserId?: string;
    scope?: "all" | "requests" | "catalog";
    enableRequests?: boolean;
    enableAnalytics?: boolean;
    enablePackages?: boolean;
    enableMfsSettings?: boolean;
    enableMfsProviders?: boolean;
    enableUserHistory?: boolean;
}

export function useAdminTopUpFacade({
    status,
    search,
    page,
    limit,
    selectedUserId,
    scope = "all",
    enableRequests: explicitEnableRequests,
    enableAnalytics: explicitEnableAnalytics,
    enablePackages: explicitEnablePackages,
    enableMfsSettings: explicitEnableMfsSettings,
    enableMfsProviders: explicitEnableMfsProviders,
    enableUserHistory: explicitEnableUserHistory,
}: UseAdminTopUpFacadeOptions = {}) {
    const enableRequests = explicitEnableRequests ?? (scope === "all" || scope === "requests");
    const enableAnalytics = explicitEnableAnalytics ?? (scope === "all" || scope === "requests");
    const enablePackages = explicitEnablePackages ?? (scope === "all" || scope === "catalog");
    const enableMfsSettings = explicitEnableMfsSettings ?? (scope === "all" || scope === "catalog");
    const enableMfsProviders = explicitEnableMfsProviders ?? (scope === "all" || scope === "catalog");
    const enableUserHistory = explicitEnableUserHistory ?? (scope === "all" || scope === "requests");

    // Admin queries & mutations
    const {
        data: requestsData,
        isLoading: isLoadingRequests,
        refetch: rawRefetchRequests,
    } = useAdminTopUpRequestsQuery({ status, search, page, limit, enabled: enableRequests });

    const {
        data: analytics,
        isLoading: isLoadingAnalytics,
        refetch: rawRefetchAnalytics,
    } = useAdminTopUpAnalyticsQuery({ enabled: enableAnalytics });

    const {
        data: rawAllPackages,
        isLoading: isLoadingAllPackages,
        refetch: rawRefetchAllPackages,
    } = useAdminPackagesQuery({ enabled: enablePackages });

    const allPackages = rawAllPackages || [];

    const {
        data: mfsSettings,
        isLoading: isLoadingMfsSettings,
        refetch: rawRefetchMfsSettings,
    } = useAdminMfsSettingsQuery({ enabled: enableMfsSettings });

    const {
        data: rawAllProviders,
        isLoading: isLoadingAllMfsProviders,
        refetch: rawRefetchAllMfsProviders,
    } = useAdminMfsProvidersQuery({ enabled: enableMfsProviders });

    const allMfsProviders = rawAllProviders || [];

    const {
        data: userAdminHistory,
        isLoading: isLoadingUserAdminHistory,
        refetch: rawRefetchUserAdminHistory,
    } = useUserAdminTopUpHistoryQuery(selectedUserId || "", { enabled: enableUserHistory });

    // Guard refetch methods so disabled queries never execute or trigger network requests on refetch
    const refetchRequests = () => {
        if (!enableRequests) return Promise.resolve(undefined);
        return rawRefetchRequests();
    };

    const refetchAnalytics = () => {
        if (!enableAnalytics) return Promise.resolve(undefined);
        return rawRefetchAnalytics();
    };

    const refetchAllPackages = () => {
        if (!enablePackages) return Promise.resolve(undefined);
        return rawRefetchAllPackages();
    };

    const refetchMfsSettings = () => {
        if (!enableMfsSettings) return Promise.resolve(undefined);
        return rawRefetchMfsSettings();
    };

    const refetchAllMfsProviders = () => {
        if (!enableMfsProviders) return Promise.resolve(undefined);
        return rawRefetchAllMfsProviders();
    };

    const refetchUserAdminHistory = () => {
        if (!enableUserHistory || !selectedUserId) return Promise.resolve(undefined);
        return rawRefetchUserAdminHistory();
    };

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
        refetchMfsSettings,

        allMfsProviders,
        isLoadingAllMfsProviders,
        refetchAllMfsProviders,

        userAdminHistory: userAdminHistory?.requests || [],
        userTotalSpend: userAdminHistory?.totalSpend || 0,
        isLoadingUserAdminHistory,
        refetchUserAdminHistory,

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

export function useAdminRequestsFacade(
    options: Omit<UseAdminTopUpFacadeOptions, "scope"> & {
        includeMfs?: boolean;
    } = {}
) {
    const { includeMfs = false, ...rest } = options;
    return useAdminTopUpFacade({
        ...rest,
        scope: "requests",
        enableMfsSettings: rest.enableMfsSettings ?? includeMfs,
        enableMfsProviders: rest.enableMfsProviders ?? includeMfs,
    });
}

export function useAdminCatalogFacade(
    options: Omit<UseAdminTopUpFacadeOptions, "scope"> = {}
) {
    return useAdminTopUpFacade({ ...options, scope: "catalog" });
}


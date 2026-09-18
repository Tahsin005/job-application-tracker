"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getActivePackagesAction,
    submitTopUpRequestAction,
    getUserTopUpHistoryAction,
} from "../actions/top-up";
import {
    getAdminTopUpRequestsAction,
    reviewTopUpRequestAction,
    getAdminTopUpAnalyticsAction,
    getAdminPackagesAction,
    upsertAdminPackageAction,
    toggleAdminPackageStatusAction,
    getAdminMfsSettingsAction,
    updateAdminMfsSettingsAction,
    getUserTopUpHistoryForAdminAction,
    getAdminMfsProvidersAction,
    upsertAdminMfsProviderAction,
    toggleAdminMfsProviderStatusAction,
    deleteAdminMfsProviderAction,
} from "../actions/admin-top-up";
import {
    CreateTopUpRequestInput,
    ReviewTopUpRequestInput,
    UpsertTopUpPackageInput,
    UpdateAdminMfsSettingsInput,
    UpsertMfsProviderInput,
} from "../validations/top-up";
import { aiKeys } from "./ai-queries";

export const topUpKeys = {
    all: ["top-ups"] as const,
    activePackages: () => [...topUpKeys.all, "active-packages"] as const,
    userHistory: () => [...topUpKeys.all, "user-history"] as const,
    adminRequests: (filters?: Record<string, unknown>) =>
        [...topUpKeys.all, "admin-requests", filters] as const,
    adminAnalytics: () => [...topUpKeys.all, "admin-analytics"] as const,
    adminPackages: () => [...topUpKeys.all, "admin-packages"] as const,
    adminMfs: () => [...topUpKeys.all, "admin-mfs"] as const,
    adminMfsProviders: () => [...topUpKeys.all, "admin-mfs-providers"] as const,
    userAdminHistory: (userId: string) =>
        [...topUpKeys.all, "user-admin-history", userId] as const,
};

export function useActivePackagesQuery() {
    return useQuery({
        queryKey: topUpKeys.activePackages(),
        queryFn: async () => {
            const res = await getActivePackagesAction();
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useUserTopUpHistoryQuery() {
    return useQuery({
        queryKey: topUpKeys.userHistory(),
        queryFn: async () => {
            const res = await getUserTopUpHistoryAction();
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        staleTime: 1000 * 30, // 30 seconds
    });
}

export function useSubmitTopUpMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateTopUpRequestInput) => {
            const res = await submitTopUpRequestAction(payload);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: topUpKeys.userHistory() });
        },
    });
}

export function useAdminTopUpRequestsQuery({
    status,
    search,
    page,
    limit,
    enabled = true,
}: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    enabled?: boolean;
} = {}) {
    return useQuery({
        queryKey: topUpKeys.adminRequests({ status, search, page, limit }),
        queryFn: async () => {
            const res = await getAdminTopUpRequestsAction({ status, search, page, limit });
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        enabled,
    });
}

export function useAdminTopUpAnalyticsQuery({ enabled = true }: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: topUpKeys.adminAnalytics(),
        queryFn: async () => {
            const res = await getAdminTopUpAnalyticsAction();
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        staleTime: 1000 * 30,
        enabled,
    });
}

export function useAdminReviewTopUpMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: ReviewTopUpRequestInput) => {
            const res = await reviewTopUpRequestAction(payload);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: topUpKeys.all });
            queryClient.invalidateQueries({ queryKey: aiKeys.usage() });
        },
    });
}

export function useAdminPackagesQuery({ enabled = true }: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: topUpKeys.adminPackages(),
        queryFn: async () => {
            const res = await getAdminPackagesAction();
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        staleTime: 1000 * 60,
        enabled,
    });
}

export function useAdminUpsertPackageMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: UpsertTopUpPackageInput) => {
            const res = await upsertAdminPackageAction(payload);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: topUpKeys.adminPackages() });
            queryClient.invalidateQueries({ queryKey: topUpKeys.activePackages() });
        },
    });
}

export function useAdminTogglePackageStatusMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (packageId: string) => {
            const res = await toggleAdminPackageStatusAction(packageId);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: topUpKeys.adminPackages() });
            queryClient.invalidateQueries({ queryKey: topUpKeys.activePackages() });
        },
    });
}

export function useAdminMfsSettingsQuery({ enabled = true }: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: topUpKeys.adminMfs(),
        queryFn: async () => {
            const res = await getAdminMfsSettingsAction();
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
        enabled,
    });
}

export function useAdminUpdateMfsSettingsMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: UpdateAdminMfsSettingsInput) => {
            const res = await updateAdminMfsSettingsAction(payload);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: topUpKeys.adminMfs() });
            queryClient.invalidateQueries({ queryKey: topUpKeys.activePackages() });
        },
    });
}

export function useUserAdminTopUpHistoryQuery(userId: string) {
    return useQuery({
        queryKey: topUpKeys.userAdminHistory(userId),
        queryFn: async () => {
            const res = await getUserTopUpHistoryForAdminAction(userId);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        enabled: Boolean(userId),
    });
}

export function useAdminMfsProvidersQuery({ enabled = true }: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: topUpKeys.adminMfsProviders(),
        queryFn: async () => {
            const res = await getAdminMfsProvidersAction();
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        staleTime: 1000 * 60,
        enabled,
    });
}

export function useAdminUpsertMfsProviderMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: UpsertMfsProviderInput) => {
            const res = await upsertAdminMfsProviderAction(payload);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: topUpKeys.adminMfsProviders() });
            queryClient.invalidateQueries({ queryKey: topUpKeys.activePackages() });
        },
    });
}

export function useAdminToggleMfsProviderMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (providerId: string) => {
            const res = await toggleAdminMfsProviderStatusAction(providerId);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: topUpKeys.adminMfsProviders() });
            queryClient.invalidateQueries({ queryKey: topUpKeys.activePackages() });
        },
    });
}

export function useAdminDeleteMfsProviderMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (providerId: string) => {
            const res = await deleteAdminMfsProviderAction(providerId);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: topUpKeys.adminMfsProviders() });
            queryClient.invalidateQueries({ queryKey: topUpKeys.activePackages() });
        },
    });
}

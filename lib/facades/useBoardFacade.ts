"use client";

import { useMemo } from "react";
import { Board } from "../models/models.types";
import {
    useBoardQuery,
    useCreateJobMutation,
    useUpdateJobMutation,
    useDeleteJobMutation,
    useMoveJobMutation,
} from "../queries/board-queries";
import { useBoardStore } from "../store/board-store";
import { toast } from "sonner";
import { CreateJobApplicationInput, UpdateJobApplicationInput } from "../validations/job-application";

export function useBoardFacade(initialBoard?: Board | null) {
    const {
        data: board,
        isLoading,
        isError,
        error,
        refetch,
    } = useBoardQuery(initialBoard);

    const createMutation = useCreateJobMutation();
    const updateMutation = useUpdateJobMutation();
    const deleteMutation = useDeleteJobMutation();
    const moveMutation = useMoveJobMutation();

    const activeId = useBoardStore((s) => s.activeId);
    const setActiveId = useBoardStore((s) => s.setActiveId);
    const searchQuery = useBoardStore((s) => s.searchQuery);
    const setSearchQuery = useBoardStore((s) => s.setSearchQuery);
    const selectedTag = useBoardStore((s) => s.selectedTag);
    const setSelectedTag = useBoardStore((s) => s.setSelectedTag);
    const resetFilters = useBoardStore((s) => s.resetFilters);
    const columns = board?.columns;

    const filteredColumns = useMemo(() => {
        if (!columns) return [];
        const query = searchQuery.trim().toLowerCase();

        return columns.map((col) => {
            let jobs = col.jobApplications || [];
            if (query || selectedTag) {
                jobs = jobs.filter((job) => {
                    const matchesSearch =
                        !query ||
                        job.company.toLowerCase().includes(query) ||
                        job.position.toLowerCase().includes(query) ||
                        (job.location && job.location.toLowerCase().includes(query)) ||
                        (job.tags && job.tags.some((t) => t.toLowerCase().includes(query)));

                    const matchesTag =
                        !selectedTag ||
                        (job.tags && job.tags.includes(selectedTag));

                    return matchesSearch && matchesTag;
                });
            }
            return {
                ...col,
                jobApplications: jobs,
            };
        });
    }, [columns, searchQuery, selectedTag]);

    const moveJob = async (jobApplicationId: string, newColumnId: string, newOrder: number) => {
        try {
            await moveMutation.mutateAsync({
                jobApplicationId,
                newColumnId,
                newOrder,
            });
        } catch (err) {
            toast.error("Failed to move job application", {
                description: err instanceof Error ? err.message : "An unexpected error occurred.",
            });
            throw err;
        }
    };

    const createJob = async (input: CreateJobApplicationInput) => {
        try {
            const tags = input.tags
                ? input.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                : [];

            const result = await createMutation.mutateAsync({
                ...input,
                tags,
            });
            toast.success("Job application created!");
            return result;
        } catch (err) {
            toast.error("Failed to create application", {
                description: err instanceof Error ? err.message : "An unexpected error occurred.",
            });
            throw err;
        }
    };

    const updateJob = async (id: string, input: UpdateJobApplicationInput) => {
        try {
            const tags = input.tags !== undefined
                ? input.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                : undefined;

            const result = await updateMutation.mutateAsync({
                id,
                updates: {
                    ...input,
                    tags,
                },
            });
            toast.success("Application updated successfully");
            return result;
        } catch (err) {
            toast.error("Failed to update application", {
                description: err instanceof Error ? err.message : "An unexpected error occurred.",
            });
            throw err;
        }
    };

    const deleteJob = async (id: string) => {
        try {
            const result = await deleteMutation.mutateAsync(id);
            toast.success("Application removed");
            return result;
        } catch (err) {
            toast.error("Failed to delete application", {
                description: err instanceof Error ? err.message : "An unexpected error occurred.",
            });
            throw err;
        }
    };

    return {
        board,
        columns: filteredColumns,
        rawColumns: board?.columns || [],
        isLoading,
        isError,
        error,
        activeId,
        setActiveId,
        searchQuery,
        setSearchQuery,
        selectedTag,
        setSelectedTag,
        resetFilters,
        isMutating:
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending ||
            moveMutation.isPending,
        moveJob,
        createJob,
        updateJob,
        deleteJob,
        refetchBoard: refetch,
    };
}

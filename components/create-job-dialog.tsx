"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Skeleton } from "./ui/skeleton";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
    () => import("./ui/rich-text-editor").then((m) => m.RichTextEditor),
    {
        ssr: false,
        loading: () => (
            <div className="rounded-lg border border-input bg-background/50 p-3 space-y-2 min-h-[160px]">
                <div className="flex gap-2 border-b border-border/40 pb-2">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-6 w-6 rounded ml-2" />
                    <Skeleton className="h-6 w-6 rounded" />
                </div>
                <div className="space-y-2 pt-2">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3.5 w-1/2" />
                    <Skeleton className="h-3.5 w-5/6" />
                </div>
            </div>
        ),
    }
);
import { useBoardFacade } from "@/lib/facades/useBoardFacade";
import {
    createJobApplicationSchema,
    CreateJobApplicationInput,
} from "@/lib/validations/job-application";

interface CreateJobApplicationDialogProps {
    columnId: string;
    boardId: string;
}

export default function CreateJobApplicationDialog({
    columnId,
    boardId,
}: CreateJobApplicationDialogProps) {
    const [open, setOpen] = useState<boolean>(false);
    const { createJob } = useBoardFacade();

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateJobApplicationInput>({
        resolver: zodResolver(createJobApplicationSchema),
        defaultValues: {
            company: "",
            position: "",
            location: "",
            salary: "",
            jobUrl: "",
            tags: "",
            description: "",
            notes: "",
            columnId,
            boardId,
        },
    });

    async function onSubmit(data: CreateJobApplicationInput) {
        try {
            await createJob(data);
            reset();
            setOpen(false);
        } catch {
            // Error handling & toasts are encapsulated in the facade
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full mb-3 justify-center text-muted-foreground hover:text-foreground border-dashed border-black/15 dark:border-white/15 hover:border-solid hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all shadow-2xs cursor-pointer py-2 text-xs font-semibold"
                >
                    <Plus className="mr-1.5 h-4 w-4 text-primary" />
                    Add Application
                </Button>
            </DialogTrigger>
            {open && (
                <DialogContent className="w-[92vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto glass-panel border border-black/10 dark:border-white/10 shadow-2xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground">Add Job Application</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">Track a new job opportunity in your pipeline</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <input type="hidden" {...register("columnId")} value={columnId} />
                    <input type="hidden" {...register("boardId")} value={boardId} />

                    <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 pr-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-company">Company *</Label>
                                <Input
                                    id="create-company"
                                    placeholder="e.g., Stripe"
                                    {...register("company")}
                                />
                                {errors.company && (
                                    <p className="text-xs text-destructive">{errors.company.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="create-position">Position *</Label>
                                <Input
                                    id="create-position"
                                    placeholder="e.g., Frontend Engineer"
                                    {...register("position")}
                                />
                                {errors.position && (
                                    <p className="text-xs text-destructive">{errors.position.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-location">Location</Label>
                                <Input
                                    id="create-location"
                                    placeholder="e.g., Remote / San Francisco"
                                    {...register("location")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-salary">Salary</Label>
                                <Input
                                    id="create-salary"
                                    placeholder="e.g., $100k - $150k"
                                    {...register("salary")}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-jobUrl">Job URL</Label>
                            <Input
                                id="create-jobUrl"
                                type="url"
                                placeholder="https://..."
                                {...register("jobUrl")}
                            />
                            {errors.jobUrl && (
                                <p className="text-xs text-destructive">{errors.jobUrl.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-tags">Tags (comma-separated)</Label>
                            <Input
                                id="create-tags"
                                placeholder="React, Tailwind, Remote"
                                {...register("tags")}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="create-description">Description</Label>
                                <span className="text-[11px] text-muted-foreground">Rich text / paste supported</span>
                            </div>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <RichTextEditor
                                        id="create-description"
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Paste the role details, responsibilities, or requirements..."
                                    />
                                )}
                            />
                            {errors.description && (
                                <p className="text-xs text-destructive">{errors.description.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-notes">Notes</Label>
                            <Textarea
                                id="create-notes"
                                rows={4}
                                placeholder="Personal notes, referral info, interview tips..."
                                {...register("notes")}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Application"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            )}
        </Dialog>
    );
}
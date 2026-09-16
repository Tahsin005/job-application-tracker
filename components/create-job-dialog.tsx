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
import { RichTextEditor } from "./ui/rich-text-editor";
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
                    className="w-full mb-4 justify-start text-muted-foreground border-dashed border-2 hover:border-solid hover:bg-muted/50"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Job
                </Button>
            </DialogTrigger>

            <DialogContent className="w-[92vw] sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Job Application</DialogTitle>
                    <DialogDescription>Track a new job application</DialogDescription>
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
        </Dialog>
    );
}
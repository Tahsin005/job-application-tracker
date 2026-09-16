"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Column, JobApplication } from "@/lib/models/models.types";
import { Card, CardContent } from "./ui/card";
import { Edit2, ExternalLink, MoreVertical, Trash2, Sparkles, FileText } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { RichTextEditor } from "./ui/rich-text-editor";
import { stripHtmlTags, truncateText } from "@/lib/utils";
import { useBoardFacade } from "@/lib/facades/useBoardFacade";
import {
    updateJobApplicationSchema,
    UpdateJobApplicationInput,
} from "@/lib/validations/job-application";
import { AtsAnalysisModal } from "./ai/ats-analysis-modal";

interface JobApplicationCardProps {
    job: JobApplication;
    columns: Column[];
    dragHandleProps?: React.HTMLAttributes<HTMLElement>;
    isOverlay?: boolean;
}

export default function JobApplicationCard({
    job,
    columns,
    dragHandleProps,
    isOverlay,
}: JobApplicationCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isAtsOpen, setIsAtsOpen] = useState(false);
    const { updateJob, deleteJob, moveJob } = useBoardFacade();

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UpdateJobApplicationInput>({
        resolver: zodResolver(updateJobApplicationSchema),
        defaultValues: {
            company: job.company,
            position: job.position,
            location: job.location || "",
            notes: job.notes || "",
            salary: job.salary || "",
            jobUrl: job.jobUrl || "",
            tags: job.tags?.join(", ") || "",
            description: job.description || "",
        },
    });

    useEffect(() => {
        if (isEditing) {
            reset({
                company: job.company,
                position: job.position,
                location: job.location || "",
                notes: job.notes || "",
                salary: job.salary || "",
                jobUrl: job.jobUrl || "",
                tags: job.tags?.join(", ") || "",
                description: job.description || "",
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing, reset]);

    async function onUpdateSubmit(data: UpdateJobApplicationInput) {
        try {
            await updateJob(job._id, data);
            setIsEditing(false);
        } catch {
            // Error handling & toasts are encapsulated in the facade
        }
    }

    async function handleDelete() {
        try {
            await deleteJob(job._id);
        } catch {
            // Handled in facade
        }
    }

    async function handleMove(newColumnId: string) {
        try {
            await moveJob(job._id, newColumnId, 0);
        } catch {
            // Handled in facade
        }
    }

    return (
        <>
            <Card
                className="cursor-pointer transition-shadow hover:shadow-lg bg-white group shadow-sm"
                {...dragHandleProps}
            >
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm mb-1">{job.position}</h3>
                            <p className="text-xs text-muted-foreground mb-1.5">
                                {job.company}
                            </p>


                            <div className="flex items-center gap-1.5 flex-wrap mb-2">
                                {job.atsAnalysis && (
                                    <Badge
                                        variant={
                                            job.atsAnalysis.score >= 75
                                                ? "success"
                                                : job.atsAnalysis.score >= 50
                                                    ? "warning"
                                                    : "danger"
                                        }
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsAtsOpen(true);
                                        }}
                                        className="cursor-pointer gap-1 text-[11px] py-0 px-1.5 hover:opacity-80 transition-opacity"
                                        title="Click to view ATS Score and Recommendations"
                                    >
                                        <Sparkles className="size-3" />
                                        ATS: {job.atsAnalysis.score}%
                                    </Badge>
                                )}
                                {job.attachedResumeName && (
                                    <Badge
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsAtsOpen(true);
                                        }}
                                        className="cursor-pointer gap-1 text-[10px] py-0 px-1.5 text-slate-600 bg-slate-50 hover:bg-slate-100"
                                        title="Attached Resume Version"
                                    >
                                        <FileText className="size-3 text-indigo-500" />
                                        <span className="truncate max-w-[120px]">
                                            {job.attachedResumeName}
                                        </span>
                                    </Badge>
                                )}
                            </div>

                            {job.description && (
                                <p
                                    className="text-xs text-muted-foreground mb-2 truncate max-w-full"
                                    title={stripHtmlTags(job.description)}
                                >
                                    {truncateText(job.description, 85)}
                                </p>
                            )}
                            {job.tags && job.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {job.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {job.jobUrl && (
                                <a
                                    href={job.jobUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>

                        {!isOverlay && (
                            <div className="flex items-start gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAtsOpen(true);
                                    }}
                                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 size-6"
                                    title="AI Intelligence & ATS Match"
                                >
                                    <Sparkles className="size-3.5" />
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setIsAtsOpen(true)}>
                                            <Sparkles className="mr-2 h-4 w-4 text-indigo-600" />
                                            AI & ATS Match
                                        </DropdownMenuItem>

                                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                            <Edit2 className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>

                                        {columns.length > 1 && (
                                            <>
                                                {columns
                                                    .filter((c) => c._id !== job.columnId)
                                                    .map((column, key) => (
                                                        <DropdownMenuItem
                                                            key={key}
                                                            onClick={() => handleMove(column._id)}
                                                        >
                                                            Move to {column.name}
                                                        </DropdownMenuItem>
                                                    ))}
                                            </>
                                        )}

                                        <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => handleDelete()}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {!isOverlay && (
                <>
                    <AtsAnalysisModal
                        job={job}
                        open={isAtsOpen}
                        onOpenChange={setIsAtsOpen}
                    />
                    <Dialog open={isEditing} onOpenChange={setIsEditing}>
                        <DialogContent className="w-[92vw] sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Edit Job Application</DialogTitle>
                                <DialogDescription>Update details for this job application</DialogDescription>
                            </DialogHeader>
                            <form className="space-y-4" onSubmit={handleSubmit(onUpdateSubmit)}>
                                <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 pr-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-company">Company *</Label>
                                            <Input
                                                id="edit-company"
                                                {...register("company")}
                                            />
                                            {errors.company && (
                                                <p className="text-xs text-destructive">{errors.company.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-position">Position *</Label>
                                            <Input
                                                id="edit-position"
                                                {...register("position")}
                                            />
                                            {errors.position && (
                                                <p className="text-xs text-destructive">{errors.position.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-location">Location</Label>
                                            <Input
                                                id="edit-location"
                                                {...register("location")}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-salary">Salary</Label>
                                            <Input
                                                id="edit-salary"
                                                placeholder="e.g., $100k - $150k"
                                                {...register("salary")}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="edit-jobUrl">Job URL</Label>
                                        <Input
                                            id="edit-jobUrl"
                                            type="url"
                                            placeholder="https://..."
                                            {...register("jobUrl")}
                                        />
                                        {errors.jobUrl && (
                                            <p className="text-xs text-destructive">{errors.jobUrl.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                                        <Input
                                            id="edit-tags"
                                            placeholder="React, Tailwind, High Pay"
                                            {...register("tags")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="edit-description">Description</Label>
                                            <span className="text-[11px] text-muted-foreground">Rich text / paste supported</span>
                                        </div>
                                        <Controller
                                            name="description"
                                            control={control}
                                            render={({ field }) => (
                                                <RichTextEditor
                                                    id="edit-description"
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
                                        <Label htmlFor="edit-notes">Notes</Label>
                                        <Textarea
                                            id="edit-notes"
                                            rows={4}
                                            {...register("notes")}
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Saving..." : "Save Changes"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </>
    );
}
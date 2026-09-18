"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    interviewRoundSchema,
    InterviewRoundInput,
} from "@/lib/validations/job-application";
import { InterviewRound, InterviewRoundType } from "@/lib/models/models.types";
import { ROUND_CONFIG } from "./interview-round-badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
    Calendar as CalendarIcon,
    Clock,
    Link as LinkIcon,
    UserCheck,
    MapPin,
    FileText,
    Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InterviewRoundFormProps {
    initialData?: InterviewRound | null;
    onSubmit: (data: InterviewRoundInput) => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
}

const ROUND_TYPES: InterviewRoundType[] = [
    "Screening",
    "Technical",
    "System Design",
    "Behavioral",
    "Final",
];

const DURATION_OPTIONS = [
    { label: "30 min", value: 30 },
    { label: "45 min", value: 45 },
    { label: "60 min", value: 60 },
    { label: "90 min", value: 90 },
];

function formatDefaultDateTime(dateInput?: string | Date): string {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

    if (dateInput) {
        const existing = new Date(dateInput);
        return `${existing.getFullYear()}-${pad(existing.getMonth() + 1)}-${pad(
            existing.getDate()
        )}T${pad(existing.getHours())}:${pad(existing.getMinutes())}`;
    }

    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    // Round to next 15 minutes for new rounds only
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
    )}:${pad(d.getMinutes())}`;
}

export function InterviewRoundForm({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: InterviewRoundFormProps) {
    const defaultDateTime = formatDefaultDateTime(initialData?.scheduledAt);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<InterviewRoundInput>({
        resolver: zodResolver(interviewRoundSchema),
        defaultValues: {
            roundType: initialData?.roundType || "Screening",
            customRoundName: initialData?.customRoundName || "",
            scheduledAt: defaultDateTime,
            durationMinutes: initialData?.durationMinutes || 60,
            interviewerNames: initialData?.interviewerNames || "",
            meetingUrl: initialData?.meetingUrl || "",
            location: initialData?.location || "",
            notes: initialData?.notes || "",
            status: initialData?.status || "scheduled",
            feedback: initialData?.feedback || "",
        },
    });

    const selectedRoundType = watch("roundType");
    const selectedDuration = watch("durationMinutes");

    const handleFormSubmit = async (values: InterviewRoundInput) => {
        await onSubmit(values);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">

            <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                    Round Type *
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {ROUND_TYPES.map((type) => {
                        const config = ROUND_CONFIG[type];
                        const Icon = config.icon;
                        const isSelected = selectedRoundType === type;

                        return (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setValue("roundType", type)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer relative",
                                    isSelected
                                        ? "bg-indigo-50/80 border-indigo-500 text-indigo-950 shadow-xs ring-2 ring-indigo-500/20 font-semibold"
                                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "size-4 mb-1.5",
                                        isSelected ? "text-indigo-600" : "text-slate-400"
                                    )}
                                />
                                <span>{config.label}</span>
                                {isSelected && (
                                    <span className="absolute top-1 right-1 size-3.5 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                                        <Check className="size-2.5 stroke-[3]" />
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label htmlFor="customRoundName" className="text-xs font-medium text-slate-700">
                        Round Title (optional)
                    </Label>
                    <Input
                        id="customRoundName"
                        placeholder="e.g. Technical Screen with EM"
                        {...register("customRoundName")}
                        className="h-9 text-xs"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="status" className="text-xs font-medium text-slate-700">
                        Status
                    </Label>
                    <select
                        id="status"
                        {...register("status")}
                        className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-2xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        <option value="scheduled">Upcoming / Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="passed">Passed</option>
                        <option value="rejected">Declined</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label htmlFor="scheduledAt" className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                        <CalendarIcon className="size-3.5 text-indigo-500" />
                        Date & Time *
                    </Label>
                    <Input
                        id="scheduledAt"
                        type="datetime-local"
                        {...register("scheduledAt")}
                        className="h-9 text-xs"
                    />
                    {errors.scheduledAt && (
                        <p className="text-[11px] text-destructive">
                            {errors.scheduledAt.message}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                        <Clock className="size-3.5 text-indigo-500" />
                        Duration
                    </Label>
                    <div className="grid grid-cols-4 gap-1.5">
                        {DURATION_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setValue("durationMinutes", opt.value)}
                                className={cn(
                                    "h-9 rounded-md border text-xs font-medium transition-all",
                                    selectedDuration === opt.value
                                        ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold"
                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label htmlFor="meetingUrl" className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                        <LinkIcon className="size-3.5 text-indigo-500" />
                        Meeting Link
                    </Label>
                    <Input
                        id="meetingUrl"
                        placeholder="https://meet.google.com/... or Zoom link"
                        {...register("meetingUrl")}
                        className="h-9 text-xs"
                    />
                    {errors.meetingUrl && (
                        <p className="text-[11px] text-destructive">
                            {errors.meetingUrl.message}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="interviewerNames" className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                        <UserCheck className="size-3.5 text-indigo-500" />
                        Interviewer(s)
                    </Label>
                    <Input
                        id="interviewerNames"
                        placeholder="e.g. Sarah Connor (Principal Architect)"
                        {...register("interviewerNames")}
                        className="h-9 text-xs"
                    />
                </div>
            </div>


            <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-indigo-500" />
                    Location / Platform (optional)
                </Label>
                <Input
                    id="location"
                    placeholder="e.g. Google Meet, Zoom, or On-site HQ"
                    {...register("location")}
                    className="h-9 text-xs"
                />
            </div>


            <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <FileText className="size-3.5 text-indigo-500" />
                    Preparation Notes & Focus Topics
                </Label>
                <Textarea
                    id="notes"
                    placeholder="Topics to prepare, coding questions to review, questions to ask interviewer..."
                    rows={3}
                    {...register("notes")}
                    className="text-xs resize-none"
                />
            </div>


            {initialData && (
                <div className="space-y-1.5">
                    <Label htmlFor="feedback" className="text-xs font-medium text-slate-700">
                        Post-Interview Feedback & Reflections
                    </Label>
                    <Textarea
                        id="feedback"
                        placeholder="How did it go? What questions were asked? Areas for improvement..."
                        rows={2}
                        {...register("feedback")}
                        className="text-xs resize-none"
                    />
                </div>
            )}


            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 font-medium"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Schedule Interview"}
                </Button>
            </div>
        </form>
    );
}

import React from "react";
import { InterviewRoundType, InterviewStatus } from "@/lib/models/models.types";
import { Badge } from "../ui/badge";
import {
    Search,
    Code,
    Network,
    Users,
    Trophy,
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    MinusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RoundTypeConfig {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    className: string;
    borderClass: string;
}

export const ROUND_CONFIG: Record<InterviewRoundType, RoundTypeConfig> = {
    Screening: {
        label: "Screening",
        icon: Search,
        className: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100",
        borderClass: "border-cyan-400",
    },
    Technical: {
        label: "Technical",
        icon: Code,
        className: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
        borderClass: "border-indigo-400",
    },
    "System Design": {
        label: "System Design",
        icon: Network,
        className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
        borderClass: "border-purple-400",
    },
    Behavioral: {
        label: "Behavioral",
        icon: Users,
        className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
        borderClass: "border-amber-400",
    },
    Final: {
        label: "Final",
        icon: Trophy,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
        borderClass: "border-emerald-400",
    },
    Other: {
        label: "Other",
        icon: Calendar,
        className: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100",
        borderClass: "border-slate-400",
    },
};

export function InterviewRoundBadge({
    roundType,
    className,
}: {
    roundType: InterviewRoundType;
    className?: string;
}) {
    const config = ROUND_CONFIG[roundType] || ROUND_CONFIG.Other;
    const Icon = config.icon;

    return (
        <Badge
            variant="outline"
            className={cn(
                "inline-flex items-center gap-1.5 font-medium text-xs px-2.5 py-0.5 border shadow-2xs transition-colors",
                config.className,
                className
            )}
        >
            <Icon className="size-3.5 shrink-0" />
            <span>{config.label}</span>
        </Badge>
    );
}

export function InterviewStatusBadge({
    status,
    className,
}: {
    status: InterviewStatus;
    className?: string;
}) {
    switch (status) {
        case "passed":
            return (
                <Badge
                    variant="outline"
                    className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200",
                        className
                    )}
                >
                    <CheckCircle className="size-3" />
                    Passed
                </Badge>
            );
        case "completed":
            return (
                <Badge
                    variant="outline"
                    className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-700 border-slate-200",
                        className
                    )}
                >
                    <CheckCircle className="size-3 text-slate-500" />
                    Completed
                </Badge>
            );
        case "rejected":
            return (
                <Badge
                    variant="outline"
                    className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-semibold bg-rose-50 text-rose-700 border-rose-200",
                        className
                    )}
                >
                    <XCircle className="size-3" />
                    Declined
                </Badge>
            );
        case "cancelled":
            return (
                <Badge
                    variant="outline"
                    className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-semibold bg-zinc-100 text-zinc-600 border-zinc-200",
                        className
                    )}
                >
                    <MinusCircle className="size-3" />
                    Cancelled
                </Badge>
            );
        case "scheduled":
        default:
            return (
                <Badge
                    variant="outline"
                    className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-700 border-blue-200",
                        className
                    )}
                >
                    <Clock className="size-3" />
                    Upcoming
                </Badge>
            );
    }
}

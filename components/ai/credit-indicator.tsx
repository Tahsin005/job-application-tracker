"use client";

import { useAiResumeFacade } from "@/lib/facades/useAiResumeFacade";
import { Zap } from "lucide-react";
import { Badge } from "../ui/badge";

export function CreditIndicator() {
    const { usage, isLoadingUsage } = useAiResumeFacade();

    if (isLoadingUsage || !usage) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full shadow-xs">
            <div className="flex items-center gap-1 font-medium text-slate-700">
                <Zap className="size-3.5 text-amber-500 fill-amber-400" />
                <span>AI Credits:</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Badge
                    variant={usage.atsScan.remaining > 0 ? "success" : "destructive"}
                    className="px-1.5 py-0 text-[11px] font-normal"
                >
                    ATS: {usage.atsScan.remaining}/{usage.atsScan.limit}
                </Badge>
                <Badge
                    variant={usage.coverLetter.remaining > 0 ? "secondary" : "destructive"}
                    className="px-1.5 py-0 text-[11px] font-normal"
                >
                    Letter: {usage.coverLetter.remaining}/{usage.coverLetter.limit}
                </Badge>
                <Badge
                    variant={usage.outreach.remaining > 0 ? "outline" : "destructive"}
                    className="px-1.5 py-0 text-[11px] font-normal"
                >
                    Outreach: {usage.outreach.remaining}/{usage.outreach.limit}
                </Badge>
            </div>
        </div>
    );
}

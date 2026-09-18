"use client";

import { useState } from "react";
import { useAiResumeFacade } from "@/lib/facades/useAiResumeFacade";
import { Zap, Sparkles } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { TopUpModal } from "../top-up/top-up-modal";

export function CreditIndicator() {
    const { usage, isLoadingUsage } = useAiResumeFacade();
    const [topUpOpen, setTopUpOpen] = useState(false);

    if (isLoadingUsage || !usage) {
        return null;
    }

    const hasAnyLowCredits =
        usage.atsScan.remaining <= 1 ||
        usage.coverLetter.remaining <= 1 ||
        usage.outreach.remaining <= 1 ||
        (usage.applicationEmail && usage.applicationEmail.remaining <= 1);

    return (
        <>
            <div className="w-full sm:w-auto max-w-full bg-linear-to-r from-amber-50/80 via-orange-50/40 to-amber-50/70 border border-amber-200/90 rounded-2xl sm:rounded-full p-2.5 sm:px-3 sm:py-1.5 shadow-2xs hover:border-amber-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5">

                    <div className="flex items-center justify-between sm:justify-start gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                            <Zap className="size-3.5 text-amber-500 fill-amber-400 shrink-0" />
                            <span className="whitespace-nowrap">AI Credits:</span>
                        </div>


                        <div className="sm:hidden">
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => setTopUpOpen(true)}
                                className="h-6 px-2.5 text-[11px] font-bold bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white shadow-xs gap-1.5 rounded-full cursor-pointer transition-all active:scale-95"
                            >
                                <Sparkles className="h-3 w-3 fill-amber-200 text-white" />
                                <span>Top Up</span>
                                {hasAnyLowCredits && (
                                    <span className="relative flex h-1.5 w-1.5 ml-0.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>


                    <div className="grid grid-cols-2 xs:grid-cols-4 sm:flex items-center gap-1.5">
                        <Badge
                            variant={usage.atsScan.remaining > 0 ? "success" : "destructive"}
                            className="px-2 sm:px-1.5 py-0.5 sm:py-0 text-[11px] font-normal justify-center whitespace-nowrap"
                        >
                            ATS: {usage.atsScan.remaining}/{usage.atsScan.limit}
                        </Badge>
                        <Badge
                            variant={usage.coverLetter.remaining > 0 ? "secondary" : "destructive"}
                            className="px-2 sm:px-1.5 py-0.5 sm:py-0 text-[11px] font-normal justify-center whitespace-nowrap"
                        >
                            Letter: {usage.coverLetter.remaining}/{usage.coverLetter.limit}
                        </Badge>
                        <Badge
                            variant={usage.outreach.remaining > 0 ? "outline" : "destructive"}
                            className="px-2 sm:px-1.5 py-0.5 sm:py-0 text-[11px] font-normal bg-white justify-center whitespace-nowrap"
                        >
                            Outreach: {usage.outreach.remaining}/{usage.outreach.limit}
                        </Badge>
                        {usage.applicationEmail && (
                            <Badge
                                variant={usage.applicationEmail.remaining > 0 ? "outline" : "destructive"}
                                className={`px-2 sm:px-1.5 py-0.5 sm:py-0 text-[11px] font-normal bg-white justify-center whitespace-nowrap ${usage.applicationEmail.remaining > 0
                                        ? "text-indigo-700 border-indigo-200 bg-indigo-50/50"
                                        : ""
                                    }`}
                            >
                                Email: {usage.applicationEmail.remaining}/{usage.applicationEmail.limit}
                            </Badge>
                        )}
                    </div>


                    <div className="hidden sm:flex items-center gap-2">
                        <div className="h-3 w-px bg-amber-200 ml-0.5" />
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setTopUpOpen(true)}
                            className="h-6 px-2.5 text-[11px] font-bold bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white shadow-xs shadow-amber-500/25 hover:shadow-md hover:shadow-amber-500/35 gap-1.5 rounded-full transition-all duration-150 hover:scale-[1.03] active:scale-95 group cursor-pointer shrink-0"
                            title="Top up credits for ATS scans, cover letters, and cold outreach"
                        >
                            <Sparkles className="h-3 w-3 fill-amber-200 text-white group-hover:rotate-12 transition-transform" />
                            <span>Top Up</span>
                            {hasAnyLowCredits && (
                                <span className="relative flex h-1.5 w-1.5 ml-0.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <TopUpModal open={topUpOpen} onOpenChange={setTopUpOpen} />
        </>
    );
}

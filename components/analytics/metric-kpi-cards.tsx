"use client";

import { Briefcase, CheckCircle2, Mic, Award, Sparkles, TrendingUp, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { KPIStats } from "@/lib/utils/analytics";

interface MetricKpiCardsProps {
    kpi: KPIStats;
}

export default function MetricKpiCards({ kpi }: MetricKpiCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

            <Card className="border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all">
                <CardContent className="p-5 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold tracking-wider">Applied Total</span>
                        <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                            <Briefcase className="size-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-slate-900">
                                {kpi.appliedCount}
                            </span>
                            <span className="text-xs text-slate-500">
                                of {kpi.totalTracked} total
                            </span>
                        </div>
                        <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                            <span className="inline-block size-1.5 rounded-full bg-blue-500" />
                            Submitted to companies
                        </div>
                    </div>
                </CardContent>
            </Card>


            <Card className="border-slate-200 bg-white shadow-xs hover:border-emerald-300 transition-all">
                <CardContent className="p-5 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold tracking-wider">Interview Rate</span>
                        <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
                            <Mic className="size-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-emerald-700">
                                {kpi.interviewConversionRate}%
                            </span>
                            <span className="text-xs text-slate-500">
                                ({kpi.interviewCount} secured)
                            </span>
                        </div>
                        <div className="mt-2 text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                            <TrendingUp className="size-3" />
                            Applied ➔ Interviews
                        </div>
                    </div>
                </CardContent>
            </Card>


            <Card className="border-slate-200 bg-white shadow-xs hover:border-amber-300 transition-all">
                <CardContent className="p-5 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold tracking-wider">Offer Rate</span>
                        <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
                            <Award className="size-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-amber-700">
                                {kpi.offerConversionRate}%
                            </span>
                            <span className="text-xs text-slate-500">
                                ({kpi.offerCount} offers)
                            </span>
                        </div>
                        <div className="mt-2 text-[11px] text-amber-600 flex items-center gap-1 font-medium">
                            <ArrowUpRight className="size-3" />
                            Interviews ➔ Offers
                        </div>
                    </div>
                </CardContent>
            </Card>


            <Card className="border-slate-200 bg-white shadow-xs hover:border-indigo-300 transition-all">
                <CardContent className="p-5 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold tracking-wider">Pipeline Win</span>
                        <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600">
                            <CheckCircle2 className="size-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-indigo-700">
                                {kpi.overallConversionRate}%
                            </span>
                            <span className="text-xs text-slate-500">
                                overall
                            </span>
                        </div>
                        <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                            <span className="inline-block size-1.5 rounded-full bg-indigo-500" />
                            Applied ➔ Accepted Offer
                        </div>
                    </div>
                </CardContent>
            </Card>


            <Card className="border-slate-200 bg-white shadow-xs hover:border-purple-300 transition-all">
                <CardContent className="p-5 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold tracking-wider">Avg ATS Score</span>
                        <div className="p-1.5 rounded-md bg-purple-50 text-purple-600">
                            <Sparkles className="size-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-purple-700">
                                {kpi.averageAtsScore !== null ? `${kpi.averageAtsScore}%` : "—"}
                            </span>
                            <span className="text-xs text-slate-500">
                                {kpi.analyzedJobsCount > 0 ? `(${kpi.analyzedJobsCount} scanned)` : "no scans"}
                            </span>
                        </div>
                        <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                            <span className="inline-block size-1.5 rounded-full bg-purple-500" />
                            Resume keyword match
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

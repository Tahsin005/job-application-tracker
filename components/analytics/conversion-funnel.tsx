"use client";

import { useState } from "react";
import {
    Briefcase,
    Mic,
    Award,
    ArrowRight,
    TrendingDown,
    Filter,
    Layers,
    ChevronDown,
    ChevronUp,
    MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FunnelStage, FunnelAnalytics } from "@/lib/utils/analytics";
import FunnelPieChart from "@/components/analytics/funnel-pie-chart";

interface ConversionFunnelProps {
    analytics: FunnelAnalytics;
}

export default function ConversionFunnel({ analytics }: ConversionFunnelProps) {
    const [viewMode, setViewMode] = useState<"conversion" | "lifecycle">("conversion");
    const [expandedStageId, setExpandedStageId] = useState<string | null>(null);

    const stages =
        viewMode === "conversion" ? analytics.funnelStages : analytics.fullLifecycleStages;

    const toggleExpand = (id: string) => {
        setExpandedStageId(expandedStageId === id ? null : id);
    };

    return (
        <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600">
                                <Filter className="size-4" />
                            </div>
                            <CardTitle className="text-lg font-bold text-slate-900">
                                Conversion Funnel Visualization
                            </CardTitle>
                        </div>
                        <CardDescription className="text-xs text-slate-500 mt-1">
                            {viewMode === "conversion"
                                ? "Visual progression: Applied ➔ Interviews ➔ Offers with stage-by-stage conversion and drop-off velocity."
                                : "Full 5-stage lifecycle snapshot of all application cards across board columns."}
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/80 w-fit">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setViewMode("conversion");
                                setExpandedStageId(null);
                            }}
                            className={`h-7 px-2.5 text-xs font-medium rounded-md transition-all gap-1.5 ${viewMode === "conversion"
                                ? "bg-white text-indigo-700 shadow-xs hover:bg-white font-semibold"
                                : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            <Filter className="size-3" />
                            Funnel (3-Stage)
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setViewMode("lifecycle");
                                setExpandedStageId(null);
                            }}
                            className={`h-7 px-2.5 text-xs font-medium rounded-md transition-all gap-1.5 ${viewMode === "lifecycle"
                                ? "bg-white text-indigo-700 shadow-xs hover:bg-white font-semibold"
                                : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            <Layers className="size-3" />
                            Full Lifecycle
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-2">
                {viewMode === "conversion" ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-center">

                            <StageCard
                                stage={stages[0]}
                                icon={<Briefcase className="size-5" />}
                                isExpanded={expandedStageId === stages[0]?.id}
                                onToggle={() => toggleExpand(stages[0]?.id)}
                            />


                            <FunnelConnector
                                conversionRate={stages[1]?.conversionFromPrevious}
                                dropOffRate={stages[1]?.dropOffRate}
                                fromName="Applied"
                                toName="Interviews"
                            />


                            <StageCard
                                stage={stages[1]}
                                icon={<Mic className="size-5" />}
                                isExpanded={expandedStageId === stages[1]?.id}
                                onToggle={() => toggleExpand(stages[1]?.id)}
                            />


                            <FunnelConnector
                                conversionRate={stages[2]?.conversionFromPrevious}
                                dropOffRate={stages[2]?.dropOffRate}
                                fromName="Interviews"
                                toName="Offers"
                            />


                            <StageCard
                                stage={stages[2]}
                                icon={<Award className="size-5" />}
                                isExpanded={expandedStageId === stages[2]?.id}
                                onToggle={() => toggleExpand(stages[2]?.id)}
                            />
                        </div>



                        <FunnelPieChart
                            stages={stages}
                            overallWinRate={analytics.kpi.overallConversionRate}
                        />


                        {expandedStageId && (
                            <StageJobDrilldown
                                stage={stages.find((s) => s.id === expandedStageId)}
                                onClose={() => setExpandedStageId(null)}
                            />
                        )}
                    </div>
                ) : (
                    /* Full 5-Stage Lifecycle View */
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            {stages.map((stage) => (
                                <Card
                                    key={stage.id}
                                    role="button"
                                    tabIndex={0}
                                    aria-expanded={expandedStageId === stage.id}
                                    aria-label={`Toggle ${stage.name} applications drilldown`}
                                    className="border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    onClick={() => toggleExpand(stage.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            toggleExpand(stage.id);
                                        }
                                    }}
                                >
                                    <CardContent className="p-4 flex flex-col justify-between h-full">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-slate-700">
                                                {stage.name}
                                            </span>
                                            <Badge variant="outline" className={`text-[10px] ${stage.badgeColor}`}>
                                                {stage.percentageOfTop}%
                                            </Badge>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-slate-900">
                                                {stage.count}
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-1">
                                                applications in column
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>


                        <FunnelPieChart
                            stages={stages}
                            overallWinRate={analytics.kpi.overallConversionRate}
                        />

                        {expandedStageId && (
                            <StageJobDrilldown
                                stage={stages.find((s) => s.id === expandedStageId)}
                                onClose={() => setExpandedStageId(null)}
                            />
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function StageCard({
    stage,
    icon,
    isExpanded,
    onToggle,
}: {
    stage: FunnelStage | undefined;
    icon: React.ReactNode;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    if (!stage) return null;

    return (
        <div
            role="button"
            tabIndex={0}
            aria-expanded={isExpanded}
            aria-label={`Toggle ${stage.name} stage drilldown`}
            onClick={onToggle}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggle();
                }
            }}
            className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 ${isExpanded
                ? "border-indigo-500 bg-indigo-50/40 shadow-xs ring-2 ring-indigo-500/20"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                }`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stage.color} text-white shadow-xs`}>
                    {icon}
                </div>
                <Badge variant="outline" className={`text-[10px] font-semibold ${stage.badgeColor}`}>
                    {stage.percentageOfTop}% share
                </Badge>
            </div>

            <div>
                <span className="text-xs font-semibold tracking-wider text-slate-500">
                    {stage.name}
                </span>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                    {stage.count}
                </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{stage.jobs.length} jobs in stage</span>
                <div className="flex items-center gap-0.5 text-indigo-600 font-medium hover:underline">
                    {isExpanded ? (
                        <>
                            Hide <ChevronUp className="size-3" />
                        </>
                    ) : (
                        <>
                            View <ChevronDown className="size-3" />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function FunnelConnector({
    conversionRate,
    dropOffRate,
    fromName,
    toName,
}: {
    conversionRate: number | null | undefined;
    dropOffRate: number | null | undefined;
    fromName: string;
    toName: string;
}) {
    const rate = conversionRate ?? 0;
    const drop = dropOffRate ?? 0;

    return (
        <div className="flex flex-col items-center justify-center py-2 px-1 text-center">

            <div className="w-full flex items-center justify-center gap-1 my-1">
                <div className="h-0.5 w-6 bg-slate-200 hidden lg:block" />
                <div className="flex flex-col items-center">
                    <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs flex items-center gap-1">
                        <ArrowRight className="size-3" />
                        {rate}% Conv.
                    </div>
                    {drop > 0 && (
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-0.5">
                            <TrendingDown className="size-2.5 text-rose-500" />
                            {drop}% drop-off
                        </div>
                    )}
                </div>
                <div className="h-0.5 w-6 bg-slate-200 hidden lg:block" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium hidden lg:inline">
                {fromName} ➔ {toName}
            </span>
        </div>
    );
}

function StageJobDrilldown({
    stage,
    onClose,
}: {
    stage: FunnelStage | undefined;
    onClose: () => void;
}) {
    if (!stage) return null;

    return (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/20 p-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">
                        Applications in {stage.name} Stage
                    </span>
                    <Badge className="bg-indigo-600 text-white text-xs">
                        {stage.jobs.length} roles
                    </Badge>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-7 text-xs text-slate-500 hover:text-slate-800"
                >
                    Close
                </Button>
            </div>

            {stage.jobs.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                    No applications currently in this stage.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {stage.jobs.map((job) => (
                        <div
                            key={job._id}
                            className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs hover:border-indigo-300 transition-all"
                        >
                            <div className="font-semibold text-xs text-slate-900 truncate">
                                {job.company}
                            </div>
                            <div className="text-[11px] text-slate-600 truncate">
                                {job.position}
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                                <span className="flex items-center gap-1">
                                    <MapPin className="size-2.5" />
                                    {job.location || "Location not specified"}
                                </span>
                                {job.salary && (
                                    <span className="font-medium text-emerald-600">
                                        {job.salary}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

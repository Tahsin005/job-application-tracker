"use client";

import { Board } from "@/lib/models/models.types";
import { useBoardFacade } from "@/lib/facades/useBoardFacade";
import MetricKpiCards from "@/components/analytics/metric-kpi-cards";
import ConversionFunnel from "@/components/analytics/conversion-funnel";
import PipelineDistribution from "@/components/analytics/pipeline-distribution";
import ExportBackupCard from "@/components/analytics/export-backup-card";
import { Button } from "@/components/ui/button";
import { Sparkles, LayoutGrid } from "lucide-react";

interface AnalyticsDashboardProps {
    initialBoard?: Board | null;
}

export default function AnalyticsDashboard({ initialBoard }: AnalyticsDashboardProps) {
    const { analytics, setActiveTab } = useBoardFacade(initialBoard);
    const hasJobs = analytics.kpi.totalTracked > 0;

    return (
        <div className="space-y-6">
            {!hasJobs ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center max-w-xl mx-auto my-8">
                    <div className="size-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="size-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                        No Applications Tracked Yet
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                        Add job applications to your Kanban board to start visualizing your conversion funnel (Applied ➔ Interviews ➔ Offers), track conversion velocity, and export backups.
                    </p>
                    <div className="mt-6">
                        <Button
                            onClick={() => setActiveTab("board")}
                            className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-xs gap-1.5"
                        >
                            <LayoutGrid className="size-3.5" />
                            Go to Kanban Board
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">

                    <MetricKpiCards kpi={analytics.kpi} />


                    <ConversionFunnel analytics={analytics} />


                    <PipelineDistribution analytics={analytics} />


                    <ExportBackupCard />
                </div>
            )}
        </div>
    );
}

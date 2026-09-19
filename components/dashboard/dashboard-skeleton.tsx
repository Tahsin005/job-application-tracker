import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Calendar,
    CheckCircle2,
    Mic,
    Award,
    XCircle,
    LayoutGrid,
    TrendingUp,
    Download,
    Search,
    Zap,
    FileText,
    Plus,
} from "lucide-react";

interface SkeletonColumnConfig {
    name: string;
    color: string;
    icon: React.ReactNode;
    hasCard?: boolean;
}

const SKELETON_COLUMNS: SkeletonColumnConfig[] = [
    {
        name: "Wish List",
        color: "bg-cyan-500",
        icon: <Calendar className="h-4 w-4" />,
    },
    {
        name: "Applied",
        color: "bg-purple-500",
        icon: <CheckCircle2 className="h-4 w-4" />,
        hasCard: true,
    },
    {
        name: "Interviewing",
        color: "bg-green-500",
        icon: <Mic className="h-4 w-4" />,
    },
    {
        name: "Offer",
        color: "bg-yellow-500",
        icon: <Award className="h-4 w-4" />,
    },
    {
        name: "Rejected",
        color: "bg-red-500",
        icon: <XCircle className="h-4 w-4" />,
    },
];

export function KanbanColumnsSkeleton() {
    return (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
            {SKELETON_COLUMNS.map((col, idx) => (
                <Card
                    key={idx}
                    className="min-w-[300px] w-[300px] flex-shrink-0 shadow-md p-0 overflow-hidden border-slate-200"
                >
                    <CardHeader
                        className={`${col.color} text-white rounded-t-lg pb-3 pt-3`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {col.icon}
                                <span className="text-white text-base font-semibold">
                                    {col.name}
                                </span>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                                {col.hasCard ? "1" : "0"}
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-4 bg-gray-50/50 min-h-[420px] rounded-b-lg p-3">
                        {col.hasCard && (
                            <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-2.5 shadow-xs">

                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1.5 flex-1">
                                        <Skeleton className="h-4 w-3/4 rounded bg-slate-200" />
                                        <Skeleton className="h-3 w-1/3 rounded bg-slate-100" />
                                    </div>
                                    <Skeleton className="size-4 rounded bg-slate-200 shrink-0" />
                                </div>


                                <div className="h-7 w-full rounded-lg bg-indigo-50/80 border border-indigo-100/90 flex items-center px-2.5 gap-2">
                                    <Calendar className="size-3 text-indigo-500 shrink-0" />
                                    <Skeleton className="h-3 w-1/2 rounded bg-indigo-200/60" />
                                </div>


                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <Skeleton className="h-4 w-16 rounded-full bg-emerald-100" />
                                    <Skeleton className="h-4 w-28 rounded-full bg-slate-100" />
                                </div>


                                <div className="space-y-1 pt-0.5">
                                    <Skeleton className="h-2.5 w-full rounded bg-slate-100" />
                                    <Skeleton className="h-2.5 w-4/5 rounded bg-slate-100" />
                                </div>


                                <div className="flex gap-1.5 pt-1">
                                    <Skeleton className="h-4 w-12 rounded bg-blue-100/80" />
                                    <Skeleton className="h-4 w-10 rounded bg-blue-100/80" />
                                </div>
                            </div>
                        )}


                        <div className="h-10 rounded-lg border-2 border-dashed border-slate-200 bg-white/60 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
                            <Plus className="size-3.5 text-slate-400" />
                            <span>Add Job</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-white" aria-busy="true" aria-label="Loading dashboard">
            <div className="container mx-auto p-4 sm:p-6 max-w-7xl">

                <div className="mb-4">
                    <h1 className="text-3xl font-bold text-black tracking-tight">Job Hunt</h1>
                    <p className="text-gray-600 text-sm">
                        Track your applications and interviews
                    </p>
                </div>


                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/80 w-fit">
                        <div className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-md bg-white text-slate-900 shadow-xs">
                            <LayoutGrid className="size-3.5 text-slate-700" />
                            <span>Board View</span>
                        </div>
                        <div className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-md text-slate-400">
                            <TrendingUp className="size-3.5 text-slate-400" />
                            <span>Analytics &amp; Funnel</span>
                            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-500 font-bold">
                                -
                            </span>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border border-slate-200 text-slate-400 bg-white shadow-2xs w-fit">
                        <Download className="size-3.5 text-slate-400" />
                        <span>Export Data</span>
                    </div>
                </div>


                <div className="space-y-4">
                    <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 xl:gap-4 max-w-full">

                        <div className="relative w-full xl:max-w-xs 2xl:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <div className="w-full h-9 pl-9 pr-3 rounded-md border border-slate-200 bg-white flex items-center shadow-xs">
                                <Skeleton className="h-3.5 w-44 bg-slate-200" />
                            </div>
                        </div>


                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full xl:w-auto justify-start xl:justify-end">

                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50/50 text-xs shadow-2xs w-full sm:w-auto overflow-hidden">
                                <div className="flex items-center gap-1 text-amber-700 font-semibold shrink-0">
                                    <Zap className="size-3.5 fill-amber-500 text-amber-500" />
                                    <span>AI Credits:</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <Skeleton className="h-5 w-20 rounded-full bg-emerald-100" />
                                    <Skeleton className="h-5 w-18 rounded-full bg-slate-200/80 hidden md:block" />
                                    <Skeleton className="h-5 w-20 rounded-full bg-slate-200/80 hidden lg:block" />
                                </div>
                                <div className="ml-auto pl-1">
                                    <div className="h-6 px-2.5 rounded-full bg-amber-500/80 text-white font-medium text-[11px] flex items-center gap-1">
                                        <Zap className="size-3" />
                                        <span>Top Up</span>
                                    </div>
                                </div>
                            </div>


                            <div className="flex items-center justify-center gap-1.5 h-9 sm:h-8 px-3 rounded-md border border-slate-200 bg-white text-slate-700 shadow-xs w-full sm:w-auto text-xs font-medium">
                                <FileText className="size-4 text-indigo-500" />
                                <span>Manage Resumes</span>
                            </div>
                        </div>
                    </div>


                    <KanbanColumnsSkeleton />
                </div>
            </div>
        </div>
    );
}

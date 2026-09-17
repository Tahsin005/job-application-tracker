"use client";

import { LayoutGrid, TrendingUp, Download, FileSpreadsheet, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth/auth-client";
import { useBoardFacade } from "@/lib/facades/useBoardFacade";

interface DashboardTabsProps {
    className?: string;
}

export default function DashboardTabs({ className = "" }: DashboardTabsProps) {
    const { data: session } = useSession();
    const { exportAsCSV, exportAsJSON, analytics, activeTab, setActiveTab } = useBoardFacade();
    const isAnalytics = activeTab === "analytics";

    return (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6 ${className}`}>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/80 w-fit">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("board")}
                    className={`h-8 px-3 text-xs font-semibold rounded-md transition-all gap-1.5 ${
                        !isAnalytics
                            ? "bg-white text-slate-900 shadow-xs hover:bg-white"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                >
                    <LayoutGrid className="size-3.5" />
                    Board View
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("analytics")}
                    className={`h-8 px-3 text-xs font-semibold rounded-md transition-all gap-1.5 ${
                        isAnalytics
                            ? "bg-white text-indigo-600 shadow-xs hover:bg-white"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                >
                    <TrendingUp className="size-3.5" />
                    Analytics & Funnel
                    {analytics.kpi.totalTracked > 0 && (
                        <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                            {analytics.kpi.totalTracked}
                        </span>
                    )}
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs font-medium border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs"
                        >
                            <Download className="size-3.5 text-slate-500" />
                            Export Data
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
                            Export & Backup
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => exportAsCSV()}
                            className="text-xs cursor-pointer gap-2 py-2"
                        >
                            <FileSpreadsheet className="size-4 text-emerald-600" />
                            <div className="flex flex-col">
                                <span className="font-semibold text-slate-900">Export as CSV</span>
                                <span className="text-[10px] text-slate-500">For Excel, Sheets, Notion</span>
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => exportAsJSON(session?.user)}
                            className="text-xs cursor-pointer gap-2 py-2"
                        >
                            <FileJson className="size-4 text-indigo-600" />
                            <div className="flex flex-col">
                                <span className="font-semibold text-slate-900">Export as JSON</span>
                                <span className="text-[10px] text-slate-500">Full structured backup</span>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

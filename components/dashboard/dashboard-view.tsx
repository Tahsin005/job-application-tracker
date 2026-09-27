"use client";

import { Board } from "@/lib/models/models.types";
import { useBoardFacade } from "@/lib/facades/useBoardFacade";
import DashboardTabs from "./dashboard-tabs";
import { KanbanColumnsSkeleton } from "./dashboard-skeleton";
import KanbanBoard from "@/components/kanban-board";
import dynamic from "next/dynamic";

const AnalyticsDashboard = dynamic(
    () => import("@/components/analytics/analytics-dashboard"),
    {
        ssr: false,
        loading: () => <KanbanColumnsSkeleton />,
    }
);

interface DashboardViewProps {
    initialBoard: Board | null;
    userId: string;
}

export default function DashboardView({ initialBoard, userId }: DashboardViewProps) {
    const { board, activeTab } = useBoardFacade(initialBoard);
    const currentBoard = board || initialBoard;

    return (
        <div className="min-h-screen py-6 sm:py-8 relative">
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                <div className="mb-6">
                    <div className="text-[11px] font-semibold tracking-[0.18em] text-primary mb-1">
                        Career Pipeline
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                        Job Hunt
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Track your applications, benchmark ATS scores, and manage interview rounds
                    </p>
                </div>

                <DashboardTabs />

                {activeTab === "board" ? (
                    currentBoard ? (
                        <KanbanBoard board={currentBoard} userId={userId} />
                    ) : (
                        <KanbanColumnsSkeleton />
                    )
                ) : (
                    <AnalyticsDashboard initialBoard={currentBoard} />
                )}
            </div>
        </div>
    );
}

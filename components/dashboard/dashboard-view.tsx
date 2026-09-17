"use client";

import { Board } from "@/lib/models/models.types";
import { useBoardFacade } from "@/lib/facades/useBoardFacade";
import DashboardTabs from "./dashboard-tabs";
import KanbanBoard from "@/components/kanban-board";
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard";

interface DashboardViewProps {
    initialBoard: Board | null;
    userId: string;
}

export default function DashboardView({ initialBoard, userId }: DashboardViewProps) {
    const { board, activeTab } = useBoardFacade(initialBoard);
    const currentBoard = board || initialBoard;

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
                <div className="mb-4">
                    <h1 className="text-3xl font-bold text-black">Job Hunt</h1>
                    <p className="text-gray-600 text-sm">
                        Track your applications and interviews
                    </p>
                </div>

                <DashboardTabs />

                {activeTab === "board" ? (
                    currentBoard ? (
                        <KanbanBoard board={currentBoard} userId={userId} />
                    ) : (
                        <div className="p-8 text-center text-slate-500">Loading board...</div>
                    )
                ) : (
                    <AnalyticsDashboard initialBoard={currentBoard} />
                )}
            </div>
        </div>
    );
}

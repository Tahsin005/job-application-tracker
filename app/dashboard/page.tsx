import DashboardView from "@/components/dashboard/dashboard-view";
import DashboardSkeleton from "@/components/dashboard/dashboard-skeleton";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board } from "@/lib/models";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function getBoard(userId: string) {
    await connectDB();

    const boardDoc = await Board.findOne({
        userId: userId,
        name: "Job Hunt",
    }).populate({
        path: "columns",
        populate: {
            path: "jobApplications",
        },
    });

    if (!boardDoc) return null;

    const board = JSON.parse(JSON.stringify(boardDoc));

    return board;
}

async function DashboardPage() {
    const session = await getSession();

    if (!session?.user) {
        redirect("/sign-in");
    }

    const board = await getBoard(session.user.id);

    return <DashboardView initialBoard={board} userId={session.user.id} />;
}

export default async function Dashboard() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardPage />
        </Suspense>
    );
}

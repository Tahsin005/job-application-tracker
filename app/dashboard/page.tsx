import DashboardView from "@/components/dashboard/dashboard-view";
import DashboardSkeleton from "@/components/dashboard/dashboard-skeleton";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board } from "@/lib/models";
import { redirect } from "next/navigation";
import { Suspense, cache } from "react";

const getBoard = cache(async (userId: string) => {
    await connectDB();

    const boardDoc = await Board.findOne({
        userId: userId,
        name: "Job Hunt",
    })
        .populate({
            path: "columns",
            options: { sort: { order: 1 } },
            populate: {
                path: "jobApplications",
                options: { sort: { order: 1 } },
            },
        })
        .lean();

    if (!boardDoc) return null;

    return JSON.parse(JSON.stringify(boardDoc));
});

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

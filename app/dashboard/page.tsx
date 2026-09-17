import DashboardView from "@/components/dashboard/dashboard-view";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board } from "@/lib/models";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function getBoard(userId: string) {
    "use cache";

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
        <Suspense fallback={
            <div className="min-h-screen bg-white">
                <div className="container mx-auto p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-black">Loading...</h1>
                    </div>
                </div>
            </div>
        }>
            <DashboardPage />
        </Suspense>
    );
}

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAiJobStatus, AiTaskType } from "@/lib/upstash/redis";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { JobApplication } from "@/lib/models";

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    const type = searchParams.get("type") as AiTaskType | null;

    if (!jobId || !type) {
        return NextResponse.json(
            { error: "jobId and type query parameters are required" },
            { status: 400 }
        );
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return NextResponse.json({ error: "Invalid jobId" }, { status: 400 });
    }

    const status = await getAiJobStatus(type, jobId);

    // Fast path: if Redis contains status with verified userId, return immediately without touching MongoDB
    if (status && status.userId) {
        if (status.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        return NextResponse.json({
            data: status,
        });
    }

    // Fallback path: if Redis key expired or userId is absent, verify ownership in MongoDB
    await connectDB();
    const owns = await JobApplication.exists({ _id: jobId, userId: session.user.id });
    if (!owns) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
        data: status || { status: "idle" },
    });
}

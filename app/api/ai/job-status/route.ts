import { NextRequest, NextResponse } from "next/server";
import { getAiJobStatus, AiTaskType } from "@/lib/upstash/redis";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    const type = searchParams.get("type") as AiTaskType | null;

    if (!jobId || !type) {
        return NextResponse.json(
            { error: "jobId and type query parameters are required" },
            { status: 400 }
        );
    }

    const status = await getAiJobStatus(type, jobId);

    return NextResponse.json({
        data: status || { status: "idle" },
    });
}

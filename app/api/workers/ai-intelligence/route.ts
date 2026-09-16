import { NextRequest, NextResponse } from "next/server";
import { qstashReceiver, AiTaskPayload } from "@/lib/upstash/qstash";
import { processAiTask } from "@/lib/ai/ai-processor";

export const maxDuration = 60; // Max allowed serverless duration on Vercel

export async function POST(req: NextRequest) {
    try {
        const bodyText = await req.text();

        // If QStash receiver keys are configured, verify the signature
        if (qstashReceiver && process.env.NODE_ENV === "production") {
            const signature = req.headers.get("upstash-signature");
            if (!signature) {
                return NextResponse.json(
                    { error: "Missing Upstash signature" },
                    { status: 401 }
                );
            }

            const isValid = await qstashReceiver.verify({
                signature,
                body: bodyText,
            });

            if (!isValid) {
                return NextResponse.json(
                    { error: "Invalid signature" },
                    { status: 401 }
                );
            }
        }

        const payload = JSON.parse(bodyText) as AiTaskPayload;

        if (!payload.jobId || !payload.type || !payload.userId) {
            return NextResponse.json(
                { error: "Invalid task payload" },
                { status: 400 }
            );
        }

        const result = await processAiTask(payload);

        return NextResponse.json(result);
    } catch (err: unknown) {
        console.error("Worker error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Internal worker error" },
            { status: 500 }
        );
    }
}

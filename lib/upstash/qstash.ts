import { Client, Receiver } from "@upstash/qstash";
import { AiTaskType } from "./redis";

const qstashToken = process.env.QSTASH_TOKEN;
const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY || "";
const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY || "";

export const qstashClient = qstashToken
    ? new Client({
        token: qstashToken,
    })
    : null;

export const qstashReceiver =
    currentSigningKey && nextSigningKey
        ? new Receiver({
            currentSigningKey,
            nextSigningKey,
        })
        : null;

export interface AiTaskPayload {
    type: AiTaskType;
    jobId: string;
    resumeId?: string;
    userId: string;
}

export function getWorkerUrl(): string {
    const baseUrl =
        process.env.BETTER_AUTH_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    return `${baseUrl.replace(/\/+$/, "")}/api/workers/ai-intelligence`;
}

export async function publishAiTask(
    payload: AiTaskPayload
): Promise<{ messageId?: string; mode: "qstash" | "direct" }> {
    const isDev = process.env.NODE_ENV === "development";
    const workerUrl = getWorkerUrl();

    // If in development or QStash is not configured, or worker URL is localhost (unreachable by QStash):
    if (isDev || !qstashClient || workerUrl.includes("localhost") || workerUrl.includes("127.0.0.1")) {
        return { mode: "direct" };
    }

    const res = await qstashClient.publishJSON({
        url: workerUrl,
        body: payload,
        retries: 3,
    });

    return { messageId: res.messageId, mode: "qstash" };
}

import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis =
    redisUrl && redisToken
        ? new Redis({
            url: redisUrl,
            token: redisToken,
        })
        : null;

export type AiTaskType = "atsScan" | "coverLetter" | "outreach" | "applicationEmail";

export type AiJobState = "queued" | "processing" | "completed" | "failed";

export interface AiJobStatus {
    status: AiJobState;
    type: AiTaskType;
    jobId: string;
    step?: string;
    error?: string;
    data?: unknown;
    updatedAt: number;
}

const STATUS_KEY_PREFIX = "ai:status";
const STATUS_TTL_SECONDS = 600; // 10 minutes

export function getAiStatusKey(type: AiTaskType, jobId: string): string {
    return `${STATUS_KEY_PREFIX}:${type}:${jobId}`;
}

export async function setAiJobStatus(
    type: AiTaskType,
    jobId: string,
    status: Omit<AiJobStatus, "type" | "jobId" | "updatedAt">
): Promise<void> {
    if (!redis) return;

    const key = getAiStatusKey(type, jobId);
    const payload: AiJobStatus = {
        ...status,
        type,
        jobId,
        updatedAt: Date.now(),
    };

    await redis.set(key, payload, { ex: STATUS_TTL_SECONDS });
}

export async function getAiJobStatus(
    type: AiTaskType,
    jobId: string
): Promise<AiJobStatus | null> {
    if (!redis) return null;

    const key = getAiStatusKey(type, jobId);
    const result = await redis.get<AiJobStatus>(key);
    return result || null;
}

export async function clearAiJobStatus(
    type: AiTaskType,
    jobId: string
): Promise<void> {
    if (!redis) return;

    const key = getAiStatusKey(type, jobId);
    await redis.del(key);
}

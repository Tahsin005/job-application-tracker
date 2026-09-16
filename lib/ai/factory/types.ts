import { AiProviderType } from "@/lib/models/models.types";

export interface AiChatMessage {
    role: "system" | "user" | "assistant" | string;
    content: string;
}

export interface AiChatOptions {
    maxTokens?: number;
    modelOverride?: string;
}

export interface AiTestResult {
    success: boolean;
    latencyMs: number;
    message: string;
    modelOutput?: string;
}

export interface AiProviderConfig {
    name?: string;
    provider: AiProviderType;
    baseUrl?: string;
    apiKey?: string;
    model: string;
    customHeaders?: Record<string, string>;
    [key: string]: unknown;
}

export interface IAiProvider {
    readonly config: AiProviderConfig;
    chat(messages: AiChatMessage[], options?: AiChatOptions): Promise<string>;
    testConnection(): Promise<AiTestResult>;
}

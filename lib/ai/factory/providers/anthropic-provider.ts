import {
    IAiProvider,
    AiProviderConfig,
    AiChatMessage,
    AiChatOptions,
    AiTestResult,
} from "../types";

export class AnthropicProvider implements IAiProvider {
    readonly config: AiProviderConfig;

    constructor(config: AiProviderConfig) {
        this.config = config;
    }

    private getEndpoint(): string {
        const cleanBase = (
            this.config.baseUrl?.trim() || "https://api.anthropic.com"
        ).replace(/\/+$/, "");
        if (cleanBase.endsWith("/v1/messages")) {
            return cleanBase;
        }
        if (cleanBase.endsWith("/v1")) {
            return `${cleanBase}/messages`;
        }
        return `${cleanBase}/v1/messages`;
    }

    async chat(messages: AiChatMessage[], options: AiChatOptions = {}): Promise<string> {
        const targetModel = options.modelOverride || this.config.model;
        const maxTokens = options.maxTokens ?? 4000;
        const endpoint = this.getEndpoint();

        // Anthropic requires system prompt to be passed as a top-level string
        const systemMessages = messages
            .filter((m) => m.role === "system")
            .map((m) => m.content)
            .join("\n\n");

        const conversationMessages = messages
            .filter((m) => m.role !== "system")
            .map((m) => ({
                role: m.role === "assistant" ? "assistant" : "user",
                content: m.content,
            }));

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "x-api-key": this.config.apiKey?.trim() || "",
            "anthropic-version": "2023-06-01",
        };

        if (this.config.customHeaders) {
            Object.assign(headers, this.config.customHeaders);
        }

        const body: Record<string, unknown> = {
            model: targetModel,
            max_tokens: maxTokens,
            messages: conversationMessages,
        };

        if (systemMessages) {
            body.system = systemMessages;
        }

        const response = await fetch(endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(60000),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            throw new Error(
                `Anthropic API error (${response.status}): ${errorText || response.statusText}`
            );
        }

        const data = await response.json();
        const textBlock = data.content?.find(
            (c: { type: string; text?: string }) => c.type === "text"
        );
        const text = textBlock?.text || "";

        if (!text) {
            throw new Error("Received empty response from Anthropic model.");
        }

        return text;
    }

    async testConnection(): Promise<AiTestResult> {
        const start = performance.now();
        try {
            const output = await this.chat(
                [
                    {
                        role: "user",
                        content: "Respond with the word 'PONG' and nothing else.",
                    },
                ],
                { maxTokens: 20 }
            );

            const latencyMs = Math.round(performance.now() - start);
            return {
                success: true,
                latencyMs,
                message: "Anthropic connection verified successfully.",
                modelOutput: output.trim(),
            };
        } catch (err: unknown) {
            const latencyMs = Math.round(performance.now() - start);
            const msg = err instanceof Error ? err.message : String(err);
            return {
                success: false,
                latencyMs,
                message: msg,
            };
        }
    }
}

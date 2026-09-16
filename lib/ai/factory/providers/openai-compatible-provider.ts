import {
    IAiProvider,
    AiProviderConfig,
    AiChatMessage,
    AiChatOptions,
    AiTestResult,
} from "../types";

export class OpenAiCompatibleProvider implements IAiProvider {
    readonly config: AiProviderConfig;

    constructor(config: AiProviderConfig) {
        this.config = config;
    }

    private getEndpoint(): string {
        let fallbackBase = "https://api.openai.com/v1";
        if (this.config.provider === "agentrouter") {
            fallbackBase = "https://agentrouter.org/v1";
        } else if (this.config.provider === "groq") {
            fallbackBase = "https://api.groq.com/openai/v1";
        }

        const cleanBase = (this.config.baseUrl?.trim() || fallbackBase).replace(/\/+$/, "");
        if (cleanBase.endsWith("/chat/completions")) {
            return cleanBase;
        }
        return `${cleanBase}/chat/completions`;
    }

    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            Connection: "close",
        };

        if (this.config.apiKey?.trim()) {
            headers.Authorization = `Bearer ${this.config.apiKey.trim()}`;
        }

        // For AgentRouter or when explicitly required, inject User-Agent to bypass Alibaba/Cloudflare WAF challenges
        if (
            this.config.provider === "agentrouter" ||
            (this.config.baseUrl && this.config.baseUrl.includes("agentrouter"))
        ) {
            headers["User-Agent"] = "Kilo-Code/5.3.0";
        }

        if (this.config.customHeaders) {
            Object.assign(headers, this.config.customHeaders);
        }

        return headers;
    }

    async chat(
        messages: AiChatMessage[],
        options: AiChatOptions = {},
        retryCount = 0
    ): Promise<string> {
        const targetModel = options.modelOverride || this.config.model;
        const maxTokens = options.maxTokens ?? 4000;
        const endpoint = this.getEndpoint();
        const headers = this.getHeaders();

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    model: targetModel,
                    messages,
                    max_tokens: maxTokens,
                }),
                signal: AbortSignal.timeout(60000),
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => "");

                // Auto-fallback on AgentRouter if channel is down
                if (
                    this.config.provider === "agentrouter" &&
                    (response.status === 503 ||
                        response.status === 402 ||
                        errorText.includes("无可用渠道") ||
                        errorText.includes("exhausted")) &&
                    targetModel !== "deepseek-v4-flash"
                ) {
                    console.warn(
                        `Model ${targetModel} unavailable on AgentRouter (${response.status}). Falling back to deepseek-v4-flash...`
                    );
                    return this.chat(
                        messages,
                        { ...options, modelOverride: "deepseek-v4-flash" },
                        retryCount
                    );
                }

                throw new Error(
                    `API error (${response.status}): ${errorText || response.statusText}`
                );
            }

            const data = await response.json();

            if (data.error) {
                if (
                    this.config.provider === "agentrouter" &&
                    (data.error.message?.includes("无可用渠道") ||
                        data.error.message?.includes("exhausted")) &&
                    targetModel !== "deepseek-v4-flash"
                ) {
                    console.warn(
                        `Model ${targetModel} channel unavailable. Falling back to deepseek-v4-flash...`
                    );
                    return this.chat(
                        messages,
                        { ...options, modelOverride: "deepseek-v4-flash" },
                        retryCount
                    );
                }
                throw new Error(
                    `Provider error: ${data.error.message || JSON.stringify(data.error)}`
                );
            }

            const choice = data.choices?.[0];
            const content = choice?.message?.content || "";

            if (!content) {
                if (choice?.finish_reason === "length") {
                    throw new Error(
                        "Model response exceeded token limit during generation."
                    );
                }
                throw new Error("Received empty response from AI model.");
            }

            return content;
        } catch (err: unknown) {
            if (retryCount < 2) {
                const errString = String(err);
                const causeString =
                    err && typeof err === "object" && "cause" in err
                        ? String((err as { cause: unknown }).cause)
                        : "";
                const isNetworkError =
                    err instanceof Error &&
                    (err.name === "TimeoutError" ||
                        err.name === "AbortError" ||
                        err.message.toLowerCase().includes("fetch failed") ||
                        err.message.toLowerCase().includes("connect") ||
                        err.message.toLowerCase().includes("timeout") ||
                        err.message.toLowerCase().includes("econnreset") ||
                        errString.toLowerCase().includes("fetch failed") ||
                        causeString.toLowerCase().includes("timeout") ||
                        causeString.toLowerCase().includes("connect"));

                if (isNetworkError) {
                    console.warn(
                        `Network glitch (${(err as Error).message || errString}). Retrying in 1.5s (attempt ${retryCount + 1}/2)...`
                    );
                    await new Promise((resolve) => setTimeout(resolve, 1500));
                    return this.chat(messages, options, retryCount + 1);
                }
            }
            throw err;
        }
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
                message: "Connection verified successfully.",
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

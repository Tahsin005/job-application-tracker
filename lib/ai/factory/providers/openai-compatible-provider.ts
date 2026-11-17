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

    private isResponsesModel(model: string): boolean {
        return (
            model.includes("sol") ||
            model.startsWith("gpt-6") ||
            model.startsWith("gpt-5")
        );
    }

    private async callResponsesApi(
        messages: AiChatMessage[],
        targetModel: string,
        maxTokens: number,
        headers: Record<string, string>
    ): Promise<string> {
        let fallbackBase = "https://agentrouter.org/v1";
        if (this.config.provider === "agentrouter") {
            fallbackBase = "https://agentrouter.org/v1";
        }
        const cleanBase = (this.config.baseUrl?.trim() || fallbackBase).replace(/\/+$/, "");
        const responsesEndpoint = cleanBase.replace(/\/chat\/completions$/, "") + "/responses";

        const payload: Record<string, unknown> = {
            model: targetModel,
            input: messages,
            // Reasoning tokens count against max_output_tokens in the Responses API.
            // Ensure ample headroom (16k) so reasoning does not starve and truncate the JSON.
            max_output_tokens: Math.max(maxTokens, 16000),
        };

        if (targetModel.includes("sol")) {
            payload.reasoning = { effort: "low" };
        }

        const response = await fetch(responsesEndpoint, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(180000),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            throw new Error(`API error (${response.status}): ${errorText || response.statusText}`);
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(`Provider error: ${data.error.message || JSON.stringify(data.error)}`);
        }

        const messageObj = data.output?.find((item: { type: string }) => item.type === "message");
        let text = "";
        if (messageObj && Array.isArray(messageObj.content)) {
            for (const part of messageObj.content) {
                if (part.type === "output_text" && part.text) {
                    text += part.text;
                }
            }
        }

        if (!text) {
            throw new Error("Received empty response from AI model responses endpoint.");
        }

        return text;
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

        // Direct dispatch to /v1/responses for models requiring OpenAI Responses API
        if (this.isResponsesModel(targetModel)) {
            try {
                return await this.callResponsesApi(messages, targetModel, maxTokens, headers);
            } catch (err: unknown) {
                if (
                    targetModel === "gpt-6.1-sol" &&
                    (this.config.provider === "agentrouter" ||
                        (this.config.baseUrl && this.config.baseUrl.includes("agentrouter")))
                ) {
                    console.warn(
                        `Model gpt-6.1-sol failed (${err instanceof Error ? err.message : String(err)}). Falling back to gpt-5.6-sol...`
                    );
                    return this.callResponsesApi(messages, "gpt-5.6-sol", maxTokens, headers);
                }
                throw err;
            }
        }

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    model: targetModel,
                    messages,
                    max_tokens: maxTokens,
                }),
                signal: AbortSignal.timeout(180000),
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => "");

                // Auto-redirect to /v1/responses if provider indicates it's required
                if (
                    errorText.includes("/v1/responses") ||
                    errorText.includes("Responses API")
                ) {
                    return this.callResponsesApi(messages, targetModel, maxTokens, headers);
                }

                // Auto-fallback on AgentRouter if channel is down
                const isAgentRouter =
                    this.config.provider === "agentrouter" ||
                    (this.config.baseUrl && this.config.baseUrl.includes("agentrouter"));
                if (
                    isAgentRouter &&
                    (response.status === 503 ||
                        response.status === 402 ||
                        errorText.includes("无可用渠道") ||
                        errorText.includes("exhausted")) &&
                    targetModel === "gpt-6.1-sol"
                ) {
                    console.warn(
                        `Model ${targetModel} unavailable on AgentRouter (${response.status}). Falling back to gpt-5.6-sol...`
                    );
                    return this.chat(
                        messages,
                        { ...options, modelOverride: "gpt-5.6-sol" },
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
                    data.error.message?.includes("/v1/responses") ||
                    data.error.message?.includes("Responses API")
                ) {
                    return this.callResponsesApi(messages, targetModel, maxTokens, headers);
                }

                const isAgentRouter =
                    this.config.provider === "agentrouter" ||
                    (this.config.baseUrl && this.config.baseUrl.includes("agentrouter"));
                if (
                    isAgentRouter &&
                    (data.error.message?.includes("无可用渠道") ||
                        data.error.message?.includes("exhausted")) &&
                    targetModel === "gpt-6.1-sol"
                ) {
                    console.warn(
                        `Model ${targetModel} channel unavailable. Falling back to gpt-5.6-sol...`
                    );
                    return this.chat(
                        messages,
                        { ...options, modelOverride: "gpt-5.6-sol" },
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

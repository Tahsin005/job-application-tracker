import {
    IAiProvider,
    AiProviderConfig,
    AiChatMessage,
    AiChatOptions,
    AiTestResult,
} from "../types";

export class GeminiProvider implements IAiProvider {
    readonly config: AiProviderConfig;

    constructor(config: AiProviderConfig) {
        this.config = config;
    }

    private getEndpoint(model: string): string {
        const cleanBase = (
            this.config.baseUrl?.trim() ||
            "https://generativelanguage.googleapis.com/v1beta"
        ).replace(/\/+$/, "");

        const apiKey = encodeURIComponent(this.config.apiKey?.trim() || "");
        const cleanModel = encodeURIComponent(model.trim());

        return `${cleanBase}/models/${cleanModel}:generateContent?key=${apiKey}`;
    }

    async chat(messages: AiChatMessage[], options: AiChatOptions = {}): Promise<string> {
        const targetModel = options.modelOverride || this.config.model;
        const endpoint = this.getEndpoint(targetModel);

        const systemMessages = messages
            .filter((m) => m.role === "system")
            .map((m) => m.content)
            .join("\n\n");

        const contents = messages
            .filter((m) => m.role !== "system")
            .map((m) => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
            }));

        const body: Record<string, unknown> = {
            contents,
            generationConfig: {
                maxOutputTokens: options.maxTokens ?? 4000,
            },
        };

        if (systemMessages) {
            body.system_instruction = {
                parts: [{ text: systemMessages }],
            };
        }

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": this.config.apiKey?.trim() || "",
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(60000),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            throw new Error(
                `Gemini API error (${response.status}): ${errorText || response.statusText}`
            );
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(`Gemini error: ${data.error.message || JSON.stringify(data.error)}`);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (!text) {
            throw new Error("Received empty response from Gemini model.");
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
                message: "Gemini connection verified successfully.",
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

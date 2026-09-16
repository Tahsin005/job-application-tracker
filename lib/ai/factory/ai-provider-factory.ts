import connectDB from "@/lib/db";
import { AiConfig as AiConfigModel } from "@/lib/models";
import { IAiProvider, AiProviderConfig } from "./types";
import { OpenAiCompatibleProvider } from "./providers/openai-compatible-provider";
import { AnthropicProvider } from "./providers/anthropic-provider";
import { GeminiProvider } from "./providers/gemini-provider";

export class AiProviderFactory {
    /**
     * Factory method: Instantiates the appropriate provider adapter
     * based on the provider configuration.
     */
    static createProvider(config: AiProviderConfig): IAiProvider {
        switch (config.provider) {
            case "anthropic":
                return new AnthropicProvider(config);
            case "gemini":
                return new GeminiProvider(config);
            case "agentrouter":
            case "openai":
            case "groq":
            case "custom":
            default:
                return new OpenAiCompatibleProvider(config);
        }
    }

    /**
     * Resolves the active AI configuration.
     * Checks MongoDB for a default active config. If none exists,
     * seamlessly falls back to environment variables (.env).
     */
    static async getActiveConfig(): Promise<{
        config: AiProviderConfig;
        isEnvFallback: boolean;
        configId?: string;
    }> {
        try {
            await connectDB();
            const dbConfig = await AiConfigModel.findOne({
                isDefault: true,
                isActive: true,
            }).lean();

            if (dbConfig && dbConfig.model) {
                const rest = { ...(dbConfig as unknown as Record<string, unknown>) };
                delete rest._id;
                delete rest.__v;
                return {
                    config: {
                        ...rest,
                        name: dbConfig.name,
                        provider: dbConfig.provider,
                        baseUrl: dbConfig.baseUrl || "",
                        apiKey: dbConfig.apiKey || "",
                        model: dbConfig.model,
                        customHeaders: dbConfig.customHeaders,
                    },
                    isEnvFallback: false,
                    configId: String(dbConfig._id),
                };
            }

            // If no default, check if any active config exists in DB
            const anyActive = await AiConfigModel.findOne({ isActive: true }).lean();
            if (anyActive && anyActive.model) {
                const rest = { ...(anyActive as unknown as Record<string, unknown>) };
                delete rest._id;
                delete rest.__v;
                return {
                    config: {
                        ...rest,
                        name: anyActive.name,
                        provider: anyActive.provider,
                        baseUrl: anyActive.baseUrl || "",
                        apiKey: anyActive.apiKey || "",
                        model: anyActive.model,
                        customHeaders: anyActive.customHeaders,
                    },
                    isEnvFallback: false,
                    configId: String(anyActive._id),
                };
            }
        } catch (dbErr) {
            console.warn(
                "Could not load AI config from database, using .env fallback:",
                dbErr
            );
        }

        // Graceful .env fallback
        const envApiKey = process.env.AGENTROUTER_API_KEY || "";
        const envBaseUrl =
            process.env.AGENTROUTER_BASE_URL || "https://agentrouter.org/v1";
        const envModel = process.env.AGENTROUTER_MODEL || "deepseek-v4-flash";

        return {
            config: {
                name: "Environment Default (.env)",
                provider: "agentrouter",
                baseUrl: envBaseUrl,
                apiKey: envApiKey,
                model: envModel,
            },
            isEnvFallback: true,
        };
    }

    /**
     * Returns an active IAiProvider instance ready for chat execution.
     */
    static async getActiveProvider(): Promise<IAiProvider> {
        const { config } = await this.getActiveConfig();
        return this.createProvider(config);
    }
}

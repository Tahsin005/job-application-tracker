import { AiProviderFactory } from "./factory/ai-provider-factory";
import { getEffectivePrompt, interpolatePrompt } from "./prompts/default-prompts";

export interface AtsAnalysisResult {
    matchScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    actionVerbRecommendations: string[];
    summary: string;
}

export function extractJsonFromAiResponse<T = Record<string, unknown>>(rawText: string): T {
    const text = (rawText || "").trim();

    // 1. Direct parse attempt
    try {
        return JSON.parse(text);
    } catch {}

    // 2. Markdown code block extraction (```json ... ``` or ``` ... ```)
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
        const candidate = codeBlockMatch[1].trim();
        try {
            return JSON.parse(candidate);
        } catch {}
    }

    // 3. Balanced brace extraction
    const firstBrace = text.indexOf("{");
    if (firstBrace !== -1) {
        let depth = 0;
        let inString = false;
        let escapeNext = false;
        let lastBrace = -1;

        for (let i = firstBrace; i < text.length; i++) {
            const char = text[i];
            if (escapeNext) {
                escapeNext = false;
                continue;
            }
            if (char === "\\") {
                escapeNext = true;
                continue;
            }
            if (char === '"') {
                inString = !inString;
                continue;
            }
            if (!inString) {
                if (char === "{") depth++;
                else if (char === "}") {
                    depth--;
                    if (depth === 0) {
                        lastBrace = i;
                        break;
                    }
                }
            }
        }

        if (lastBrace !== -1) {
            const candidate = text.slice(firstBrace, lastBrace + 1);
            try {
                return JSON.parse(candidate);
            } catch {
                try {
                    const sanitized = candidate
                        .replace(/,\s*([}\]])/g, "$1")
                        .replace(/[\x00-\x1F\x7F]/g, (c) =>
                            c === "\n" ? "\\n" : c === "\r" ? "\\r" : c === "\t" ? "\\t" : ""
                        );
                    return JSON.parse(sanitized);
                } catch {}
            }
        }
    }

    // 4. Fallback greedy regex
    const greedyMatch = text.match(/\{[\s\S]*\}/);
    if (greedyMatch) {
        try {
            return JSON.parse(greedyMatch[0]);
        } catch {
            const sanitized = greedyMatch[0]
                .replace(/,\s*([}\]])/g, "$1")
                .replace(/[\x00-\x1F\x7F]/g, (c) =>
                    c === "\n" ? "\\n" : c === "\r" ? "\\r" : c === "\t" ? "\\t" : ""
                );
            return JSON.parse(sanitized);
        }
    }

    console.error("Failed to parse JSON from AI response. Raw output was:", text);
    throw new Error("Failed to parse ATS analysis from AI response.");
}

async function callAiChat(
    messages: { role: string; content: string }[],
    maxTokens = 4000,
    modelOverride?: string
): Promise<string> {
    const provider = await AiProviderFactory.getActiveProvider();
    return provider.chat(messages, { maxTokens, modelOverride });
}

export async function analyzeAtsMatch({
    resumeText,
    jobTitle,
    company,
    jobDescription,
}: {
    resumeText: string;
    jobTitle: string;
    company: string;
    jobDescription: string;
}): Promise<AtsAnalysisResult> {
    const promptDef = await getEffectivePrompt("atsScan");
    const templateVars: Record<string, string> = {
        company: company || "Target Company",
        jobTitle: jobTitle || "Target Position",
        jobDescription:
            jobDescription ||
            "No detailed description provided. Evaluate based on position title and industry standard expectations.",
        resumeText: resumeText || "",
    };

    const systemPrompt = interpolatePrompt(promptDef.systemPrompt, templateVars);
    const userPrompt = interpolatePrompt(promptDef.userPromptTemplate, templateVars);

    const rawOutput = await callAiChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
    ]);

    const parsed = extractJsonFromAiResponse<Record<string, unknown>>(rawOutput);

    return {
        matchScore: Math.min(100, Math.max(0, Math.round(Number(parsed.matchScore) || 0))),
        matchedKeywords: Array.isArray(parsed.matchedKeywords) ? (parsed.matchedKeywords as string[]) : [],
        missingKeywords: Array.isArray(parsed.missingKeywords) ? (parsed.missingKeywords as string[]) : [],
        actionVerbRecommendations: Array.isArray(parsed.actionVerbRecommendations)
            ? (parsed.actionVerbRecommendations as string[])
            : [],
        summary: typeof parsed.summary === "string" ? parsed.summary : "Analysis completed.",
    };
}

export async function generateCoverLetter({
    resumeText,
    jobTitle,
    company,
    jobDescription,
}: {
    resumeText: string;
    jobTitle: string;
    company: string;
    jobDescription: string;
}): Promise<string> {
    const promptDef = await getEffectivePrompt("coverLetter");
    const templateVars: Record<string, string> = {
        company: company || "Target Company",
        jobTitle: jobTitle || "Target Position",
        jobDescription: jobDescription || "Standard role expectations for this position.",
        resumeText: resumeText || "",
    };

    const systemPrompt = interpolatePrompt(promptDef.systemPrompt, templateVars);
    const userPrompt = interpolatePrompt(promptDef.userPromptTemplate, templateVars);

    return await callAiChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
    ]);
}

export async function generateColdOutreachMessage({
    resumeText,
    jobTitle,
    company,
    jobDescription,
}: {
    resumeText: string;
    jobTitle: string;
    company: string;
    jobDescription: string;
}): Promise<string> {
    const promptDef = await getEffectivePrompt("outreach");
    const templateVars: Record<string, string> = {
        company: company || "Target Company",
        jobTitle: jobTitle || "Target Position",
        jobDescription: jobDescription || "Tech role",
        resumeText: resumeText || "",
    };

    const systemPrompt = interpolatePrompt(promptDef.systemPrompt, templateVars);
    const userPrompt = interpolatePrompt(promptDef.userPromptTemplate, templateVars);

    return await callAiChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
    ]);
}

export async function generateApplicationEmail({
    resumeText,
    jobTitle,
    company,
    jobDescription,
}: {
    resumeText: string;
    jobTitle: string;
    company: string;
    jobDescription: string;
}): Promise<string> {
    const promptDef = await getEffectivePrompt("applicationEmail");
    const templateVars: Record<string, string> = {
        company: company || "Target Company",
        jobTitle: jobTitle || "Target Position",
        jobDescription: jobDescription || "",
        resumeText: resumeText || "",
    };

    const systemPrompt = interpolatePrompt(promptDef.systemPrompt, templateVars);
    const userPrompt = interpolatePrompt(promptDef.userPromptTemplate, templateVars);

    return await callAiChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
    ]);
}

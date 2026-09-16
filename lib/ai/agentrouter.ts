import { AiProviderFactory } from "./factory/ai-provider-factory";
import { getEffectivePrompt, interpolatePrompt } from "./prompts/default-prompts";

export interface AtsAnalysisResult {
    matchScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    actionVerbRecommendations: string[];
    summary: string;
}

function stripJsonFences(text: string): string {
    let clean = text.trim();
    if (clean.startsWith("```json")) {
        clean = clean.slice(7);
    } else if (clean.startsWith("```")) {
        clean = clean.slice(3);
    }
    if (clean.endsWith("```")) {
        clean = clean.slice(0, -3);
    }
    return clean.trim();
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

    const cleaned = stripJsonFences(rawOutput);

    try {
        const parsed = JSON.parse(cleaned);
        return {
            matchScore: Math.min(100, Math.max(0, Math.round(Number(parsed.matchScore) || 0))),
            matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords : [],
            missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
            actionVerbRecommendations: Array.isArray(parsed.actionVerbRecommendations)
                ? parsed.actionVerbRecommendations
                : [],
            summary: typeof parsed.summary === "string" ? parsed.summary : "Analysis completed.",
        };
    } catch {
        // Fallback JSON extraction in case model included additional text
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                matchScore: Math.min(100, Math.max(0, Math.round(Number(parsed.matchScore) || 0))),
                matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords : [],
                missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
                actionVerbRecommendations: Array.isArray(parsed.actionVerbRecommendations)
                    ? parsed.actionVerbRecommendations
                    : [],
                summary: typeof parsed.summary === "string" ? parsed.summary : "Analysis completed.",
            };
        }
        throw new Error("Failed to parse ATS analysis from AI response.");
    }
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

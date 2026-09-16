export interface AtsAnalysisResult {
    matchScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    actionVerbRecommendations: string[];
    summary: string;
}

const AGENTROUTER_API_KEY = process.env.AGENTROUTER_API_KEY;
const AGENTROUTER_BASE_URL = process.env.AGENTROUTER_BASE_URL || "https://agentrouter.org/v1";
const AGENTROUTER_MODEL = process.env.AGENTROUTER_MODEL || "deepseek-v4-flash";

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

async function callAgentRouterChat(
    messages: { role: string; content: string }[],
    maxTokens = 4000,
    modelOverride?: string,
    retryCount = 0
): Promise<string> {
    if (!AGENTROUTER_API_KEY) {
        throw new Error("AGENTROUTER_API_KEY is not defined in environment variables.");
    }

    const targetModel = modelOverride || AGENTROUTER_MODEL;

    try {
        const response = await fetch(`${AGENTROUTER_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${AGENTROUTER_API_KEY}`,
                "User-Agent": "Kilo-Code/5.3.0",
                Connection: "close",
            },
            body: JSON.stringify({
                model: targetModel,
                messages,
                max_tokens: maxTokens,
            }),
            signal: AbortSignal.timeout(60000),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            // If channel is down/unavailable (503) or exhausted (402), automatically fallback to deepseek-v4-flash
            if (
                (response.status === 503 ||
                    response.status === 402 ||
                    errorText.includes("无可用渠道") ||
                    errorText.includes("exhausted")) &&
                targetModel !== "deepseek-v4-flash"
            ) {
                console.warn(
                    `Model ${targetModel} unavailable on AgentRouter (${response.status}). Automatically falling back to deepseek-v4-flash...`
                );
                return callAgentRouterChat(messages, maxTokens, "deepseek-v4-flash");
            }

            throw new Error(
                `AgentRouter API error (${response.status}): ${errorText || response.statusText}`
            );
        }

        const data = await response.json();

        if (data.error) {
            if (
                (data.error.message?.includes("无可用渠道") ||
                    data.error.message?.includes("exhausted")) &&
                targetModel !== "deepseek-v4-flash"
            ) {
                console.warn(
                    `Model ${targetModel} channel unavailable on AgentRouter. Automatically falling back to deepseek-v4-flash...`
                );
                return callAgentRouterChat(messages, maxTokens, "deepseek-v4-flash");
            }
            throw new Error(`AgentRouter error: ${data.error.message || JSON.stringify(data.error)}`);
        }

        const choice = data.choices?.[0];
        const content = choice?.message?.content || "";

        if (!content) {
            // In case of reasoning models with token limit truncation
            if (choice?.finish_reason === "length") {
                throw new Error(
                    "Model response exceeded token limit during reasoning. Please try again."
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
                    `AgentRouter network glitch (${(err as Error).message || errString}). Retrying in 1.5s (attempt ${retryCount + 1}/2)...`
                );
                await new Promise((resolve) => setTimeout(resolve, 1500));
                return callAgentRouterChat(messages, maxTokens, targetModel, retryCount + 1);
            }
        }
        throw err;
    }
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
    const systemPrompt = `You are an enterprise-grade Applicant Tracking System (ATS) parser and Senior Technical Recruiter.
Analyze the candidate's resume against the target job requirements.
Think concisely and directly before providing the JSON response.
Your output MUST be valid JSON and ONLY valid JSON matching this schema:
{
  "matchScore": number (integer between 0 and 100 representing keyword, skill, and seniority match),
  "matchedKeywords": string[] (top technical and domain skills present in BOTH the job description and the resume),
  "missingKeywords": string[] (critical skills, frameworks, certifications, or tools mentioned in the job description that are ABSENT or weak in the resume),
  "actionVerbRecommendations": string[] (3-5 specific, quantifiable bullet-point suggestions to elevate achievements, e.g. "Rephrase 'worked on API' to 'Architected REST APIs reducing latency by 35%'"),
  "summary": string (concise 2-3 sentence executive assessment of fit)
}
Be realistic and strict with the match score. Do not award high scores (>=80) unless core requirements and tech stack genuinely align.`;

    const userPrompt = `Target Company: ${company}
Target Position: ${jobTitle}

Job Description:
${jobDescription || "No detailed description provided. Evaluate based on position title and industry standard expectations."}

Candidate Resume:
${resumeText}

Provide your ATS analysis in valid JSON:`;

    const rawOutput = await callAgentRouterChat([
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
    const systemPrompt = `You are an executive career advisor and expert cover letter writer.
Think concisely and structure cleanly.
Write a tailored, highly persuasive 3-paragraph cover letter for the candidate applying to the specified position.

Structure:
- Paragraph 1: Direct hook expressing genuine enthusiasm for the role at ${company}, stating exact title, and a high-level value proposition.
- Paragraph 2: Direct connection between 2-3 specific accomplishments/skills from the resume and the core challenges or responsibilities in the job description. Quantify results where possible.
- Paragraph 3: Forward-looking closing reaffirming cultural alignment, enthusiasm to contribute, and a proactive call-to-action for an interview.

Rules:
- Professional, engaging, and confident tone.
- Do NOT use generic clichés like "I am writing to express my interest".
- Format cleanly with paragraph breaks. Do not include placeholders like "[Your Name]" or "[Date]" inside the body paragraphs; write the actual ready-to-use letter content.`;

    const userPrompt = `Company: ${company}
Position: ${jobTitle}

Job Description:
${jobDescription || "Standard role expectations for this position."}

Resume Highlights:
${resumeText}`;

    return await callAgentRouterChat([
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
    const systemPrompt = `You are a tech recruiter and networking strategist.
Think concisely and directly.
Write a concise, high-converting LinkedIn message or cold email (under 120-150 words) from the candidate to a hiring manager or recruiter at ${company}.

Structure:
- Friendly greeting and mention of the ${jobTitle} opening.
- 1-2 punchy bullet points demonstrating why candidate is an immediate impact match based on their resume highlights.
- Low-friction ask: a brief 10-minute introductory conversation.

Keep it human, respectful of their time, and direct.`;

    const userPrompt = `Company: ${company}
Position: ${jobTitle}

Job Context:
${jobDescription || "Tech role"}

Candidate Background:
${resumeText}`;

    return await callAgentRouterChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
    ]);
}

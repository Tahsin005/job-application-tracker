import connectDB from "@/lib/db";
import { AiPrompt as AiPromptModel } from "@/lib/models";

export type AiActionType = "atsScan" | "coverLetter" | "outreach";

export interface AiPromptDefinition {
    action: AiActionType;
    name: string;
    description: string;
    systemPrompt: string;
    userPromptTemplate: string;
    supportedVariables: { key: string; label: string }[];
}

export const DEFAULT_AI_PROMPTS: Record<AiActionType, AiPromptDefinition> = {
    atsScan: {
        action: "atsScan",
        name: "ATS Resume Scan & Match Analysis",
        description:
            "Evaluates candidate resume against target job description and returns structured JSON with match score and keyword analysis.",
        systemPrompt: `You are an enterprise-grade Applicant Tracking System (ATS) parser and Senior Technical Recruiter.
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
Be realistic and strict with the match score. Do not award high scores (>=80) unless core requirements and tech stack genuinely align.`,
        userPromptTemplate: `Target Company: {{company}}
Target Position: {{jobTitle}}

Job Description:
{{jobDescription}}

Candidate Resume:
{{resumeText}}

Provide your ATS analysis in valid JSON:`,
        supportedVariables: [
            { key: "{{company}}", label: "Target Company Name" },
            { key: "{{jobTitle}}", label: "Target Job Title / Position" },
            { key: "{{jobDescription}}", label: "Job Description Text" },
            { key: "{{resumeText}}", label: "Candidate Resume Text" },
        ],
    },
    coverLetter: {
        action: "coverLetter",
        name: "Tailored Cover Letter Generator",
        description:
            "Crafts a tailored, persuasive 3-paragraph cover letter highlighting candidate accomplishments and alignment.",
        systemPrompt: `You are an executive career advisor and expert cover letter writer.
Think concisely and structure cleanly.
Write a tailored, highly persuasive 3-paragraph cover letter for the candidate applying to the specified position.

Structure:
- Paragraph 1: Direct hook expressing genuine enthusiasm for the role at {{company}}, stating exact title, and a high-level value proposition.
- Paragraph 2: Direct connection between 2-3 specific accomplishments/skills from the resume and the core challenges or responsibilities in the job description. Quantify results where possible.
- Paragraph 3: Forward-looking closing reaffirming cultural alignment, enthusiasm to contribute, and a proactive call-to-action for an interview.

Rules:
- Professional, engaging, and confident tone.
- Do NOT use generic clichés like "I am writing to express my interest".
- Format cleanly with paragraph breaks. Do not include placeholders like "[Your Name]" or "[Date]" inside the body paragraphs; write the actual ready-to-use letter content.`,
        userPromptTemplate: `Company: {{company}}
Position: {{jobTitle}}

Job Description:
{{jobDescription}}

Resume Highlights:
{{resumeText}}`,
        supportedVariables: [
            { key: "{{company}}", label: "Target Company Name" },
            { key: "{{jobTitle}}", label: "Target Job Title / Position" },
            { key: "{{jobDescription}}", label: "Job Description Text" },
            { key: "{{resumeText}}", label: "Candidate Resume Text" },
        ],
    },
    outreach: {
        action: "outreach",
        name: "Cold Outreach / Networking Message",
        description:
            "Generates a high-converting, concise LinkedIn message or cold email under 150 words.",
        systemPrompt: `You are a tech recruiter and networking strategist.
Think concisely and directly.
Write a concise, high-converting LinkedIn message or cold email (under 120-150 words) from the candidate to a hiring manager or recruiter at {{company}}.

Structure:
- Friendly greeting and mention of the {{jobTitle}} opening.
- 1-2 punchy bullet points demonstrating why candidate is an immediate impact match based on their resume highlights.
- Low-friction ask: a brief 10-minute introductory conversation.

Keep it human, respectful of their time, and direct.`,
        userPromptTemplate: `Company: {{company}}
Position: {{jobTitle}}

Job Context:
{{jobDescription}}

Candidate Background:
{{resumeText}}`,
        supportedVariables: [
            { key: "{{company}}", label: "Target Company Name" },
            { key: "{{jobTitle}}", label: "Target Job Title / Position" },
            { key: "{{jobDescription}}", label: "Job Description Text" },
            { key: "{{resumeText}}", label: "Candidate Resume Text" },
        ],
    },
};

/**
 * Replaces all template variable instances like {{company}} or {{jobTitle}}
 * with provided runtime values.
 */
export function interpolatePrompt(
    template: string,
    vars: Record<string, string>
): string {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
        const safeKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // Replace both {{key}} and ${key} syntax
        const doubleBraceRegex = new RegExp(`\\{\\{\\s*${safeKey}\\s*\\}\\}`, "g");
        const dollarBraceRegex = new RegExp(`\\$\\{\\s*${safeKey}\\s*\\}`, "g");
        result = result
            .replace(doubleBraceRegex, () => value)
            .replace(dollarBraceRegex, () => value);
    }
    return result;
}

/**
 * Resolves the effective prompt for a given AI action.
 * First checks MongoDB for an admin-configured prompt.
 * If not configured or empty, seamlessly returns the codebase sane default.
 */
export async function getEffectivePrompt(action: AiActionType): Promise<{
    systemPrompt: string;
    userPromptTemplate: string;
    name: string;
    isCustomized: boolean;
}> {
    const defaultDef = DEFAULT_AI_PROMPTS[action];

    try {
        await connectDB();
        const dbPrompt = await AiPromptModel.findOne({ action }).lean();

        if (
            dbPrompt &&
            typeof dbPrompt.systemPrompt === "string" &&
            dbPrompt.systemPrompt.trim() &&
            typeof dbPrompt.userPromptTemplate === "string" &&
            dbPrompt.userPromptTemplate.trim()
        ) {
            return {
                systemPrompt: dbPrompt.systemPrompt.trim(),
                userPromptTemplate: dbPrompt.userPromptTemplate.trim(),
                name: dbPrompt.name || defaultDef.name,
                isCustomized: true,
            };
        }
    } catch (err) {
        console.warn(
            `Could not query database for prompt "${action}", falling back to codebase default:`,
            err
        );
    }

    return {
        systemPrompt: defaultDef.systemPrompt,
        userPromptTemplate: defaultDef.userPromptTemplate,
        name: defaultDef.name,
        isCustomized: false,
    };
}

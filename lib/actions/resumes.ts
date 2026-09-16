"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { Resume, JobApplication } from "../models";
import { createResumeSchema, CreateResumeInput } from "../validations/resume";
import { extractText } from "unpdf";

export async function getUserResumes() {
    const session = await getSession();

    if (!session?.user) {
        return {
            error: "Unauthorized",
            data: null,
        };
    }

    await connectDB();

    const resumes = await Resume.find({ userId: session.user.id })
        .sort({ isDefault: -1, updatedAt: -1 })
        .lean();

    return {
        error: null,
        data: JSON.parse(JSON.stringify(resumes)),
    };
}

export async function createResumeAction(input: CreateResumeInput) {
    const session = await getSession();

    if (!session?.user) {
        return {
            error: "Unauthorized",
            data: null,
        };
    }

    const validated = createResumeSchema.safeParse(input);
    if (!validated.success) {
        return {
            error: validated.error.errors[0]?.message || "Invalid resume input",
            data: null,
        };
    }

    await connectDB();

    const existingCount = await Resume.countDocuments({ userId: session.user.id });
    const shouldBeDefault = input.isDefault || existingCount === 0;

    if (shouldBeDefault) {
        await Resume.updateMany(
            { userId: session.user.id },
            { $set: { isDefault: false } }
        );
    }

    const newResume = await Resume.create({
        userId: session.user.id,
        name: validated.data.name,
        textContent: validated.data.textContent,
        fileData: validated.data.fileData || "",
        fileSize: validated.data.fileSize || 0,
        isDefault: shouldBeDefault,
    });

    revalidatePath("/dashboard");

    return {
        error: null,
        data: JSON.parse(JSON.stringify(newResume)),
    };
}

export async function setDefaultResumeAction(resumeId: string) {
    const session = await getSession();

    if (!session?.user) {
        return {
            error: "Unauthorized",
            success: false,
        };
    }

    await connectDB();

    const targetResume = await Resume.findOne({
        _id: resumeId,
        userId: session.user.id,
    });

    if (!targetResume) {
        return {
            error: "Resume not found",
            success: false,
        };
    }

    await Resume.updateMany(
        { userId: session.user.id },
        { $set: { isDefault: false } }
    );

    targetResume.isDefault = true;
    await targetResume.save();

    revalidatePath("/dashboard");

    return {
        error: null,
        success: true,
    };
}

export async function deleteResumeAction(resumeId: string) {
    const session = await getSession();

    if (!session?.user) {
        return {
            error: "Unauthorized",
            success: false,
        };
    }

    await connectDB();

    const targetResume = await Resume.findOne({
        _id: resumeId,
        userId: session.user.id,
    });

    if (!targetResume) {
        return {
            error: "Resume not found",
            success: false,
        };
    }

    const wasDefault = targetResume.isDefault;
    await Resume.deleteOne({ _id: resumeId });

    if (wasDefault) {
        const nextResume = await Resume.findOne({ userId: session.user.id }).sort({
            updatedAt: -1,
        });
        if (nextResume) {
            nextResume.isDefault = true;
            await nextResume.save();
        }
    }

    revalidatePath("/dashboard");

    return {
        error: null,
        success: true,
    };
}

export async function attachResumeToJobAction({
    jobId,
    resumeId,
}: {
    jobId: string;
    resumeId: string;
}) {
    const session = await getSession();

    if (!session?.user) {
        return {
            error: "Unauthorized",
            data: null,
        };
    }

    await connectDB();

    const job = await JobApplication.findOne({
        _id: jobId,
        userId: session.user.id,
    });

    if (!job) {
        return {
            error: "Job application not found",
            data: null,
        };
    }

    const resume = await Resume.findOne({
        _id: resumeId,
        userId: session.user.id,
    });

    if (!resume) {
        return {
            error: "Resume not found",
            data: null,
        };
    }

    job.resumeId = resume._id;
    job.attachedResumeName = resume.name;
    await job.save();

    revalidatePath("/dashboard");

    return {
        error: null,
        data: JSON.parse(JSON.stringify(job)),
    };
}

export async function parsePdfResumeAction(formData: FormData) {
    const session = await getSession();

    if (!session?.user) {
        return {
            error: "Unauthorized",
            data: null,
        };
    }

    const file = formData.get("file") as File | null;
    if (!file) {
        return {
            error: "No file provided",
            data: null,
        };
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        return {
            error: "Only PDF files are supported for auto-extraction. You can also paste text directly.",
            data: null,
        };
    }

    try {
        const arrayBuffer = await file.arrayBuffer();

        // Create base64 representation before unpdf's extractText transfers/detaches the buffer
        const buffer = Buffer.from(arrayBuffer.slice(0));
        const base64Data = `data:application/pdf;base64,${buffer.toString("base64")}`;

        // Pass an independent slice to extractText
        const { text } = await extractText(new Uint8Array(arrayBuffer.slice(0)));

        const extractedText = Array.isArray(text) ? text.join("\n\n") : text;
        const cleanedText = extractedText.trim();

        if (!cleanedText) {
            return {
                error: "Could not extract text from this PDF. It might be scanned or image-based. Please paste the resume text directly.",
                data: null,
            };
        }

        return {
            error: null,
            data: {
                name: file.name,
                size: file.size,
                textContent: cleanedText,
                fileData: base64Data,
            },
        };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to extract PDF text";
        return {
            error: message,
            data: null,
        };
    }
}

"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { getSession } from "../auth/auth";
import connectDB from "../db";
import { Resume, JobApplication } from "../models";
import {
    createResumeSchema,
    CreateResumeInput,
    updateResumeNameSchema,
    UpdateResumeNameInput,
} from "../validations/resume";
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

    // Fetch existing user resumes sorted by creation date ascending (oldest first)
    const existingResumes = await Resume.find({ userId: session.user.id })
        .sort({ createdAt: 1 })
        .exec();

    let wasEvictedDefault = false;

    // Strict max 3 limit: if existing >= 3, delete the earliest (oldest) resume(s)
    if (existingResumes.length >= 3) {
        const numToDelete = existingResumes.length - 3 + 1;
        const toDelete = existingResumes.slice(0, numToDelete);
        const toDeleteIds = toDelete.map((r) => r._id);

        wasEvictedDefault = toDelete.some((r) => r.isDefault);

        await Resume.deleteMany({ _id: { $in: toDeleteIds } });
    }

    const remainingCount = Math.max(
        0,
        existingResumes.length - (existingResumes.length >= 3 ? existingResumes.length - 3 + 1 : 0)
    );
    let shouldBeDefault = validated.data.isDefault || remainingCount === 0;

    if (wasEvictedDefault && !shouldBeDefault) {
        // If an evicted resume was default and the new one was not requested as default,
        // designate the most recent remaining resume as default
        const latestRemaining = await Resume.findOne({ userId: session.user.id }).sort({
            updatedAt: -1,
        });
        if (latestRemaining) {
            latestRemaining.isDefault = true;
            await latestRemaining.save();
        } else {
            shouldBeDefault = true;
        }
    }

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

export async function updateResumeNameAction(input: UpdateResumeNameInput) {
    const session = await getSession();

    if (!session?.user) {
        return {
            error: "Unauthorized",
            data: null,
        };
    }

    const validated = updateResumeNameSchema.safeParse(input);
    if (!validated.success) {
        return {
            error: validated.error.errors[0]?.message || "Invalid resume name input",
            data: null,
        };
    }

    if (!mongoose.Types.ObjectId.isValid(validated.data.resumeId)) {
        return {
            error: "Resume not found",
            data: null,
        };
    }

    await connectDB();

    const resume = await Resume.findOne({
        _id: validated.data.resumeId,
        userId: session.user.id,
    });

    if (!resume) {
        return {
            error: "Resume not found",
            data: null,
        };
    }

    resume.name = validated.data.name;
    await resume.save();

    // Synchronize attached resume name in job applications referencing this resume
    await JobApplication.updateMany(
        { userId: session.user.id, resumeId: resume._id },
        { $set: { attachedResumeName: validated.data.name } }
    );

    revalidatePath("/dashboard");

    return {
        error: null,
        data: JSON.parse(JSON.stringify(resume)),
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

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
        return {
            error: "Resume not found",
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

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
        return {
            error: "Resume not found",
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

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return {
            error: "Job application not found",
            data: null,
        };
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
        return {
            error: "Resume not found",
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

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

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

    if (file.size > MAX_RESUME_BYTES) {
        return {
            error: "PDF is too large. Please upload a file under 5 MB.",
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

import { Board, Column, JobApplication } from "@/lib/models/models.types";

function escapeCsvValue(val: unknown): string {
    if (val === null || val === undefined) return "";
    const str = String(val);
    // Neutralize spreadsheet formulas in exported CSV cells (CSV injection defense)
    const safeStr = /^\s*[=+\-@]/.test(str) ? `'${str}` : str;
    if (safeStr.includes(",") || safeStr.includes('"') || safeStr.includes("\n") || safeStr.includes("\r")) {
        return `"${safeStr.replace(/"/g, '""')}"`;
    }
    return safeStr;
}

function formatDate(val: string | Date | undefined): string {
    if (!val) return "";
    try {
        const d = new Date(val);
        return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
    } catch {
        return "";
    }
}

/**
 * Triggers a browser file download using a Blob and temporary link.
 */
function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Exports all job applications across columns to an Excel/Sheets-compatible CSV file.
 * Returns the total number of jobs exported.
 */
export function exportToCSV(columns: Column[] | undefined | null, filenamePrefix = "job-tracker-applications"): number {
    if (!columns || columns.length === 0) {
        throw new Error("No board data available to export");
    }

    const headers = [
        "Company",
        "Position",
        "Stage / Column",
        "Location",
        "Salary",
        "Job URL",
        "Applied Date",
        "Tags",
        "ATS Score (%)",
        "Attached Resume",
        "Notes",
        "Job Description",
        "Created At",
        "Updated At",
    ];

    const rows: string[][] = [];
    let jobCount = 0;

    for (const col of columns) {
        const jobs = col.jobApplications || [];
        for (const job of jobs) {
            jobCount++;
            rows.push([
                escapeCsvValue(job.company),
                escapeCsvValue(job.position),
                escapeCsvValue(col.name),
                escapeCsvValue(job.location || ""),
                escapeCsvValue(job.salary || ""),
                escapeCsvValue(job.jobUrl || ""),
                escapeCsvValue(formatDate(job.appliedDate)),
                escapeCsvValue(job.tags?.join(", ") || ""),
                escapeCsvValue(typeof job.atsAnalysis?.score === "number" ? job.atsAnalysis.score : ""),
                escapeCsvValue(job.attachedResumeName || ""),
                escapeCsvValue(job.notes || ""),
                escapeCsvValue(job.description || ""),
                escapeCsvValue(formatDate(job.createdAt)),
                escapeCsvValue(formatDate(job.updatedAt)),
            ]);
        }
    }

    const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
    ].join("\r\n");

    // Prepend UTF-8 BOM (\uFEFF) so Excel and spreadsheet tools open UTF-8 without garbled characters
    const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
    });

    const dateStr = new Date().toISOString().split("T")[0];
    downloadBlob(blob, `${filenamePrefix}-${dateStr}.csv`);

    return jobCount;
}

/**
 * Exports the complete board and all nested job applications as a structured JSON backup.
 * Returns the total number of jobs exported.
 */
export function exportToJSON(
    board: Board | undefined | null,
    user?: { name?: string; email?: string } | null,
    filenamePrefix = "job-tracker-backup"
): number {
    if (!board || !board.columns) {
        throw new Error("No board data available to export");
    }

    const allJobs: (JobApplication & { columnTitle?: string })[] = [];
    for (const col of board.columns) {
        for (const job of col.jobApplications || []) {
            allJobs.push({
                ...job,
                columnTitle: col.name,
            });
        }
    }

    const exportPayload = {
        version: "1.0",
        exportType: "job-application-tracker-backup",
        exportedAt: new Date().toISOString(),
        user: user
            ? {
                  name: user.name,
                  email: user.email,
              }
            : undefined,
        summary: {
            boardName: board.name,
            totalColumns: board.columns.length,
            totalApplications: allJobs.length,
        },
        columns: board.columns.map((col) => ({
            id: col._id,
            name: col.name,
            order: col.order,
            jobsCount: col.jobApplications?.length || 0,
        })),
        applications: allJobs,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: "application/json;charset=utf-8;",
    });

    const dateStr = new Date().toISOString().split("T")[0];
    downloadBlob(blob, `${filenamePrefix}-${dateStr}.json`);

    return allJobs.length;
}

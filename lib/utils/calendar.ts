import { InterviewRound } from "../models/models.types";

export interface CalendarEventPayload {
    title: string;
    start: Date | string;
    durationMinutes?: number;
    details?: string;
    location?: string;
}

/**
 * Format a Date object into UTC string for iCalendar / Google Calendar:
 * YYYYMMDDTHHmmssZ
 */
export function formatToUtcCalendarString(date: Date): string {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return (
        date.getUTCFullYear().toString() +
        pad(date.getUTCMonth() + 1) +
        pad(date.getUTCDate()) +
        "T" +
        pad(date.getUTCHours()) +
        pad(date.getUTCMinutes()) +
        pad(date.getUTCSeconds()) +
        "Z"
    );
}

/**
 * Escape text for RFC 5545 iCalendar specification.
 */
function escapeIcsText(str: string): string {
    return str
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\r?\n/g, "\\n");
}

/**
 * Generate event details payload from an InterviewRound and JobApplication details.
 */
export function getInterviewCalendarPayload(
    round: InterviewRound,
    job: { company: string; position: string; location?: string }
): CalendarEventPayload {
    const roundLabel = round.customRoundName || `${round.roundType} Interview`;
    const title = `${roundLabel} - ${job.company}`;

    const lines: string[] = [
        `Company: ${job.company}`,
        `Role: ${job.position}`,
        `Stage: ${round.roundType}`,
    ];

    if (round.interviewerNames) {
        lines.push(`Interviewer(s): ${round.interviewerNames}`);
    }
    if (round.meetingUrl) {
        lines.push(`Meeting Link: ${round.meetingUrl}`);
    }
    if (round.location) {
        lines.push(`Location: ${round.location}`);
    }
    if (round.notes) {
        lines.push("", "--- Notes & Preparation ---", round.notes);
    }

    const location = round.meetingUrl || round.location || job.location || "Remote";

    return {
        title,
        start: round.scheduledAt,
        durationMinutes: round.durationMinutes || 60,
        details: lines.join("\n"),
        location,
    };
}

/**
 * Generate a direct web intent link to add the event to Google Calendar.
 */
export function createGoogleCalendarUrl(payload: CalendarEventPayload): string {
    const startDate = new Date(payload.start);
    const durationMs = (payload.durationMinutes || 60) * 60 * 1000;
    const endDate = new Date(startDate.getTime() + durationMs);

    const startUtc = formatToUtcCalendarString(startDate);
    const endUtc = formatToUtcCalendarString(endDate);

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: payload.title,
        dates: `${startUtc}/${endUtc}`,
        details: payload.details || "",
        location: payload.location || "",
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate RFC 5545 compliant .ics calendar content string.
 */
export function generateIcsContent(
    events: CalendarEventPayload | CalendarEventPayload[]
): string {
    const eventList = Array.isArray(events) ? events : [events];
    const nowUtc = formatToUtcCalendarString(new Date());

    const icsLines: string[] = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Job Application Tracker//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
    ];

    for (const evt of eventList) {
        const startDate = new Date(evt.start);
        const durationMs = (evt.durationMinutes || 60) * 60 * 1000;
        const endDate = new Date(startDate.getTime() + durationMs);

        const startUtc = formatToUtcCalendarString(startDate);
        const endUtc = formatToUtcCalendarString(endDate);
        const uid = `interview-${Date.now()}-${Math.random().toString(36).slice(2, 9)}@jobapplicationtracker.local`;

        icsLines.push(
            "BEGIN:VEVENT",
            `UID:${uid}`,
            `DTSTAMP:${nowUtc}`,
            `DTSTART:${startUtc}`,
            `DTEND:${endUtc}`,
            `SUMMARY:${escapeIcsText(evt.title)}`,
            `DESCRIPTION:${escapeIcsText(evt.details || "")}`,
            `LOCATION:${escapeIcsText(evt.location || "")}`,
            "STATUS:CONFIRMED",
            "END:VEVENT"
        );
    }

    icsLines.push("END:VCALENDAR");
    return icsLines.join("\r\n");
}

/**
 * Triggers a file download of an .ics file in the browser.
 */
export function downloadIcsFile(filename: string, icsContent: string): void {
    if (typeof window === "undefined") return;

    const safeFilename = filename.endsWith(".ics") ? filename : `${filename}.ics`;
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.BETTER_AUTH_URL || "https://jobtracker.io";
    const lastModified = new Date("2026-09-19");

    return [
        {
            url: `${baseUrl}`,
            lastModified,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified,
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/sign-in`,
            lastModified,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/sign-up`,
            lastModified,
            changeFrequency: "monthly",
            priority: 0.8,
        },
    ];
}

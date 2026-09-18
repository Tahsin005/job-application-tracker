import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.BETTER_AUTH_URL || "https://jobtracker.io";

    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/terms", "/sign-in", "/sign-up"],
                disallow: ["/dashboard", "/admin", "/api"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}

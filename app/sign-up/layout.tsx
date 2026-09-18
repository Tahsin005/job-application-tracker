import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create an Account",
    description: "Create a free Job Application Tracker account to organize your job search, scan resumes against ATS filters, and land interviews with AI.",
    alternates: {
        canonical: "/sign-up",
    },
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

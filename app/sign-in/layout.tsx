import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In",
    description: "Sign in to your Job Application Tracker account to manage your applications, resumes, and interview pipeline.",
    alternates: {
        canonical: "/sign-in",
    },
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

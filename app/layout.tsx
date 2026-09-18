import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

import Footer from "@/components/footer";
import QueryProvider from "@/components/providers/query-provider";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

const baseUrl = process.env.BETTER_AUTH_URL || "https://jobtracker.io";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Job Application Tracker — AI Career Workspace & Kanban Board",
    template: "%s | Job Application Tracker",
  },
  description:
    "Organize your job search in a visual drag-and-drop Kanban pipeline. Benchmark resumes against ATS filters, generate tailored cover letters, and track interview stages with AI.",
  keywords: [
    "job application tracker",
    "kanban job board",
    "career tracker",
    "ATS resume checker",
    "resume keyword matcher",
    "ai cover letter generator",
    "interview tracker",
    "recruiter outreach message",
    "job search organization",
    "job hunt pipeline",
  ],
  authors: [{ name: "Job Application Tracker" }],
  creator: "Job Application Tracker",
  publisher: "Job Application Tracker",
  applicationName: "Job Application Tracker",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Job Application Tracker",
    title: "Job Application Tracker — AI Career Workspace & Kanban Board",
    description:
      "Organize your job search in a visual drag-and-drop Kanban pipeline. Benchmark resumes against ATS filters, generate tailored cover letters, and track interview stages with AI.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Job Application Tracker — AI Career Workspace & Kanban Board",
    description:
      "Organize your job search in a visual drag-and-drop Kanban pipeline. Benchmark resumes against ATS filters, generate tailored cover letters, and track interview stages with AI.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className={outfit.variable}>
        <body className="font-sans antialiased flex flex-col min-h-screen overflow-x-clip">
          <QueryProvider>
            <Navbar />
            <main className="flex-1 min-w-0">
              {children}
            </main>
            <Footer />
            <Toaster />
          </QueryProvider>
        </body>
      </html>
  );
}

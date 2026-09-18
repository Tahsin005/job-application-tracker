import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

import Footer from "@/components/footer";
import QueryProvider from "@/components/providers/query-provider";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Job Application Tracker",
  description: "Track your job applications and never miss an opportunity.",
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

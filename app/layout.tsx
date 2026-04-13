import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "iBuiltThis - Share Your Creations, Discover New Launches",
  description: "A community platform for creators to showcase their apps, AI tools, SaaS products, and creative projects. Authentic launches, real builders, genuine feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className={cn("font-sans", inter.variable)}>
        <body className={`${outfit.className} antialiased`}>
          {children}
        </body>
      </html>
  );
}

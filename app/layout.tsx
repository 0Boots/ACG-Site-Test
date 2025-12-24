import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Adaptive Climbing Group",
    description: "Community organizing platform",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {/* The Navbar sits at the top of every page */}
            <Navbar />

            <main className="min-h-screen bg-background text-foreground">
                {children}
            </main>

        </ThemeProvider>
        </body>
        </html>
    );
}
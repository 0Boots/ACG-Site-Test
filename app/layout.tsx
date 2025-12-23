import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ACG Climbing - Adaptive Climbing Sessions",
  description: "Website for Adaptive individuals to sign up for climbing sessions and see information for that day based off of a calendar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

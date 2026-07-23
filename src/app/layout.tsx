import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Dock from "@/components/Dock";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Gilang | AI Engineer & IoT Specialist",
  description: "Portfolio of Gilang Wasis Wicaksono - AI Engineer, IoT Specialist, Cyber Security Analyst, and Fullstack Developer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased font-sans text-[var(--text)] bg-[var(--bg)]`}>
        {children}
        <Dock />
      </body>
    </html>
  );
}

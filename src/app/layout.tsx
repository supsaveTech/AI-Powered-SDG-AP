import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { AIChatbot } from "@/components/ai/AIChatbot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Digital Skills for Decent Work",
  description: "SDG analytics platform assessing youth digital readiness in Port Harcourt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-slate-50`}>
        <div className="flex min-h-screen">
          <LayoutWrapper>{children}</LayoutWrapper>
        </div>
        <AIChatbot />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
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
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar for desktop */}
          <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
            <Sidebar />
          </div>
          
          {/* Main content */}
          <div className="flex flex-col flex-1 md:pl-64">
            <main className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
        <AIChatbot />
      </body>
    </html>
  );
}

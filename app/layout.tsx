import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import Header from "@/components/Header";
import { BrainProvider } from "@/lib/hooks/useBrain";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Brain - Your Personal Knowledge Management",
  description: "Store your ideas, tasks, knowledge, and journal entries all in one place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <BrainProvider>
          <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
            {/* Sidebar - Hidden on mobile, visible on desktop */}
            <div className="hidden lg:block">
              <Sidebar />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
                {children}
              </main>
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileNav />

          <Toaster
            position="bottom-right"
            richColors
            toastOptions={{
              className: 'mb-16 lg:mb-0',
            }}
          />
        </BrainProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BrainProvider } from "@/lib/hooks/useBrain";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import LayoutContent from "@/components/LayoutContent";
import AuthGuard from "@/components/AuthGuard";

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
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <AuthGuard>
            <BrainProvider>
              <LayoutContent>{children}</LayoutContent>
              <Toaster
                position="bottom-right"
                richColors
                toastOptions={{
                  className: 'mb-16 lg:mb-0',
                }}
              />
            </BrainProvider>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}

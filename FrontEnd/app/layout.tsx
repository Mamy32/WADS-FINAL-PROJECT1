import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./AuthProvider"; // ✅ IMPORT

export const metadata: Metadata = {
  title: "StudyFlow — Study Smarter, Achieve More",
  description:
    "The all-in-one study companion that helps students organize tasks, track progress, and maximize focus with AI-powered insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* ✅ WRAP APP */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
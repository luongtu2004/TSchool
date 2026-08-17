import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "T+ School – Luyện thi trắc nghiệm trực tuyến",
  description:
    "Nền tảng luyện thi trắc nghiệm trực tuyến T+ School. Ôn tập hiệu quả với hệ thống câu hỏi phong phú, chấm điểm tự động và phân tích chi tiết.",
  keywords: ["trắc nghiệm", "luyện thi", "T+ School", "tschool", "học trực tuyến"],
  openGraph: {
    title: "T+ School – Luyện thi trắc nghiệm",
    description: "Hệ thống thi trắc nghiệm trực tuyến với chấm điểm tự động.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#080b14]">
        {/* AuthProvider wraps everything so all pages can access user state */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

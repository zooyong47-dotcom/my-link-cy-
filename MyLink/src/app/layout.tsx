import type { Metadata } from "next";
import { QueryProvider } from "@/components/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "신찬용 (Chan-yong Shin) | MyLink Profile",
  description:
    "신찬용의 프로필 및 링크 페이지입니다. 새로운 기술을 탐구하는 학생 개발자 신찬용의 링크 모음.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}


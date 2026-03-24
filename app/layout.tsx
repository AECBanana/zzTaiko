import type { Metadata } from "next";
import "./globals.css";
import ClientNavbarWrapper from '@/app/components/ClientNavbarWrapper';



export const metadata: Metadata = {
  title: "漳州太鼓",
  description: "课题与群相册",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`antialiased`}
      >
        <ClientNavbarWrapper />
        {children}
      </body>
      <footer><a href="https://beian.miit.gov.cn/" target="_blank">闽ICP备2026007493号-1</a></footer>
    </html>
  );
}

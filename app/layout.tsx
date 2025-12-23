import type { Metadata } from "next";
import "./globals.css";

import localFont from 'next/font/local'

const fallbackFont = localFont({
  src: './font/J002-A-OTF-KanteiryuStd-Ultra.otf',
  display: 'swap',
})

const hkktl = localFont({
  src: './font/华康勘亭流w9.ttf',
  fallback: ['fallbackFont']
})


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
        className={`${hkktl.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

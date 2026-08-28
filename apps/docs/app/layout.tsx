import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "./_components/SiteFooter";
import { SiteHeader } from "./_components/SiteHeader";
import { SiteProviders } from "./_components/SiteProviders";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://meu-mobile-docs.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Meu Mobile — 移动端 React 组件库",
    template: "%s — Meu Mobile"
  },
  description:
    "面向 Next.js H5 的移动端 React 组件库，内置完整表单集成，并为 uni-app 预留适配边界。",
  keywords: ["Meu Mobile", "React", "Next.js", "H5", "组件库", "Vanilla Extract"],
  openGraph: {
    title: "Meu Mobile",
    description: "安静、可靠的移动端 React 组件。",
    images: ["/opengraph-image"]
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"]
  }
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#121613" }
  ]
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <SiteProviders>
          <a className="skip-link" href="#main-content">
            跳到主要内容
          </a>
          <SiteHeader />
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
          <SiteFooter />
        </SiteProviders>
      </body>
    </html>
  );
}

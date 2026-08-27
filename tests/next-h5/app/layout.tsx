import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@meu/tokens/css";
import "@meu/mobile/styles.css";
import "./styles.css";

export const metadata: Metadata = {
  title: "Meu Next H5 Integration",
  description: "Isolated consumer integration tests for Meu Mobile"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

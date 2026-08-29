import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "@meu/tokens/css";
import "@meu/primitives-react/styles.css";
import "@meu/mobile/styles.css";
import "./styles.css";

export const metadata: Metadata = {
  title: "Meu Next H5 Integration",
  description: "Isolated consumer integration tests for Meu Mobile"
};

export const viewport: Viewport = {
  initialScale: 1,
  viewportFit: "cover",
  width: "device-width"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

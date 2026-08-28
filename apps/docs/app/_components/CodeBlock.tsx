"use client";

import { useId, useState } from "react";

export function CodeBlock({ children, label = "tsx" }: { children: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const labelId = `meu-code-block-${useId()}`;

  async function copy() {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="code-block">
      <div className="code-block__bar">
        <span id={labelId}>{label}</span>
        <button
          type="button"
          onClick={() => {
            void copy();
          }}
        >
          {copied ? "已复制" : "复制"}
        </button>
      </div>
      <pre role="region" aria-labelledby={labelId} tabIndex={0}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

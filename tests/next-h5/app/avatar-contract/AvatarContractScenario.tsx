"use client";

import { Avatar, Button, ConfigProvider } from "@meu/mobile";
import { useState } from "react";

export function AvatarContractScenario() {
  const [attempt, setAttempt] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [loadCount, setLoadCount] = useState(0);

  return (
    <ConfigProvider locale="zh-CN" motion="reduced" theme="light">
      <main style={{ minHeight: "100vh", padding: 24 }}>
        <h1>Avatar loading contract</h1>

        <section aria-label="失败恢复头像" style={{ display: "grid", gap: 12 }}>
          <Avatar
            src={`/avatar-recovery-${attempt}.svg`}
            alt="恢复头像"
            initials="AR"
            decoding="async"
            onError={() => setErrorCount((count) => count + 1)}
            onLoad={() => setLoadCount((count) => count + 1)}
          />
          <Button size="small" onClick={() => setAttempt((value) => value + 1)}>
            重试头像
          </Button>
          <output data-testid="avatar-error-count">{errorCount}</output>
          <output data-testid="avatar-load-count">{loadCount}</output>
        </section>

        <div aria-hidden="true" style={{ height: "10000px" }} />

        <section aria-label="懒加载头像" style={{ minHeight: 120 }}>
          <Avatar
            src="/avatar-lazy.svg"
            alt="懒加载头像"
            initials="LZ"
            loading="lazy"
            decoding="async"
            size="large"
          />
        </section>
      </main>
    </ConfigProvider>
  );
}

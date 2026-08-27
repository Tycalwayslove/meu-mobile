import "@meu/tokens/css";
import "@meu/mobile/styles.css";

import { MeuIconChevronLeft } from "@meu/icons-react";
import { Button, ConfigProvider, Field, TextInput } from "@meu/mobile";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles.css";

function App() {
  return (
    <ConfigProvider theme="system">
      <main className="playground">
        <header className="nav">
          <button className="back" type="button" aria-label="返回">
            <MeuIconChevronLeft />
          </button>
          <strong>真机回归</strong>
        </header>
        <section className="content">
          <h1>Meu Mobile</h1>
          <p>用于验证安全区、软键盘、触控命中区、主题和滚动。</p>
          <Field label="店铺名称" description="点击输入框验证软键盘和页面滚动。">
            <TextInput clearable placeholder="请输入店铺名称" />
          </Field>
          <Button block>保存更改</Button>
        </section>
      </main>
    </ConfigProvider>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Playground root element is missing.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

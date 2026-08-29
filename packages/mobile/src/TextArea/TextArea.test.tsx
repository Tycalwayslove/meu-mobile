// @vitest-environment jsdom
import { act } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { TextArea } from "./TextArea";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function setScrollHeight(element: HTMLTextAreaElement, getValue: () => number) {
  Object.defineProperty(element, "scrollHeight", { configurable: true, get: getValue });
}

function getTextArea(name: string): HTMLTextAreaElement {
  const element = screen.getByRole("textbox", { name });
  if (!(element instanceof HTMLTextAreaElement)) throw new Error(`Expected textarea: ${name}`);
  return element;
}

function getForm(name: string): HTMLFormElement {
  const element = screen.getByRole("form", { name });
  if (!(element instanceof HTMLFormElement)) throw new Error(`Expected form: ${name}`);
  return element;
}

describe("TextArea", () => {
  it("merges caller, Field, error, and count descriptions without a live region", () => {
    render(
      <>
        <span id="external-help">外部提示</span>
        <Field label="商品介绍" description="用于商品详情" error="介绍不能为空">
          <TextArea aria-describedby="external-help" aria-invalid="grammar" showCount />
        </Field>
      </>
    );

    const textArea = screen.getByRole("textbox", { name: "商品介绍" });
    const descriptionIds = (textArea.getAttribute("aria-describedby") || "").split(" ");
    expect(textArea.getAttribute("aria-invalid")).toBe("true");
    expect(descriptionIds).toContain("external-help");
    expect(descriptionIds.some((id) => id.includes("description"))).toBe(true);
    expect(descriptionIds.some((id) => id.includes("error"))).toBe(true);
    expect(descriptionIds.some((id) => id.includes("count"))).toBe(true);
    expect(new Set(descriptionIds).size).toBe(descriptionIds.length);
    expect(screen.getByText("0").getAttribute("aria-live")).toBeNull();
  });

  it.each([
    [false, "false", "default"],
    ["false", "false", "default"],
    ["grammar", "grammar", "error"],
    ["spelling", "spelling", "error"]
  ] as const)(
    "preserves aria-invalid=%s on the textarea",
    (ariaInvalid, expectedAttribute, expectedState) => {
      render(<TextArea aria-invalid={ariaInvalid} aria-label="语义文本域" />);
      const textArea = screen.getByRole("textbox", { name: "语义文本域" });
      expect(textArea.getAttribute("aria-invalid")).toBe(expectedAttribute);
      expect(textArea.getAttribute("data-state")).toBe(expectedState);
    }
  );

  it("counts UTF-16 code units in an uncontrolled value", () => {
    const onChange = vi.fn();
    render(<TextArea aria-label="备注" maxLength={20} showCount onChange={onChange} />);

    fireEvent.change(screen.getByRole("textbox", { name: "备注" }), {
      target: { value: "🐱喵呜" }
    });

    expect(screen.getByText("4 / 20")).toBeTruthy();
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("keeps IME events native while synchronizing derived count and autosize", () => {
    const onCompositionStart = vi.fn();
    const onCompositionEnd = vi.fn();
    const onChange = vi.fn();
    render(
      <TextArea
        aria-label="输入法说明"
        autoSize={{ minRows: 1, maxRows: 4 }}
        onChange={onChange}
        onCompositionEnd={onCompositionEnd}
        onCompositionStart={onCompositionStart}
        showCount
      />
    );
    const textArea = getTextArea("输入法说明");
    setScrollHeight(textArea, () => 88);

    fireEvent.compositionStart(textArea, { data: "猫" });
    fireEvent.change(textArea, { target: { value: "猫🐱" } });
    fireEvent.compositionEnd(textArea, { data: "🐱" });

    expect(onCompositionStart).toHaveBeenCalledOnce();
    expect(onCompositionEnd).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledOnce();
    expect(screen.getByText("3")).toBeTruthy();
    expect(textArea.style.height).not.toBe("");
  });

  it("synchronizes uncontrolled count and autosize after native form reset", async () => {
    render(
      <form aria-label="编辑表单">
        <TextArea
          aria-label="说明"
          autoSize={{ minRows: 1, maxRows: 5 }}
          defaultValue="初始"
          showCount
        />
      </form>
    );
    const textArea = getTextArea("说明");
    setScrollHeight(textArea, () => (textArea.value === "初始" ? 52 : 132));

    fireEvent.change(textArea, { target: { value: "修改后的多行内容" } });
    expect(screen.getByText("8")).toBeTruthy();
    const expandedHeight = Number.parseFloat(textArea.style.height);

    const form = getForm("编辑表单");
    act(() => form.reset());

    await waitFor(() => expect(screen.getByText("2")).toBeTruthy());
    expect(textArea.value).toBe("初始");
    expect(Number.parseFloat(textArea.style.height)).toBeLessThan(expandedHeight);
  });

  it("observes a late-mounted external owner and honors a cancelled reset", async () => {
    let cancelReset = true;
    const { rerender } = render(
      <>
        <TextArea
          aria-label="动态表单说明"
          autoSize
          defaultValue="初始说明"
          form="dynamic-area-owner"
          name="description"
          showCount
        />
        <div data-testid="area-owner-slot" />
      </>
    );
    const textArea = getTextArea("动态表单说明");
    fireEvent.change(textArea, { target: { value: "保留修改内容" } });

    rerender(
      <>
        <TextArea
          aria-label="动态表单说明"
          autoSize
          defaultValue="初始说明"
          form="dynamic-area-owner"
          name="description"
          showCount
        />
        <form
          id="dynamic-area-owner"
          onReset={(event) => {
            if (cancelReset) event.preventDefault();
          }}
        />
      </>
    );
    const form = document.getElementById("dynamic-area-owner") as HTMLFormElement;
    expect(screen.getByRole("textbox", { name: "动态表单说明" })).toBe(textArea);
    act(() => form.reset());
    await act(() => new Promise<void>((resolve) => window.setTimeout(resolve, 0)));
    expect(textArea.value).toBe("保留修改内容");
    expect(screen.getByText("6")).toBeTruthy();

    cancelReset = false;
    act(() => form.reset());
    await waitFor(() => expect(textArea.value).toBe("初始说明"));
    await waitFor(() => expect(screen.getByText("4")).toBeTruthy());
    expect(new FormData(form).get("description")).toBe("初始说明");
  });

  it("sizes before the first painted frame and respects row bounds", () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "scrollHeight"
    );
    Object.defineProperty(HTMLTextAreaElement.prototype, "scrollHeight", {
      configurable: true,
      get: () => 120
    });

    try {
      render(<TextArea aria-label="自动高度" autoSize={{ minRows: 2, maxRows: 4 }} />);
      const textArea = screen.getByRole("textbox", { name: "自动高度" });
      expect(textArea.style.height).not.toBe("");
      expect(Number.parseFloat(textArea.style.height)).toBeLessThanOrEqual(130);
      expect(textArea.style.overflowY).toBe("auto");
      expect(textArea.getAttribute("data-auto-size")).toBe("true");
    } finally {
      if (descriptor) {
        Object.defineProperty(HTMLTextAreaElement.prototype, "scrollHeight", descriptor);
      } else {
        Reflect.deleteProperty(HTMLTextAreaElement.prototype, "scrollHeight");
      }
    }
  });

  it("remeasures width changes through ResizeObserver", async () => {
    let notifyResize: ((entries: ResizeObserverEntry[]) => void) | undefined;
    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        notifyResize = (entries) => callback(entries, this);
      }
      disconnect() {}
      observe() {}
      unobserve() {}
    }
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
    render(<TextArea aria-label="宽度响应" autoSize />);
    const textArea = getTextArea("宽度响应");
    let scrollHeight = 52;
    setScrollHeight(textArea, () => scrollHeight);
    fireEvent.change(textArea, { target: { value: "初始内容" } });
    const initialHeight = textArea.style.height;

    scrollHeight = 108;
    act(() => {
      if (notifyResize) {
        notifyResize([{ contentRect: { width: 240 } } as ResizeObserverEntry]);
      }
    });

    await waitFor(() => expect(textArea.style.height).not.toBe(initialHeight));
  });

  it("falls back to viewport events when ResizeObserver is unavailable", async () => {
    vi.stubGlobal("ResizeObserver", undefined);
    render(<TextArea aria-label="旧 WebView" autoSize />);
    const textArea = getTextArea("旧 WebView");
    let scrollHeight = 48;
    setScrollHeight(textArea, () => scrollHeight);
    fireEvent.change(textArea, { target: { value: "第一行" } });
    const initialHeight = textArea.style.height;

    scrollHeight = 112;
    fireEvent(window, new Event("resize"));

    await waitFor(() => expect(textArea.style.height).not.toBe(initialHeight));
  });

  it("remeasures after fonts finish loading", async () => {
    let resolveFonts: (() => void) | undefined;
    const ready = new Promise<void>((resolve) => {
      resolveFonts = resolve;
    });
    const fontsDescriptor = Object.getOwnPropertyDescriptor(document, "fonts");
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: {
        addEventListener: vi.fn(),
        ready,
        removeEventListener: vi.fn()
      }
    });

    try {
      render(<TextArea aria-label="字体加载" autoSize />);
      const textArea = getTextArea("字体加载");
      let scrollHeight = 48;
      setScrollHeight(textArea, () => scrollHeight);
      fireEvent.change(textArea, { target: { value: "字体变化" } });
      const initialHeight = textArea.style.height;

      scrollHeight = 104;
      await act(async () => {
        if (resolveFonts) resolveFonts();
        await ready;
      });

      await waitFor(() => expect(textArea.style.height).not.toBe(initialHeight));
    } finally {
      if (fontsDescriptor) Object.defineProperty(document, "fonts", fontsDescriptor);
      else Reflect.deleteProperty(document, "fonts");
    }
  });

  it("restores autosize after a controlled parent rejects pasted input", async () => {
    const onChange = vi.fn();
    render(
      <TextArea
        aria-label="受控说明"
        autoSize={{ minRows: 1, maxRows: 5 }}
        value="短文"
        onChange={onChange}
      />
    );
    const textArea = getTextArea("受控说明");
    setScrollHeight(textArea, () => (textArea.value === "短文" ? 52 : 152));
    fireEvent.change(textArea, { target: { value: "粘贴进来的长文本不会被父级接受" } });

    expect(onChange).toHaveBeenCalledOnce();
    await waitFor(() => expect(textArea.value).toBe("短文"));
    await waitFor(() => expect(Number.parseFloat(textArea.style.height)).toBeLessThan(100));
  });

  it("preserves scroll position while resizing overflowing content", () => {
    render(<TextArea aria-label="长备注" autoSize={{ minRows: 1, maxRows: 2 }} />);
    const textArea = getTextArea("长备注");
    setScrollHeight(textArea, () => 240);
    textArea.scrollTop = 32;

    fireEvent.change(textArea, { target: { value: "第一行\n第二行\n第三行\n第四行" } });

    expect(textArea.style.overflowY).toBe("auto");
    expect(textArea.scrollTop).toBe(32);
  });

  it("leaves authored sizing alone when autosize is off and restores it after a toggle", () => {
    const authoredStyle = { height: 180, overflowY: "scroll" as const };
    const { rerender } = render(
      <TextArea aria-label="固定高度" style={authoredStyle} defaultValue="初始" />
    );
    const textArea = getTextArea("固定高度");
    fireEvent.change(textArea, { target: { value: "修改内容" } });
    expect(textArea.style.height).toBe("180px");
    expect(textArea.style.overflowY).toBe("scroll");

    setScrollHeight(textArea, () => 96);
    rerender(<TextArea aria-label="固定高度" style={authoredStyle} autoSize defaultValue="初始" />);
    expect(textArea.style.height).not.toBe("180px");

    rerender(<TextArea aria-label="固定高度" style={authoredStyle} defaultValue="初始" />);
    expect(textArea.style.height).toBe("180px");
    expect(textArea.style.overflowY).toBe("scroll");
  });

  it("exposes a distinct read-only state without disabling form semantics", () => {
    render(<TextArea aria-label="只读说明" defaultValue="已审核" name="description" readOnly />);
    const textArea = screen.getByRole("textbox", { name: "只读说明" });

    expect(textArea.getAttribute("readonly")).not.toBeNull();
    expect(textArea.getAttribute("disabled")).toBeNull();
    expect(textArea.getAttribute("data-state")).toBe("readonly");
  });

  it("forwards native attributes and ref while keeping an explicit RTL counter readable", () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(
      <TextArea
        ref={ref}
        aria-label="RTL 备注"
        autoComplete="off"
        defaultValue="طلب"
        dir="rtl"
        inputMode="text"
        name="note"
        required
        showCount
      />
    );
    const textArea = getTextArea("RTL 备注");
    const count = screen.getByText("3");

    expect(ref.current).toBe(textArea);
    expect(textArea.name).toBe("note");
    expect(textArea.required).toBe(true);
    expect(textArea.autocomplete).toBe("off");
    expect(textArea.inputMode).toBe("text");
    expect(textArea.dir).toBe("rtl");
    expect(textArea.parentElement && textArea.parentElement.dir).toBe("rtl");
    expect(count.getAttribute("dir")).toBe("ltr");
  });
});

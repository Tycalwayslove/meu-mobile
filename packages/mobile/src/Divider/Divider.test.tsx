// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { Divider } from "./Divider";

describe("Divider", () => {
  it("exposes separator semantics", () => {
    render(<Divider>更多信息</Divider>);
    const divider = screen.getByRole("separator", { name: "更多信息" });
    expect(divider.getAttribute("aria-orientation")).toBe("horizontal");
    expect(divider.textContent).toBe("更多信息");
  });

  it("supports a vertical separator without rendering horizontal label content", () => {
    render(<Divider direction="vertical">不会显示</Divider>);
    const divider = screen.getByRole("separator");
    expect(divider.getAttribute("aria-orientation")).toBe("vertical");
    expect(divider.textContent).toBe("");
    expect(divider.getAttribute("data-content")).toBe("false");
  });

  it("treats zero as intentional horizontal content", () => {
    render(<Divider align="end">{0}</Divider>);
    const divider = screen.getByRole("separator", { name: "0" });
    expect(divider.textContent).toBe("0");
    expect(divider.getAttribute("data-align")).toBe("end");
    expect(divider.getAttribute("data-content")).toBe("true");
  });

  it("does not create a labeled layout for empty React nodes", () => {
    const { rerender } = render(<Divider>{[]}</Divider>);
    let divider = screen.getByRole("separator");
    expect(divider.getAttribute("data-content")).toBe("false");
    expect(divider.children).toHaveLength(1);

    rerender(
      <Divider>
        <></>
      </Divider>
    );
    divider = screen.getByRole("separator");
    expect(divider.getAttribute("data-content")).toBe("false");
    expect(divider.children).toHaveLength(1);
  });

  it("forwards labels, native attributes and refs", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Divider ref={ref} aria-label="商品与配送信息分界" data-testid="divider" />);
    const divider = screen.getByTestId("divider");
    expect(divider).toBe(ref.current);
    expect(divider.getAttribute("aria-label")).toBe("商品与配送信息分界");
  });
});

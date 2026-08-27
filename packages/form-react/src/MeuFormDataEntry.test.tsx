// @vitest-environment jsdom
import { Button } from "@meu/mobile";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MeuForm } from "./MeuForm";
import { MeuFormSearchField } from "./MeuFormSearchField";
import { MeuFormTextArea } from "./MeuFormTextArea";
import { useMeuForm } from "./useMeuForm";

type Values = { description: string; query: string };

function DataEntryForm({ onSubmit }: { onSubmit: (values: Values) => void }) {
  const form = useMeuForm<Values>({ defaultValues: { description: "", query: "" } });

  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <MeuFormSearchField<Values>
        name="query"
        label="搜索关键词"
        rules={{ required: "请输入搜索关键词" }}
      />
      <MeuFormTextArea<Values>
        name="description"
        label="商品介绍"
        rules={{ validate: (value) => String(value).length >= 4 || "商品介绍至少输入 4 个字符" }}
      />
      <Button type="submit">提交资料</Button>
    </MeuForm>
  );
}

describe("MeuForm data entry adapters", () => {
  it("binds SearchField and TextArea to the form lifecycle", async () => {
    const onSubmit = vi.fn();
    render(<DataEntryForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "提交资料" }));
    await waitFor(() =>
      expect(screen.getAllByRole("alert").map((item) => item.textContent)).toEqual([
        "请输入搜索关键词",
        "商品介绍至少输入 4 个字符"
      ])
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "搜索关键词" }), {
      target: { value: "猫粮" }
    });
    fireEvent.change(screen.getByRole("textbox", { name: "商品介绍" }), {
      target: { value: "天然成分猫粮" }
    });
    fireEvent.click(screen.getByRole("button", { name: "提交资料" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { description: "天然成分猫粮", query: "猫粮" },
        expect.anything()
      )
    );
  });
});

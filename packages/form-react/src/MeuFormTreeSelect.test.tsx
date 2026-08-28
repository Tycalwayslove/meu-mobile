// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { MeuFormTreeSelect } from "./MeuFormTreeSelect";

type Values = { categories: string[] };

const options = [
  {
    label: "数码家电",
    value: "digital",
    children: [
      { label: "智能手机", value: "phone" },
      { label: "电脑整机", value: "computer" }
    ]
  }
];

function Example({ onSubmit = vi.fn() }: { onSubmit?: (values: Values) => void }) {
  const methods = useForm<Values>({ defaultValues: { categories: [] }, mode: "onBlur" });
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(event) => {
          void methods.handleSubmit(onSubmit)(event);
        }}
      >
        <MeuFormTreeSelect<Values, string>
          label="商品类目"
          name="categories"
          options={options}
          defaultExpandedValues={["digital"]}
          required
          rules={{ validate: (value) => value.length > 0 || "请选择商品类目" }}
          virtual={false}
        />
        <output data-testid="dirty">{String(methods.formState.isDirty)}</output>
        <output data-testid="touched">
          {String(Boolean(methods.formState.touchedFields.categories))}
        </output>
        <button type="submit">提交</button>
      </form>
    </FormProvider>
  );
}

describe("MeuFormTreeSelect", () => {
  it("commits confirmed values and participates in dirty/touched form state", async () => {
    const onSubmit = vi.fn();
    render(<Example onSubmit={onSubmit} />);

    const trigger = screen.getByRole("button", { name: "商品类目" });
    fireEvent.blur(trigger);
    await waitFor(() => expect(screen.getByText("请选择商品类目")).toBeTruthy());
    expect(screen.getByTestId("touched").textContent).toBe("true");

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("treeitem", { name: "智能手机" }));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    await waitFor(() => expect(screen.queryByText("请选择商品类目")).toBeNull());
    expect(screen.getByTestId("dirty").textContent).toBe("true");
    expect(trigger.textContent).toContain("智能手机");
    const formElement = trigger.closest("form");
    expect(formElement).not.toBeNull();
    expect(new FormData(formElement as HTMLFormElement).getAll("categories")).toEqual(["phone"]);

    fireEvent.click(screen.getByRole("button", { name: "提交" }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ categories: ["phone"] }, expect.anything())
    );
  });

  it("keeps read-only values inspectable without mutating form state", () => {
    function ReadOnlyExample() {
      const methods = useForm<Values>({ defaultValues: { categories: ["phone"] } });
      return (
        <FormProvider {...methods}>
          <MeuFormTreeSelect<Values, string>
            readOnly
            label="只读类目"
            name="categories"
            options={options}
            defaultExpandedValues={["digital"]}
            virtual={false}
          />
        </FormProvider>
      );
    }

    render(<ReadOnlyExample />);
    const trigger = screen.getByRole("button", { name: "只读类目" });
    fireEvent.click(trigger);
    expect(screen.getByRole("tree").getAttribute("data-readonly")).toBe("true");
    fireEvent.click(screen.getByRole("treeitem", { name: "电脑整机" }));
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    expect(trigger.textContent).toContain("智能手机");
  });
});

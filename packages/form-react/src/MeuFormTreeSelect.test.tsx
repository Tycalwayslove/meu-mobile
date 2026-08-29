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

function Example({
  events,
  onSubmit = vi.fn()
}: {
  events?: string[];
  onSubmit?: (values: Values) => void;
}) {
  const methods = useForm<Values>({ defaultValues: { categories: [] }, mode: "onBlur" });
  const touched = () => (methods.getFieldState("categories").isTouched ? "touched" : "untouched");
  const record = (event: string) => {
    if (events) events.push(event);
  };
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
          onCancel={(details) => record(`cancel:${details.reason}:${touched()}`)}
          onConfirm={(value) => record(`confirm:${value.join("/")}:${touched()}`)}
          onOpenChange={(open, details) =>
            record(`open:${String(open)}:${details.reason}:${touched()}`)
          }
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

function ControlledTreeSelect({ events, open }: { events: string[]; open: boolean }) {
  const methods = useForm<Values>({ defaultValues: { categories: [] } });
  const touched = () => (methods.getFieldState("categories").isTouched ? "touched" : "untouched");

  return (
    <FormProvider {...methods}>
      <MeuFormTreeSelect<Values, string>
        label="受控商品类目"
        name="categories"
        options={options}
        open={open}
        virtual={false}
        onCancel={(details) => events.push(`cancel:${details.reason}:${touched()}`)}
        onOpenChange={(nextOpen, details) =>
          events.push(`open:${String(nextOpen)}:${details.reason}:${touched()}`)
        }
      />
      <output data-testid="controlled-tree-touched">
        {methods.formState.touchedFields.categories ? "touched" : "untouched"}
      </output>
      <output data-testid="controlled-tree-dirty">
        {methods.formState.isDirty ? "dirty" : "pristine"}
      </output>
    </FormProvider>
  );
}

describe("MeuFormTreeSelect", () => {
  it("commits confirmed values and participates in dirty/touched form state", async () => {
    const onSubmit = vi.fn();
    const events: string[] = [];
    render(<Example events={events} onSubmit={onSubmit} />);

    const trigger = screen.getByRole("button", { name: "商品类目" });
    fireEvent.click(trigger);
    expect(screen.getByTestId("touched").textContent).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(screen.getByText("请选择商品类目")).toBeTruthy());
    expect(screen.getByTestId("touched").textContent).toBe("true");
    expect(screen.getByTestId("dirty").textContent).toBe("false");

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
    expect(events).toEqual([
      "open:true:trigger:untouched",
      "cancel:cancel:touched",
      "open:false:cancel:touched",
      "open:true:trigger:touched",
      "confirm:phone:touched",
      "open:false:confirm:touched"
    ]);
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

  it("keeps controlled open rejection untouched and reports a rejected close after touch", async () => {
    const events: string[] = [];
    const { rerender } = render(<ControlledTreeSelect events={events} open={false} />);
    const trigger = screen.getByRole("button", { name: "受控商品类目" });

    fireEvent.click(trigger);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByTestId("controlled-tree-touched").textContent).toBe("untouched");

    rerender(<ControlledTreeSelect events={events} open />);
    await waitFor(() => expect(screen.getByRole("dialog")).toBeTruthy());
    expect(screen.getByTestId("controlled-tree-touched").textContent).toBe("untouched");

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "取消" }))
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("dialog")).toBeTruthy();
    await waitFor(() =>
      expect(screen.getByTestId("controlled-tree-touched").textContent).toBe("touched")
    );
    expect(screen.getByTestId("controlled-tree-dirty").textContent).toBe("pristine");
    expect(events).toEqual([
      "open:true:trigger:untouched",
      "cancel:escape:touched",
      "open:false:escape:touched"
    ]);
  });
});

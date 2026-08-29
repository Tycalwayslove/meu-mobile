// @vitest-environment jsdom
import { Button } from "@meu/mobile";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { MeuForm } from "./MeuForm";
import { MeuFormImageUploader } from "./MeuFormImageUploader";
import { useMeuForm } from "./useMeuForm";
import type { ImageUploaderItem } from "@meu/mobile";

const schema = z.object({
  images: z.array(z.object({ alt: z.string(), url: z.string() })).min(1, "请上传商品图片")
});
type Values = z.infer<typeof schema>;

beforeEach(() => {
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn((file: File) => `blob:${file.name}`),
    revokeObjectURL: vi.fn()
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function ProductImageForm({ onSubmit }: { onSubmit: (values: Values) => void }) {
  const form = useMeuForm<Values>({ schema, defaultValues: { images: [] } });
  return (
    <MeuForm form={form} onSubmit={onSubmit}>
      <MeuFormImageUploader<Values>
        name="images"
        label="商品图片"
        description="上传一张商品主图"
        maxCount={1}
        required
        upload={(file: File) => Promise.resolve({ alt: file.name, url: `/uploads/${file.name}` })}
      />
      <output data-testid="dirty">{form.formState.isDirty ? "dirty" : "pristine"}</output>
      <output data-testid="touched">
        {form.formState.touchedFields.images ? "touched" : "untouched"}
      </output>
      <Button type="submit">提交</Button>
    </MeuForm>
  );
}

describe("MeuFormImageUploader", () => {
  it("binds array value, dirty, touched and submission", async () => {
    const onSubmit = vi.fn();
    render(<ProductImageForm onSubmit={onSubmit} />);
    const input = screen.getByLabelText<HTMLInputElement>(/商品图片/, {
      selector: 'input[type="file"]'
    });
    const formElement = input.form!;
    expect(new FormData(formElement).has("images")).toBe(false);
    fireEvent.change(input, {
      target: { files: [new File(["photo"], "product.jpg", { type: "image/jpeg" })] }
    });

    await waitFor(() => expect(screen.getByTestId("dirty").textContent).toBe("dirty"));
    await waitFor(() => expect(screen.getByTestId("touched").textContent).toBe("touched"));
    await waitFor(() =>
      expect(new FormData(formElement).getAll("images")).toEqual(["/uploads/product.jpg"])
    );
    fireEvent.click(screen.getByRole("button", { name: "提交" }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { images: [{ alt: "product.jpg", url: "/uploads/product.jpg" }] },
        expect.anything()
      )
    );
  });

  it("surfaces schema errors and focuses the real file input", async () => {
    render(<ProductImageForm onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "提交" }));

    const alert = await screen.findByRole("alert");
    const input = screen.getByLabelText<HTMLInputElement>(/商品图片/, {
      selector: 'input[type="file"]'
    });
    expect(alert.textContent).toBe("请上传商品图片");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toContain("error");
    await waitFor(() => expect(document.activeElement).toBe(input));
  });

  it("passes successful item changes to consumers", async () => {
    const item: ImageUploaderItem = { alt: "细节图", url: "/detail.jpg" };
    const onChange = vi.fn();

    function ChangeForm() {
      const form = useMeuForm<Values>({ defaultValues: { images: [] } });
      return (
        <MeuForm form={form} onSubmit={vi.fn()}>
          <MeuFormImageUploader<Values>
            name="images"
            label="图片"
            onChange={onChange}
            upload={() => Promise.resolve(item)}
          />
        </MeuForm>
      );
    }

    render(<ChangeForm />);
    fireEvent.change(
      screen.getByLabelText<HTMLInputElement>("图片", {
        selector: 'input[type="file"]'
      }),
      {
        target: { files: [new File(["x"], "detail.jpg", { type: "image/jpeg" })] }
      }
    );
    await waitFor(() => expect(onChange).toHaveBeenCalledWith([item], { item, reason: "upload" }));
  });

  it("supports a custom item contract, reset, and disabled omission", () => {
    const initialItems: ImageUploaderItem[] = [
      { alt: "主图", url: "/main.jpg" },
      { alt: "细节图", url: "/detail.jpg" }
    ];

    function SerializationForm({ disabled = false }: { disabled?: boolean }) {
      const form = useMeuForm<Values>({ defaultValues: { images: initialItems } });
      return (
        <MeuForm form={form} onSubmit={vi.fn()}>
          <MeuFormImageUploader<Values>
            name="images"
            label="图片"
            disabled={disabled}
            upload={() => Promise.resolve(initialItems[0]!)}
            serializeValue={(items) => JSON.stringify(items.map((item) => item.url))}
          />
          <Button type="button" onClick={() => form.reset({ images: [] })}>
            重置
          </Button>
        </MeuForm>
      );
    }

    const { unmount } = render(<SerializationForm />);
    const formElement = screen.getByLabelText<HTMLInputElement>("图片", {
      selector: 'input[type="file"]'
    }).form!;
    expect(new FormData(formElement).getAll("images")).toEqual(['["/main.jpg","/detail.jpg"]']);
    fireEvent.click(screen.getByRole("button", { name: "重置" }));
    expect(new FormData(formElement).has("images")).toBe(false);
    unmount();

    render(<SerializationForm disabled />);
    const disabledForm = screen.getByLabelText<HTMLInputElement>("图片", {
      selector: 'input[type="file"]'
    }).form!;
    expect(new FormData(disabledForm).has("images")).toBe(false);
  });
});

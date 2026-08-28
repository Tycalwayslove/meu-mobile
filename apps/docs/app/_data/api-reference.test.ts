import { describe, expect, it } from "vitest";

import componentManifest from "../_generated/component-manifest.json";
import { getComponentApiReference, parseApiReferenceModel } from "./api-reference";
import type { ComponentManifestProduct } from "./component-document";

describe("API reference model", () => {
  it("selects public exports, preserves declarations and prioritizes component contracts", () => {
    const result = parseApiReferenceModel(
      {
        members: [
          {
            kind: "EntryPoint",
            name: "",
            members: [
              {
                kind: "TypeAlias",
                name: "ButtonProps",
                docComment: "/**\n * Props for {@link Button}.\n * @public\n */",
                excerptTokens: [{ text: "export type ButtonProps = { loading?: boolean };" }]
              },
              {
                kind: "Function",
                name: "Button",
                excerptTokens: [
                  { text: "export declare function Button(props: ButtonProps): JSX.Element;" }
                ]
              },
              {
                kind: "TypeAlias",
                name: "PrivateType",
                excerptTokens: [{ text: "export type PrivateType = never;" }]
              }
            ]
          }
        ]
      },
      [
        { kind: "type", name: "ButtonProps" },
        { kind: "value", name: "Button" }
      ],
      "Button"
    );

    expect(result.map((entry) => entry.name)).toEqual(["Button", "ButtonProps"]);
    expect(result[1]).toMatchObject({
      description: "Props for Button.",
      kind: "type",
      signature: "export type ButtonProps = { loading?: boolean };"
    });
  });
});

describe("generated API reference integration", () => {
  const products = componentManifest.products as ComponentManifestProduct[];

  it.each(products)("resolves every public export for $slug", (product) => {
    const entries = getComponentApiReference(product);
    expect(new Set(entries.map((entry) => `${entry.kind}:${entry.name}`))).toEqual(
      new Set(product.publicExports.map((entry) => `${entry.kind}:${entry.name}`))
    );
  });

  it("adds generated field, default and event metadata to public Props", () => {
    const button = products.find((product) => product.name === "Button");
    const bottomSheet = products.find((product) => product.name === "BottomSheet");
    expect(button).toBeDefined();
    expect(bottomSheet).toBeDefined();

    const buttonProps = getComponentApiReference(button!).find(
      (entry) => entry.name === "ButtonProps"
    );
    expect(buttonProps).toBeDefined();
    const loadingProperty =
      buttonProps && buttonProps.properties
        ? buttonProps.properties.find((property) => property.name === "loading")
        : undefined;
    expect(loadingProperty).toBeDefined();
    expect(loadingProperty && loadingProperty.description).toContain("busy");
    expect(buttonProps && buttonProps.properties).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          defaultValue: "false",
          name: "loading",
          required: false
        })
      ])
    );

    const bottomSheetProps = getComponentApiReference(bottomSheet!).find(
      (entry) => entry.name === "BottomSheetProps"
    );
    expect(bottomSheetProps && bottomSheetProps.properties).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ event: true, name: "onOpenChange" }),
        expect.objectContaining({ event: false, name: "open" })
      ])
    );
  });
});

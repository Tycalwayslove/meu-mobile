"use client";

import { Children, Fragment, isValidElement, useId } from "react";
import type { ReactNode } from "react";

import { body, footer as footerStyle, header as headerStyle, root } from "./List.css";
import { ListContext } from "./ListContext";
import type { ListProps } from "./types";

const interactiveRoles = new Set([
  "button",
  "checkbox",
  "combobox",
  "link",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "radio",
  "slider",
  "spinbutton",
  "switch",
  "tab",
  "textbox",
  "treeitem"
]);
const interactiveTags = new Set([
  "button",
  "details",
  "embed",
  "iframe",
  "label",
  "object",
  "select",
  "summary",
  "textarea"
]);

type DevelopmentImportMeta = ImportMeta & { env?: { DEV?: boolean } };
type DevelopmentGlobal = typeof globalThis & {
  process?: { env: { NODE_ENV?: string } };
};

function isDevelopmentRuntime() {
  const runtimeProcess = (globalThis as DevelopmentGlobal).process;
  if (runtimeProcess) return runtimeProcess.env.NODE_ENV !== "production";
  const environment = (import.meta as DevelopmentImportMeta).env;
  return Boolean(environment && environment.DEV);
}

function isCellComponentType(type: unknown) {
  if ((typeof type !== "function" && typeof type !== "object") || type === null) return false;
  const namedType = type as { displayName?: string; name?: string };
  return namedType.displayName === "Cell" || namedType.name === "Cell";
}

function containsInteractiveContent(node: ReactNode): boolean {
  let interactive = false;
  Children.forEach(node, (child) => {
    if (interactive || !isValidElement<Record<string, unknown>>(child)) return;
    const childProps = child.props;
    const role = typeof childProps.role === "string" ? childProps.role : "";
    const tabIndex = typeof childProps.tabIndex === "number" ? childProps.tabIndex : -1;
    const intrinsicInteractive =
      typeof child.type === "string" &&
      (interactiveTags.has(child.type) ||
        (child.type === "a" && childProps.href !== undefined) ||
        (child.type === "input" && childProps.type !== "hidden") ||
        ((child.type === "audio" || child.type === "video") && childProps.controls === true));
    if (
      intrinsicInteractive ||
      interactiveRoles.has(role) ||
      childProps.href !== undefined ||
      typeof childProps.onClick === "function" ||
      childProps.contentEditable === true ||
      childProps.contentEditable === "true" ||
      tabIndex >= 0
    ) {
      interactive = true;
      return;
    }
    if (childProps.children !== undefined) {
      interactive = containsInteractiveContent(childProps.children as ReactNode);
    }
  });
  return interactive;
}

function warnForInvalidListChildren(children: ReactNode) {
  Children.forEach(children, (child) => {
    if (child === null || child === undefined || typeof child === "boolean") return;
    if (isValidElement<Record<string, unknown>>(child) && child.type === Fragment) {
      warnForInvalidListChildren(child.props.children as ReactNode);
      return;
    }
    if (isValidElement<Record<string, unknown>>(child) && isCellComponentType(child.type)) {
      const childProps = child.props;
      const interactive = Boolean(
        childProps.href || childProps.clickable || typeof childProps.onClick === "function"
      );
      if (
        interactive &&
        [
          childProps.arrow,
          childProps.description,
          childProps.extra,
          childProps.prefix,
          childProps.suffix,
          childProps.title
        ].some((slot) => containsInteractiveContent(slot as ReactNode))
      ) {
        console.warn(
          "[Meu List] An interactive Cell must not contain nested interactive content. Use a static Cell for nested controls or make the whole row the only action."
        );
      }
      return;
    }
    if (isValidElement<Record<string, unknown>>(child) && child.props.role === "listitem") {
      return;
    }
    console.warn(
      '[Meu List] Every rendered direct child must be a Cell or explicitly declare role="listitem".'
    );
  });
}

/**
 * Renders an accessible group of cells with shared dividers and surface styling.
 *
 * @public
 */
export function List({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  children,
  className,
  divider = "inset",
  footer,
  header,
  mode = "plain",
  ref,
  ...props
}: ListProps) {
  if (isDevelopmentRuntime()) warnForInvalidListChildren(children);
  const generatedHeaderId = `meu-list-header-${useId()}`;
  const resolvedLabelledBy = ariaLabel
    ? undefined
    : ariaLabelledBy || (header !== undefined && header !== null ? generatedHeaderId : undefined);

  return (
    <div
      {...props}
      ref={ref}
      className={className ? `${root} ${className}` : root}
      data-meu-component="list"
      data-mode={mode}
      data-divider={divider}
    >
      {header !== undefined && header !== null ? (
        <div id={generatedHeaderId} className={headerStyle({ mode })} data-meu-list-header>
          {header}
        </div>
      ) : null}
      <div
        className={body({ mode })}
        role="list"
        aria-label={ariaLabel}
        aria-labelledby={resolvedLabelledBy}
        aria-describedby={ariaDescribedBy}
        data-meu-list-body
      >
        <ListContext.Provider value={{ divider, insideList: true }}>
          {children}
        </ListContext.Provider>
      </div>
      {footer !== undefined && footer !== null ? (
        <div className={footerStyle({ mode })} data-meu-list-footer>
          {footer}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { Children, cloneElement, forwardRef, Fragment, isValidElement, useId } from "react";
import type { HTMLAttributes, ReactElement, ReactNode } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { VisuallyHidden } from "../internal/VisuallyHidden";
import {
  description as descriptionClass,
  error as errorClass,
  field,
  label,
  required as requiredClass
} from "./Field.css";
import { FieldContext } from "./FieldContext";

/**
 * Controls how the visible field label names the direct child control.
 *
 * @public
 */
export type FieldLabelAssociation = "auto" | "native" | "aria";

/**
 * Configures a labeled control with optional help, validation, and required-state content.
 *
 * @public
 */
export type FieldProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /**
   * The control rendered by the field. A single direct React element receives the generated
   * accessibility properties; nested layout wrappers must forward the Field context themselves.
   */
  children: ReactNode;
  /**
   * Overrides the generated control id when the direct child does not already provide an `id`.
   * The child's explicit `id` always wins so native label association cannot become disconnected.
   */
  controlId?: string;
  /** Supporting text announced before the validation error. */
  description?: ReactNode;
  /** Validation feedback. Supplying content also marks the control invalid. */
  error?: ReactNode;
  /** Explicitly marks the field invalid even when validation feedback is rendered elsewhere. */
  invalid?: boolean;
  /** Visible label content for the control or composite control. */
  label?: ReactNode;
  /**
   * Selects native `label[for]` or `aria-labelledby` association.
   *
   * `auto` uses native association for direct labelable HTML elements and ARIA association for
   * React components. Choose `native` for a wrapper that forwards `id` and `required` to exactly
   * one native labelable element. Choose `aria` for groups and other composite controls.
   *
   * @defaultValue "auto"
   */
  labelAssociation?: FieldLabelAssociation;
  /** Marks the field as required and propagates native semantics or an accessible fallback. */
  required?: boolean;
  /** Accessible required-state text used when the associated control cannot expose native required semantics. */
  requiredText?: ReactNode;
};

type AssociableChildProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: HTMLAttributes<HTMLElement>["aria-invalid"];
  "aria-label"?: string;
  "aria-labelledby"?: string | undefined;
  "aria-required"?: HTMLAttributes<HTMLElement>["aria-required"];
  contentEditable?: HTMLAttributes<HTMLElement>["contentEditable"];
  id?: string;
  required?: boolean;
  role?: string;
};

const nativeLabelableElements = new Set([
  "button",
  "input",
  "meter",
  "output",
  "progress",
  "select",
  "textarea"
]);

function hasRenderableContent(content: ReactNode): boolean {
  return Children.toArray(content).some((child) => {
    if (typeof child === "string") return child.trim().length > 0;
    if (!isValidElement<{ children?: ReactNode }>(child) || child.type !== Fragment) return true;
    return hasRenderableContent(child.props.children);
  });
}

function mergeIdReferences(...values: Array<string | undefined>): string | undefined {
  const tokens = values.flatMap((value) => (value ? value.trim().split(/\s+/) : []));
  const uniqueTokens = [...new Set(tokens.filter(Boolean))];
  return uniqueTokens.length > 0 ? uniqueTokens.join(" ") : undefined;
}

function getAssociableChild(children: ReactNode): ReactElement<AssociableChildProps> | null {
  if (!isValidElement<AssociableChildProps>(children) || children.type === Fragment) return null;
  const contentEditable = children.props.contentEditable;
  const isContentEditable =
    contentEditable === true || contentEditable === "true" || contentEditable === "plaintext-only";
  if (
    typeof children.type === "string" &&
    !nativeLabelableElements.has(children.type) &&
    !children.props.role &&
    !isContentEditable
  ) {
    return null;
  }
  return children;
}

function resolveLabelAssociation(
  association: FieldLabelAssociation,
  child: ReactElement<AssociableChildProps> | null
): Exclude<FieldLabelAssociation, "auto"> {
  if (association !== "auto") return association;
  return child && typeof child.type === "string" && nativeLabelableElements.has(child.type)
    ? "native"
    : "aria";
}

/**
 * Composes one control with its visible label, supporting text, validation feedback and shared
 * accessibility state. The ref points to the root `HTMLDivElement`, while the child keeps its own
 * native or component ref.
 *
 * @public
 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  {
    children,
    className,
    controlId: controlIdProp,
    description,
    error,
    invalid = false,
    label: labelContent,
    labelAssociation = "auto",
    required = false,
    requiredText: requiredTextProp,
    ...rootProps
  },
  ref
) {
  const config = useMeuConfig();
  const generatedId = useId();
  const child = getAssociableChild(children);
  const rootId = rootProps.id;
  const childControlId = child ? child.props.id : undefined;
  const controlId =
    childControlId || controlIdProp || (rootId ? `${rootId}-control` : `meu-field-${generatedId}`);
  const hasLabel = hasRenderableContent(labelContent);
  const hasDescription = hasRenderableContent(description);
  const hasError = hasRenderableContent(error);
  const labelId = hasLabel ? `${controlId}-label` : undefined;
  const descriptionId = hasDescription ? `${controlId}-description` : undefined;
  const errorId = hasError ? `${controlId}-error` : undefined;
  const resolvedInvalid = invalid || hasError;
  const resolvedAssociation = resolveLabelAssociation(labelAssociation, child);
  const childHasRequiredSemantics = Boolean(
    child &&
    (child.props.required === true ||
      child.props["aria-required"] === true ||
      child.props["aria-required"] === "true")
  );
  const requiredDescriptionId =
    required && resolvedAssociation === "aria" && !childHasRequiredSemantics
      ? `${controlId}-required`
      : undefined;
  const requiredText =
    requiredTextProp !== undefined
      ? requiredTextProp
      : config.locale === "en-US"
        ? "Required"
        : "必填";
  const fieldDescribedBy = mergeIdReferences(requiredDescriptionId, descriptionId, errorId);

  let resolvedChildren = children;
  if (child) {
    const childDescribedBy = mergeIdReferences(child.props["aria-describedby"], fieldDescribedBy);
    const childAriaLabel = child.props["aria-label"];
    const hasExplicitAriaLabel = Boolean(childAriaLabel && childAriaLabel.trim());
    const childLabelledBy = hasExplicitAriaLabel
      ? undefined
      : resolvedAssociation === "aria" || child.props["aria-labelledby"] !== undefined
        ? mergeIdReferences(child.props["aria-labelledby"], labelId)
        : child.props["aria-labelledby"];
    const accessibilityProps: AssociableChildProps = { id: controlId };

    if (childDescribedBy) accessibilityProps["aria-describedby"] = childDescribedBy;
    if (resolvedInvalid) accessibilityProps["aria-invalid"] = true;
    accessibilityProps["aria-labelledby"] = childLabelledBy;

    if (required) {
      if (resolvedAssociation === "native") accessibilityProps.required = true;
    }

    resolvedChildren = cloneElement(child, accessibilityProps);
  }

  return (
    <FieldContext.Provider
      value={{
        controlId,
        describedBy: fieldDescribedBy,
        invalid: resolvedInvalid,
        labelId,
        required
      }}
    >
      <div
        {...rootProps}
        ref={ref}
        className={className ? `${field} ${className}` : field}
        data-invalid={resolvedInvalid ? "true" : "false"}
        data-meu-component="field"
        data-required={required ? "true" : "false"}
      >
        {hasLabel ? (
          resolvedAssociation === "native" ? (
            <label className={label} htmlFor={controlId} id={labelId} data-meu-slot="label">
              {labelContent}
              {required ? (
                <span className={requiredClass} aria-hidden="true">
                  *
                </span>
              ) : null}
            </label>
          ) : (
            <span className={label} id={labelId} data-meu-slot="label">
              {labelContent}
              {required ? (
                <span className={requiredClass} aria-hidden="true">
                  *
                </span>
              ) : null}
            </span>
          )
        ) : null}
        {requiredDescriptionId ? (
          <VisuallyHidden id={requiredDescriptionId}>{requiredText}</VisuallyHidden>
        ) : null}
        {resolvedChildren}
        {hasDescription ? (
          <p className={descriptionClass} id={descriptionId} data-meu-slot="description">
            {description}
          </p>
        ) : null}
        {hasError ? (
          <p className={errorClass} id={errorId} role="alert" data-meu-slot="error">
            {error}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
});

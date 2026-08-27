"use client";

import { useId } from "react";
import type { ReactNode } from "react";

import { description as descriptionClass, error as errorClass, field, label, required as requiredClass } from "./Field.css";
import { FieldContext } from "./FieldContext";

export type FieldProps = {
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  error?: ReactNode;
  label?: ReactNode;
  required?: boolean;
};

export function Field({
  children,
  className,
  description,
  error,
  label: labelContent,
  required = false
}: FieldProps) {
  const generatedId = useId();
  const controlId = `meu-field-${generatedId}`;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <FieldContext.Provider value={{ controlId, describedBy, invalid: Boolean(error) }}>
      <div className={className ? `${field} ${className}` : field} data-meu-component="field">
        {labelContent ? (
          <label className={label} htmlFor={controlId}>
            {labelContent}
            {required ? (
              <span className={requiredClass} aria-hidden="true">
                *
              </span>
            ) : null}
          </label>
        ) : null}
        {children}
        {description ? (
          <p className={descriptionClass} id={descriptionId}>
            {description}
          </p>
        ) : null}
        {error ? (
          <p className={errorClass} id={errorId} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

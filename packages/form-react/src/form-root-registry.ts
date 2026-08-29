const formRoots = new WeakMap<object, HTMLFormElement>();

export function registerMeuFormRoot(form: object, element: HTMLFormElement) {
  formRoots.set(form, element);
}

export function unregisterMeuFormRoot(form: object, element: HTMLFormElement) {
  if (formRoots.get(form) === element) formRoots.delete(form);
}

export function getMeuFormRoot(form: object) {
  return formRoots.get(form);
}

export function firstFieldInMeuForm(form: object, fields: ReadonlySet<string>) {
  if (fields.size === 0 || typeof document === "undefined") return undefined;
  const queryRoot = getMeuFormRoot(form) || document;
  for (const element of queryRoot.querySelectorAll<HTMLElement>("[data-meu-form-field], [name]")) {
    const name = element.getAttribute("data-meu-form-field") || element.getAttribute("name");
    const normalizedName = name ? name.replace(/\[(\d+)\]/g, ".$1") : "";
    if (!name || (!fields.has(name) && !fields.has(normalizedName))) continue;
    const candidates = element.hasAttribute("data-meu-form-field")
      ? element.querySelectorAll<HTMLElement>("button, input, select, textarea, [tabindex]")
      : [element];
    const hasEnabledFocusTarget = Array.from(candidates).some(
      (candidate) =>
        !candidate.matches(":disabled, input[type='hidden'], [aria-disabled='true']") &&
        !candidate.closest("[inert], [aria-hidden='true']")
    );
    if (!hasEnabledFocusTarget) continue;
    return fields.has(name) ? name : normalizedName;
  }
  return undefined;
}

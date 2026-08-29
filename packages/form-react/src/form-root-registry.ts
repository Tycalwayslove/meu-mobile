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

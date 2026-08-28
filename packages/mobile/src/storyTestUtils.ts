export function nextStoryFrame() {
  return new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
}

export async function waitForStory(predicate: () => boolean, message: string, timeout = 2_000) {
  const deadline = Date.now() + timeout;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new window.Error(message);
    await nextStoryFrame();
  }
}

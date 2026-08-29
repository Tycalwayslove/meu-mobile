import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const originalConsoleError = console.error;
const reactTestingLibrarySyncActLimitation =
  /A component suspended inside an `act` scope, but the `act` call was not awaited/;
const forbiddenReactDiagnostic =
  /not wrapped in act|act call was not awaited|hydration failed|a tree hydrated but some attributes|each child in a list should have a unique|encountered two children with the same key|cannot update a component while rendering/i;

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation((...arguments_: unknown[]) => {
    const message = arguments_.map(String).join(" ");
    // React Testing Library's synchronous render/cleanup cannot await React 19's act thenable
    // (testing-library/react-testing-library#1385). Virtualizers can leave continuation work in
    // that sync scope even though their observable state is awaited, so suppress only this
    // framework-level diagnostic; all other unawaited-act diagnostics remain fatal.
    if (reactTestingLibrarySyncActLimitation.test(message)) return;
    if (forbiddenReactDiagnostic.test(message)) {
      throw new Error(`Unexpected React diagnostic: ${message}`);
    }
    originalConsoleError(...arguments_);
  });
});

afterEach(cleanup);

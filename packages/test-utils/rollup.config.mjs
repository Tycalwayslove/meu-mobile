import { createLibraryConfig } from "../../tooling/rollup-config/index.mjs";

export default createLibraryConfig({
  input: "src/index.tsx",
  external: ["react", "react-dom", "react/jsx-runtime"]
});

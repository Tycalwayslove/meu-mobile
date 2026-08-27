import { createLibraryConfig } from "../../tooling/rollup-config/index.mjs";

export default createLibraryConfig({
  external: ["react", "react-dom", "react/jsx-runtime"],
  styles: true
});

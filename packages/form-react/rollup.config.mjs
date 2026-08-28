import { createLibraryConfig } from "../../tooling/rollup-config/index.mjs";

export default createLibraryConfig({
  input: ["src/index.ts", "src/server.ts"],
  external: ["react", "react/jsx-runtime", "react-hook-form", "zod", "@hookform/resolvers/zod"]
});

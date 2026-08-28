import type { MeuConfig } from "../ConfigProvider";
import { motionReduced, motionSystem } from "../ConfigProvider/ConfigProvider.css";

/** Copies provider values that DOM portals cannot inherit from their logical React parent. */
export function getConfigBoundaryProps(config: MeuConfig) {
  return {
    className: config.motion === "reduced" ? motionReduced : motionSystem,
    dir: config.dir,
    lang: config.locale,
    "data-meu-motion": config.motion,
    "data-meu-theme": config.theme
  } as const;
}

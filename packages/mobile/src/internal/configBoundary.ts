import type { MeuConfig } from "../ConfigProvider";
import { motionReduced, motionSystem, themeBoundary } from "../ConfigProvider/ConfigProvider.css";

/** Copies provider values that DOM portals cannot inherit from their logical React parent. */
export function getConfigBoundaryProps(config: MeuConfig) {
  const motionClassName = config.motion === "reduced" ? motionReduced : motionSystem;

  return {
    className: `${themeBoundary} ${motionClassName}`,
    dir: config.dir,
    lang: config.locale,
    "data-meu-motion": config.motion,
    "data-meu-theme": config.theme
  } as const;
}
